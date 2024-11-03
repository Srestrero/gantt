import date_utils from './date_utils';
import { $, createSVG } from './svg_utils';
import Bar from './bar';
import Arrow from './arrow';
import Popup from './popup';
import { setup_wrapper } from './gantt/wrapper';
import { VIEW_MODE, VIEW_MODE_PADDING, DEFAULT_OPTIONS } from './gantt/consts';

import './gantt.css';
export default class Gantt {
    constructor(wrapper, tasks, options) {
        this.setup(wrapper,tasks,options);
    }

    setup(wrapper,tasks,options){
        const elements = setup_wrapper(wrapper); 
        // Asignamos los elementos al contexto de la clase
        this.$svg = elements.$svg;
        this.$container = elements.$container;
        this.$popup_wrapper = elements.$popup_wrapper;
        
        this.setup_options(options);
        this.setup_tasks(tasks);
        // initialize with default view mode
        this.change_view_mode();
        this.bind_events();
    }

    setup_options(options) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        if (!options.view_mode_padding) options.view_mode_padding = {};
        for (let [key, value] of Object.entries(options.view_mode_padding)) {
            if (typeof value === 'string') {
                // Configure for single value given
                options.view_mode_padding[key] = [value, value];
            }
        }

        this.options.view_mode_padding = {
            ...VIEW_MODE_PADDING,
            ...options.view_mode_padding,
        };
    }

    setup_tasks(tasks) {
        // prepare tasks
        this.tasks = tasks.map((task, i) => {
            // convert to Date objects
            task._start = date_utils.parse(task.start);
            if (task.end === undefined && task.duration !== undefined) {
                task.end = task._start;
                let durations = task.duration.split(' ');

                durations.forEach((tmpDuration) => {
                    let { duration, scale } =
                        date_utils.parse_duration(tmpDuration);
                    task.end = date_utils.add(task.end, duration, scale);
                });
            }
            task._end = date_utils.parse(task.end);
            let diff = date_utils.diff(task._end, task._start, 'year');
            if (diff < 0) {
                throw Error(
                    "start of task can't be after end of task: in task #, " +
                    (i + 1),
                );
            }
            // make task invalid if duration too large
            if (date_utils.diff(task._end, task._start, 'year') > 10) {
                task.end = null;
            }

            // cache index
            task._index = i;

            // invalid dates
            if (!task.start && !task.end) {
                const today = date_utils.today();
                task._start = today;
                task._end = date_utils.add(today, 2, 'day');
            }

            if (!task.start && task.end) {
                task._start = date_utils.add(task._end, -2, 'day');
            }

            if (task.start && !task.end) {
                task._end = date_utils.add(task._start, 2, 'day');
            }

            // if hours is not set, assume the last day is full day
            // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
            const task_end_values = date_utils.get_date_values(task._end);
            if (task_end_values.slice(3).every((d) => d === 0)) {
                task._end = date_utils.add(task._end, 1439, 'minute');
            }

            // invalid flag
            if (!task.start || !task.end) {
                task.invalid = true;
            }

            // dependencies
            if (typeof task.dependencies === 'string' || !task.dependencies) {
                let deps = [];
                if (task.dependencies) {
                    deps = task.dependencies
                        .split(',')
                        .map((d) => d.trim().replaceAll(' ', '_'))
                        .filter((d) => d);
                }
                task.dependencies = deps;
            }

            // uids
            if (!task.id) {
                task.id = generate_id(task);
            }
            // else if (typeof task.id === 'string') {
            //     task.id = task.id.replaceAll(' ', '_');
            // } 
            else {
                task.id = `${task.id}`;
            }

            task.color = task.color;
            return task;
        });

        this.setup_dependencies();
        this.setup_inverse_dependencies();
    }

    setup_dependencies() {
        this.dependency_map = {};
        for (let t of this.tasks) {
            for (let [dependencyId, type, lag, forcedLag] of t.dependencies) {
                if (!this.dependency_map[t.id]) {
                    this.dependency_map[t.id] = [];
                }
                this.dependency_map[t.id].push({
                    taskId: dependencyId,
                    type: type,
                    lag: lag,
                    forcedLag: forcedLag
                });
            }
        }
    }

    setup_inverse_dependencies() {
        this.inverse_dependency_map = {};
        for (let t of this.tasks) {
            for (let [dependencyId, type, lag, forcedLag] of t.dependencies) {
                if (!this.inverse_dependency_map[dependencyId]) {
                    this.inverse_dependency_map[dependencyId] = [];
                }
                this.inverse_dependency_map[dependencyId].push({
                    taskId: t.id,
                    type: type,
                    lag: lag,
                    forcedLag: forcedLag
                });
            }
        }
    }


    refresh(tasks) {
        this.setup_tasks(tasks);
        this.change_view_mode();
    }

    change_view_mode(mode = this.options.view_mode) {
        this.update_view_scale(mode);
        this.setup_dates();
        this.render();
        // fire viewmode_change event
        this.trigger_event('view_change', [mode]);
    }

    update_view_scale(view_mode) {
        this.options.view_mode = view_mode;
        if (view_mode === VIEW_MODE.HOUR) {
            this.options.step = 24 / 24;
            this.options.column_width = 30;
        } else if (view_mode === VIEW_MODE.DAY) {
            this.options.step = 24;
            this.options.column_width = 30;
        } else if (view_mode === VIEW_MODE.HALF_DAY) {
            this.options.step = 24 / 2;
            this.options.column_width = 30;
        } else if (view_mode === VIEW_MODE.QUARTER_DAY) {
            this.options.step = 24 / 4;
            this.options.column_width = 30;
        } else if (view_mode === VIEW_MODE.WEEK) {
            this.options.step = 24 * 7;
            this.options.column_width = 75;
        } else if (view_mode === VIEW_MODE.MONTH) {
            this.options.step = 24 * 30;
            this.options.column_width = 62;
        } else if (view_mode === VIEW_MODE.YEAR) {
            this.options.step = 24 * 365;
            this.options.column_width = 62;
        }
    }

    setup_dates() {
        this.setup_gantt_dates();
        this.setup_date_values();
    }

    setup_gantt_dates() {
        this.gantt_start = this.gantt_end = null;

        for (let task of this.tasks) {
            // set global start and end date
            if (!this.gantt_start || task._start < this.gantt_start) {
                this.gantt_start = task._start;
            }
            if (!this.gantt_end || task._end > this.gantt_end) {
                this.gantt_end = task._end;
            }
        }
        let gantt_start, gantt_end;
        if (!this.gantt_start) gantt_start = new Date();
        else gantt_start = date_utils.start_of(this.gantt_start, 'day');
        if (!this.gantt_end) gantt_end = new Date();
        else gantt_end = date_utils.start_of(this.gantt_end, 'day');

        // add date padding on both sides
        let viewKey;
        for (let [key, value] of Object.entries(VIEW_MODE)) {
            if (value === this.options.view_mode) {
                viewKey = key;
            }
        }
        const [padding_start, padding_end] = this.options.view_mode_padding[
            viewKey
        ].map(date_utils.parse_duration);
        gantt_start = date_utils.add(
            gantt_start,
            -padding_start.duration,
            padding_start.scale,
        );

        let format_string;
        if (this.view_is(VIEW_MODE.YEAR)) {
            format_string = 'YYYY';
        } else if (this.view_is(VIEW_MODE.MONTH)) {
            format_string = 'YYYY-MM';
        } else if (this.view_is(VIEW_MODE.DAY)) {
            format_string = 'YYYY-MM-DD';
        } else {
            format_string = 'YYYY-MM-DD HH';
        }
        this.gantt_start = date_utils.parse(
            date_utils.format(gantt_start, format_string),
        );
        this.gantt_start.setHours(0, 0, 0, 0);
        this.gantt_end = date_utils.add(
            gantt_end,
            padding_end.duration,
            padding_end.scale,
        );
    }

    setup_date_values() {
        this.dates = [];
        let cur_date = null;

        while (cur_date === null || cur_date < this.gantt_end) {
            if (!cur_date) {
                cur_date = date_utils.clone(this.gantt_start);
            } else {
                if (this.view_is(VIEW_MODE.YEAR)) {
                    cur_date = date_utils.add(cur_date, 1, 'year');
                } else if (this.view_is(VIEW_MODE.MONTH)) {
                    cur_date = date_utils.add(cur_date, 1, 'month');
                } else {
                    cur_date = date_utils.add(
                        cur_date,
                        this.options.step,
                        'hour',
                    );
                }
            }
            this.dates.push(cur_date);
        }
    }

    bind_events() {
        if (this.options.readonly) return;
        this.bind_grid_click();
        this.bind_bar_events();
    }

    render() {
        this.clear();
        this.setup_layers();
        this.make_grid();
        this.make_dates();
        this.make_bars();
        this.make_grid_extras();
        this.make_arrows();
        this.map_arrows_on_bars();
        this.set_width();
        this.set_scroll_position(this.options.scroll_to);
        this.update_button_position();
    }

    setup_layers() {
        this.layers = {};
        const layers = ['grid', 'arrow', 'bar', 'details'];
        // const layers = ['grid', 'arrow', 'bar', 'details','progress'];
        // make group layers
        for (let layer of layers) {
            this.layers[layer] = createSVG('g', {
                class: layer,
                append_to: this.$svg,
            });
        }
    }

    make_grid() {
        this.make_grid_background();
        this.make_grid_rows();
        this.make_grid_header();
    }

    make_grid_extras() {
        this.make_grid_highlights();
        this.make_grid_ticks();
    }

    make_grid_background() {
        const grid_width = this.dates.length * this.options.column_width;
        const grid_height =
            this.options.header_height +
            this.options.padding +
            (this.options.bar_height + this.options.padding) *
            this.tasks.length;

        createSVG('rect', {
            x: 0,
            y: 0,
            width: grid_width,
            height: grid_height,
            class: 'grid-background',
            append_to: this.$svg,
        });

        $.attr(this.$svg, {
            height: grid_height + this.options.padding + 100,
            width: '100%',
        });
    }

    make_grid_rows() {
        const rows_layer = createSVG('g', { append_to: this.layers.grid });

        const row_width = this.dates.length * this.options.column_width;
        const row_height = this.options.bar_height + this.options.padding;

        let row_y = this.options.header_height + this.options.padding / 2;

        for (let _ of this.tasks) {
            createSVG('rect', {
                x: 0,
                y: row_y,
                width: row_width,
                height: row_height,
                class: 'grid-row',
                append_to: rows_layer,
            });
            if (
                this.options.lines === 'both' ||
                this.options.lines === 'horizontal'
            ) {
            }

            row_y += this.options.bar_height + this.options.padding;
        }
    }

    make_grid_header() {
        let $header = document.createElement('div');
        $header.style.height = this.options.header_height + 10 + 'px';
        $header.style.width =
            this.dates.length * this.options.column_width + 'px';
        $header.classList.add('grid-header');
        this.$header = $header;
        this.$container.appendChild($header);

        let $upper_header = document.createElement('div');
        $upper_header.classList.add('upper-header');
        this.$upper_header = $upper_header;
        this.$header.appendChild($upper_header);

        let $lower_header = document.createElement('div');
        $lower_header.classList.add('lower-header');
        this.$lower_header = $lower_header;
        this.$header.appendChild($lower_header);

        this.make_side_header();
    }

    make_side_header() {
        let $side_header = document.createElement('div');
        $side_header.classList.add('side-header');

        // Create view mode change select
        if (this.options.view_mode_select) {
            const $select = document.createElement('select');
            $select.classList.add('viewmode-select');

            const $el = document.createElement('option');
            $el.selected = true;
            $el.disabled = true;
            $el.textContent = 'Mode';
            $select.appendChild($el);

            for (const key in VIEW_MODE) {
                const $option = document.createElement('option');
                $option.value = VIEW_MODE[key];
                $option.textContent = VIEW_MODE[key];
                $select.appendChild($option);
            }
            // $select.value = this.options.view_mode
            $select.addEventListener(
                'change',
                function () {
                    this.change_view_mode($select.value);
                }.bind(this),
            );
            $side_header.appendChild($select);
        }

        // Create today button
        if (this.options.today_button) {
            let $today_button = document.createElement('button');
            $today_button.classList.add('today-button');
            $today_button.textContent = 'Today';
            $today_button.onclick = this.scroll_today.bind(this);
            $side_header.appendChild($today_button);
            this.$today_button = $today_button;
        }

        this.$header.appendChild($side_header);
        this.$side_header = $side_header;

        window.addEventListener(
            'scroll',
            this.update_button_position.bind(this),
        );
        window.addEventListener(
            'resize',
            this.update_button_position.bind(this),
        );
    }

    update_button_position() {
        const containerRect = this.$container.getBoundingClientRect();
        const buttonRect = this.$side_header.getBoundingClientRect();
        const { left, y } = this.$header.getBoundingClientRect();

        // Check if the button is scrolled out of the container vertically
        if (
            buttonRect.top < containerRect.top ||
            buttonRect.bottom > containerRect.bottom
        ) {
            this.$side_header.style.position = 'absolute';
            this.$side_header.style.top = `${containerRect.scrollTop + buttonRect.top}px`;
        } else {
            this.$side_header.style.position = 'fixed';
            this.$side_header.style.top = y + 10 + 'px';
        }
        const width = Math.min(
            this.$header.clientWidth,
            this.$container.clientWidth,
        );

        this.$side_header.style.left =
            left +
            this.$container.scrollLeft +
            width -
            this.$side_header.clientWidth +
            'px';

        if (this.$today_button) {
            this.$today_button.style.left = `${containerRect.left + 20}px`;
        }
    }

    make_grid_ticks() {
        if (!['both', 'vertical', 'horizontal'].includes(this.options.lines))
            return;
        let tick_x = 0;
        let tick_y = this.options.header_height + this.options.padding / 2;
        let tick_height =
            (this.options.bar_height + this.options.padding) *
            this.tasks.length;

        let $lines_layer = createSVG('g', {
            class: 'lines_layer',
            append_to: this.layers.grid,
        });

        let row_y = this.options.header_height + this.options.padding / 2;

        const row_width = this.dates.length * this.options.column_width;
        const row_height = this.options.bar_height + this.options.padding;
        if (this.options.lines !== 'vertical') {
            for (let _ of this.tasks) {
                createSVG('line', {
                    x1: 0,
                    y1: row_y + row_height,
                    x2: row_width,
                    y2: row_y + row_height,
                    class: 'row-line',
                    append_to: $lines_layer,
                });
                row_y += row_height;
            }
        }
        if (this.options.lines === 'horizontal') return;
        for (let date of this.dates) {
            let tick_class = 'tick';
            // thick tick for monday
            if (this.view_is(VIEW_MODE.DAY) && date.getDate() === 1) {
                tick_class += ' thick';
            }
            // thick tick for first week
            if (
                this.view_is(VIEW_MODE.WEEK) &&
                date.getDate() >= 1 &&
                date.getDate() < 8
            ) {
                tick_class += ' thick';
            }
            // thick ticks for quarters
            if (this.view_is(VIEW_MODE.MONTH) && date.getMonth() % 3 === 0) {
                tick_class += ' thick';
            }

            createSVG('path', {
                d: `M ${tick_x} ${tick_y} v ${tick_height}`,
                class: tick_class,
                append_to: this.layers.grid,
            });

            if (this.view_is(VIEW_MODE.MONTH)) {
                tick_x +=
                    (date_utils.get_days_in_month(date) *
                        this.options.column_width) /
                    30;
            } else {
                tick_x += this.options.column_width;
            }
        }
    }

    highlightWeekends() {
        if (!this.view_is('Day') && !this.view_is('Half Day')) return;

        const weekDays = this.options.nonWorkingDays.weekDays;
        const especialDays = this.options.nonWorkingDays.especialDays;

        for (
            let d = new Date(this.gantt_start);
            d <= this.gantt_end;
            d.setDate(d.getDate() + 1)
        ) {
            const isWeekend = weekDays.includes(d.getDay());
            const isEspecialDay = especialDays.includes(date_utils.formatDateToYMD(d));

            // Si es fin de semana o día especial
            if (isWeekend || isEspecialDay) {
                const x =
                    (date_utils.diff(d, this.gantt_start, 'hour') /
                        this.options.step) *
                    this.options.column_width;
                const height =
                    (this.options.bar_height + this.options.padding) *
                    this.tasks.length;
                createSVG('rect', {
                    x,
                    y: this.options.header_height + this.options.padding / 2,
                    width:
                        (this.view_is('Day') ? 1 : 2) *
                        this.options.column_width,
                    height,
                    class: 'holiday-highlight',
                    append_to: this.layers.grid,
                });
            }
        }
    }

    //compute the horizontal x distance
    computeGridHighlightDimensions(view_mode) {
        let x = this.options.column_width / 2;

        if (this.view_is(VIEW_MODE.DAY)) {
            let today = date_utils.today();
            return {
                x:
                    x +
                    (date_utils.diff(today, this.gantt_start, 'hour') /
                        this.options.step) *
                    this.options.column_width,
                date: today,
            };
        }

        for (let date of this.dates) {
            const todayDate = new Date();
            const startDate = new Date(date);
            const endDate = new Date(date);
            switch (view_mode) {
                case VIEW_MODE.WEEK:
                    endDate.setDate(date.getDate() + 7);
                    break;
                case VIEW_MODE.MONTH:
                    endDate.setMonth(date.getMonth() + 1);
                    break;
                case VIEW_MODE.YEAR:
                    endDate.setFullYear(date.getFullYear() + 1);
                    break;
            }
            if (todayDate >= startDate && todayDate <= endDate) {
                return { x, date: startDate };
            } else {
                x += this.options.column_width;
            }
        }
    }

    make_grid_highlights() {
        if (this.options.highlight_weekend) this.highlightWeekends();
        // highlight today's | week's | month's | year's
        if (
            this.view_is(VIEW_MODE.DAY) ||
            this.view_is(VIEW_MODE.WEEK) ||
            this.view_is(VIEW_MODE.MONTH) ||
            this.view_is(VIEW_MODE.YEAR)
        ) {
            // Used as we must find the _end_ of session if view is not Day
            const { x: left, date } = this.computeGridHighlightDimensions(
                this.options.view_mode,
            );
            if (!this.dates.find((d) => d.getTime() == date.getTime())) return;
            const top = this.options.header_height + this.options.padding / 2;
            const height =
                (this.options.bar_height + this.options.padding) *
                this.tasks.length;
            this.$current_highlight = this.create_el({
                top,
                left,
                height,
                classes: 'current-highlight',
                append_to: this.$container,
            });
            let $today = document.getElementById(
                date_utils.format(date).replaceAll(' ', '_'),
            );
            if ($today) {
                $today.classList.add('current-date-highlight');
                // $today.style.top = +$today.style.top.slice(0, -2) - 4 + 'px';
                // $today.style.left = +$today.style.left.slice(0, -2) - 8 + 'px';
            }
        }
    }

    create_el({ left, top, width, height, id, classes, append_to }) {
        let $el = document.createElement('div');
        $el.classList.add(classes);
        $el.style.top = top + 'px';
        $el.style.left = left + 'px';
        if (id) $el.id = id;
        if (width) { $el.style.width = height + 'px' } else { $el.style.width = '38px' };
        if (height) { $el.style.height = height + 'px' } else ($el.style.height = '30px');
        append_to.appendChild($el);
        return $el;
    }

    make_dates() {
        this.upper_texts_x = {};
        this.get_dates_to_draw().forEach((date, i) => {
            let $lower_text = this.create_el({
                left: date.lower_x,
                top: date.lower_y - 10,
                id: date.formatted_date,
                classes: 'lower-text',
                append_to: this.$lower_header,
            });
            let options = this.options['on_date_click']
            $lower_text.addEventListener("click", function chamo() {
                if (options) {
                    options.apply(null, [date]);
                }
                else {

                }
            })

            $lower_text.innerText = date.lower_text;
            $lower_text.style.left =
                +$lower_text.style.left.slice(0, -2) + 'px';

            if (date.upper_text) {
                this.upper_texts_x[date.upper_text] = date.upper_x;
                let $upper_text = document.createElement('div');
                $upper_text.classList.add('upper-text');
                $upper_text.style.left = date.upper_x + 'px';
                $upper_text.style.top = date.upper_y + 'px';
                $upper_text.innerText = date.upper_text;
                this.$upper_header.appendChild($upper_text);

                // remove out-of-bound dates
                if (date.upper_x > this.layers.grid.getBBox().width) {
                    $upper_text.remove();
                }
            }
        });
    }

    get_dates_to_draw() {
        let last_date = null;
        const dates = this.dates.map((date, i) => {
            const d = this.get_date_info(date, last_date, i);
            last_date = d;
            return d;
        });
        return dates;
    }

    get_date_info(date, last_date_info) {
        let last_date = last_date_info
            ? last_date_info.date
            : date_utils.add(date, 1, 'day');
        const date_text = {
            Hour_lower: date_utils.format(date, 'HH', this.options.language),
            'Quarter Day_lower': date_utils.format(
                date,
                'HH',
                this.options.language,
            ),
            'Half Day_lower': date_utils.format(
                date,
                'HH',
                this.options.language,
            ),
            Day_lower:
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, 'D', this.options.language)
                    : '',
            Week_lower:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'D MMM', this.options.language)
                    : date_utils.format(date, 'D', this.options.language),
            Month_lower: date_utils.format(date, 'MMMM', this.options.language),
            Year_lower: date_utils.format(date, 'YYYY', this.options.language),
            Hour_upper:
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, 'D MMMM', this.options.language)
                    : '',
            'Quarter Day_upper':
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, 'D MMM', this.options.language)
                    : '',
            'Half Day_upper':
                date.getDate() !== last_date.getDate()
                    ? date.getMonth() !== last_date.getMonth()
                        ? date_utils.format(
                            date,
                            'D MMM',
                            this.options.language,
                        )
                        : date_utils.format(date, 'D', this.options.language)
                    : '',
            Day_upper:
                date.getMonth() !== last_date.getMonth() || !last_date_info
                    ? date_utils.format(date, 'MMMM', this.options.language)
                    : '',
            Week_upper:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'MMMM', this.options.language)
                    : '',
            Month_upper:
                date.getFullYear() !== last_date.getFullYear()
                    ? date_utils.format(date, 'YYYY', this.options.language)
                    : '',
            Year_upper:
                date.getFullYear() !== last_date.getFullYear()
                    ? date_utils.format(date, 'YYYY', this.options.language)
                    : '',
        };
        let column_width = this.view_is(VIEW_MODE.MONTH)
            ? (date_utils.get_days_in_month(date) * this.options.column_width) /
            30
            : this.options.column_width;
        const base_pos = {
            x: last_date_info
                ? last_date_info.base_pos_x + last_date_info.column_width
                : 0,
            lower_y: this.options.header_height - 20,
            upper_y: this.options.header_height - 50,
        };
        const x_pos = {
            Hour_lower: column_width / 2,
            Hour_upper: column_width * 12,
            'Quarter Day_lower': column_width / 2,
            'Quarter Day_upper': column_width * 2,
            'Half Day_lower': column_width / 2,
            'Half Day_upper': column_width,
            Day_lower: column_width / 2,
            Day_upper: column_width / 2,
            Week_lower: column_width / 2,
            Week_upper: (column_width * 4) / 2,
            Month_lower: column_width / 2,
            Month_upper: column_width / 2,
            Year_lower: column_width / 2,
            Year_upper: (column_width * 30) / 2,
        };
        return {
            date,
            formatted_date: date_utils.format(date).replaceAll(' ', '_'),
            column_width,
            base_pos_x: base_pos.x,
            upper_text: this.options.lower_text
                ? this.options.upper_text(
                    date,
                    this.options.view_mode,
                    date_text[`${this.options.view_mode}_upper`],
                )
                : date_text[`${this.options.view_mode}_upper`],
            lower_text: this.options.lower_text
                ? this.options.lower_text(
                    date,
                    this.options.view_mode,
                    date_text[`${this.options.view_mode}_lower`],
                )
                : date_text[`${this.options.view_mode}_lower`],
            upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
            upper_y: base_pos.upper_y,
            lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
            lower_y: base_pos.lower_y,
        };
    }

    make_bars() {
        this.bars = this.tasks.map((task) => {
            const bar = new Bar(this, task);
            this.layers.bar.appendChild(bar.group);
            return bar;
        });
    }

    make_arrows() {
        this.arrows = [];
        for (let task of this.tasks) {
            let arrows = [];
            arrows = task.dependencies
                .map((task_id) => {
                    const dependency = this.get_task(task_id);
                    if (!dependency) return;
                    const arrow = new Arrow(
                        this,
                        this.bars[dependency._index], // from_task
                        this.bars[task._index], // to_task
                    );
                    this.layers.arrow.appendChild(arrow.element);
                    return arrow;
                })
                .filter(Boolean); // filter falsy values
            this.arrows = this.arrows.concat(arrows);
        }
    }

    map_arrows_on_bars() {
        for (let bar of this.bars) {
            bar.arrows = this.arrows.filter((arrow) => {
                return (
                    arrow.from_task.task.id === bar.task.id ||
                    arrow.to_task.task.id === bar.task.id
                );
            });
        }
    }

    set_width() {
        const cur_width = this.$svg.getBoundingClientRect().width;
        const actual_width = this.$svg.querySelector('.grid .grid-row')
            ? this.$svg.querySelector('.grid .grid-row').getAttribute('width')
            : 0;
        if (cur_width < actual_width) {
            this.$svg.setAttribute('width', actual_width);
        }
    }

    set_scroll_position(date) {
        if (!date || date === 'start') {
            date = this.gantt_start;
        } else if (date === 'today') {
            return this.scroll_today();
        } else if (typeof date === 'string') {
            date = date_utils.parse(date);
        }

        const parent_element = this.$svg.parentElement;
        if (!parent_element) return;

        const hours_before_first_task =
            date_utils.diff(date, this.gantt_start, 'hour') + 24;

        const scroll_pos =
            (hours_before_first_task / this.options.step) *
            this.options.column_width -
            this.options.column_width;
        parent_element.scrollTo({ left: scroll_pos, behavior: 'smooth' });
    }

    scroll_today() {
        this.set_scroll_position(new Date());
    }

    bind_grid_click() {
        $.on(this.$svg, 'click', '.grid-row, .grid-header', () => {
            this.unselect_all();
            this.hide_popup();
        });
    }

    bind_bar_events() {
        let is_dragging = false;
        let is_resizing_left = false;
        let is_resizing_right = false;
        let x_on_start = 0;
        let x_on_scroll_start = 0;
        let y_on_start = 0;
        let parent_bar_id = null;
        let bars = []; // instanceof Bar
        let parent_bar;
        let childlren_bars = [];
        this.bar_being_dragged = null;

        function action_in_progress() {
            return is_dragging || is_resizing_left || is_resizing_right;
        }

        this.$svg.onclick = (e) => {
            if (e.target.classList.contains('grid-row')) this.unselect_all();
        };

        $.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', (e, element) => {
            const bar_wrapper = $.closest('.bar-wrapper', element);
            bars.forEach((bar) => bar.group.classList.remove('active'));

            if (element.classList.contains('left')) {
                is_resizing_left = true;
            } else if (element.classList.contains('right')) {
                is_resizing_right = true;
            } else if (element.classList.contains('bar-wrapper')) {
                is_dragging = true;
            }

            bar_wrapper.classList.add('active');
            if (this.popup) this.popup.parent.classList.add('hidden');

            if (this.popup) this.popup.parent.classList.add('hidden');

            x_on_start = e.offsetX || e.layerX;
            y_on_start = e.offsetY || e.layerY;

            parent_bar_id = bar_wrapper.getAttribute('data-id');
            parent_bar = this.get_bar(parent_bar_id);
            childlren_bars = this.get_all_dependent_tasks(parent_bar_id).map((id) => this.get_bar(id));
            // const ids = [
            //     parent_bar_id,
            //     ...this.get_all_dependent_tasks(parent_bar_id),
            // ];
            // parent_bar = this.get_bar(parent_bar_id);
            // childlren_bars = ids.map(this.get_all_dependent_tasks(parent_bar_id));
            // bars = ids.map((id) => this.get_bar(id));
            bars = [parent_bar, ...childlren_bars];
            this.bar_being_dragged = parent_bar_id;

            bars.forEach((bar) => {
                const $bar = bar.$bar;
                $bar.ox = $bar.getX();
                $bar.oy = $bar.getY();
                $bar.owidth = $bar.getWidth();
                $bar.finaldx = 0;
            });
        });
        $.on(this.$container, 'scroll', (e) => {
            let elements = document.querySelectorAll('.bar-wrapper');
            let localBars = [];
            const ids = [];
            let dx;
            if (x_on_scroll_start) {
                dx = e.currentTarget.scrollLeft - x_on_scroll_start;
            }

            const daysSinceStart =
                ((e.currentTarget.scrollLeft / this.options.column_width) *
                    this.options.step) /
                24;
            let format_str = 'D MMM';
            if (['Year', 'Month'].includes(this.options.view_mode))
                format_str = 'YYYY';
            else if (['Day', 'Week'].includes(this.options.view_mode))
                format_str = 'MMMM';
            else if (this.view_is('Half Day')) format_str = 'D';
            else if (this.view_is('Hour')) format_str = 'D MMMM';

            let currentUpper = date_utils.format(
                date_utils.add(this.gantt_start, daysSinceStart, 'day'),
                format_str,
            );
            const upperTexts = Array.from(
                document.querySelectorAll('.upper-text'),
            );
            const $el = upperTexts.find(
                (el) => el.textContent === currentUpper,
            );
            if ($el && !$el.classList.contains('current-upper')) {
                const $current = document.querySelector('.current-upper');
                if ($current) {
                    $current.classList.remove('current-upper');
                    $current.style.left =
                        this.upper_texts_x[$current.textContent] + 'px';
                    $current.style.top = this.options.header_height - 50 + 'px';
                }

                $el.classList.add('current-upper');
                let dimensions = this.$svg.getBoundingClientRect();
                $el.style.left =
                    dimensions.x + this.$container.scrollLeft + 10 + 'px';
                $el.style.top =
                    dimensions.y + this.options.header_height - 50 + 'px';
            }

            Array.prototype.forEach.call(elements, function (el, i) {
                ids.push(el.getAttribute('data-id'));
            });

            if (dx) {
                localBars = ids.map((id) => this.get_bar(id));
                if (this.options.auto_move_label) {
                    localBars.forEach((bar) => {
                        bar.update_label_position_on_horizontal_scroll({
                            x: dx,
                            sx: e.currentTarget.scrollLeft,
                        });
                    });
                }
            }

            x_on_scroll_start = e.currentTarget.scrollLeft;
        });

        $.on(this.$svg, 'mousemove', (e) => {
            if (!action_in_progress()) return;
            const dx = (e.offsetX || e.layerX) - x_on_start;

            // Primero manejamos la barra padre
            const parent_movement = this.handle_parent_bar_movement(parent_bar, dx, {
                is_dragging,
                is_resizing_left,
                is_resizing_right
            });
            console.log("parent_movement", parent_movement);
            // Si la barra padre se movió exitosamente, actualizamos las barras hijas
            if (parent_movement.success) {
                console.log("childlren_bars", childlren_bars);
                this.handle_children_bars_movement(childlren_bars, dx, parent_movement.movement, parent_bar);
            }
        });


        document.addEventListener('mouseup', (e) => {
            is_dragging = false;
            is_resizing_left = false;
            is_resizing_right = false;
        });

        $.on(this.$svg, 'mouseup', (e) => {
            bars.forEach((bar) => {
                const $bar = bar.$bar;
                if (bar.task.id == this.bar_being_dragged) {
                    let days_movement = this.get_days_movement($bar.finaldx);
                    if (this.inverse_dependency_map[this.bar_being_dragged]) {
                        this.inverse_dependency_map[this.bar_being_dragged].forEach((dep) => {
                            dep.lag += days_movement;
                        });
                    }
                }
                if (!$bar.finaldx) return;
                bar.date_changed();
                bar.set_action_completed();
            });
            this.bar_being_dragged = null;
        });

        // this.bind_bar_progress();
    }
    handle_parent_bar_movement(parent_bar, dx, action_state) {
        if (!parent_bar || !parent_bar.$bar) {
            return { success: false, movement: 0 };
        }

        const $bar = parent_bar.$bar;
        $bar.finaldx = this.get_snap_position(dx, parent_bar);
        this.hide_popup();

        // Verificar si el movimiento es válido antes de aplicarlo
        const proposed_movement = $bar.ox + $bar.finaldx;
        if (!this.is_valid_move(parent_bar, proposed_movement)) {
            return { success: false, movement: 0 };
        }

        const { is_dragging, is_resizing_left, is_resizing_right } = action_state;

        if (is_resizing_left) {
            parent_bar.update_bar_position({
                x: $bar.ox + $bar.finaldx,
                width: $bar.owidth - $bar.finaldx,
            });
        } else if (is_resizing_right) {
            parent_bar.update_bar_position({
                width: $bar.owidth + $bar.finaldx,
            });
        } else if (is_dragging && !this.options.readonly && !this.options.dates_readonly) {
            parent_bar.update_bar_position({ x: $bar.ox + $bar.finaldx });
        }

        return { success: true, movement: $bar.finaldx };
    }

    handle_children_bars_movement(children_bars, dx, parent_movement, parent_bar) {
        children_bars.forEach(bar => {
            if (!bar || !bar.$bar) return;

            const dependency = this.get_dependency_for_child(bar.task.id, parent_bar.task.id);
            if (!dependency) return;
            const { type, lag } = dependency;
            console.log("dependency", dependency);

            // Calculamos la nueva posición de la barra padre después del movimiento
            const parent_end_date = this.get_date_from_position(parent_bar.$bar.ox + parent_movement + parent_bar.$bar.getWidth());

            // Calculamos el forced lag real basado en los días no laborables
            const new_forced_lag = this.calculate_forced_lag(date_utils.add(parent_end_date, -1, "second"), lag);
            // Actualizamos el forced lag en la dependencia si ha cambiado
            if (new_forced_lag !== dependency.forcedLag) {
                dependency.forcedLag = new_forced_lag;

                // También actualizamos el inverse_dependency_map
                const inverse_dep = this.inverse_dependency_map[parent_bar.task.id]?.find(
                    dep => dep.taskId === bar.task.id
                );
                if (inverse_dep) {
                    inverse_dep.forcedLag = new_forced_lag;
                }
            }

            const $bar = bar.$bar;
            let adjusted_movement;

            if (type === 'endToStart') {
                const forced_lag_pixels = new_forced_lag * this.options.column_width;
                console.log("forced_lag_pixels", forced_lag_pixels);
                adjusted_movement = parent_movement + (forced_lag_pixels - (lag * this.options.column_width));
                console.log("adjusted_movement", adjusted_movement);
            }

            $bar.finaldx = this.get_snap_position(adjusted_movement, bar);
            console.log("$bar.finaldx", $bar.finaldx);
            if (!this.options.readonly && !this.options.dates_readonly) {
                bar.update_bar_position({ x: $bar.ox + $bar.finaldx });
            }
        });
    }

    // Método auxiliar para verificar si un movimiento es válido
    is_valid_move(bar, proposed_position) {
        const column_width = this.options.column_width; // Ancho de una columna
        const min_position = column_width; // La posición mínima ahora es el ancho de una columna
        const max_position = this.$svg.getBoundingClientRect().width - bar.$bar.getWidth();

        return proposed_position >= min_position && proposed_position <= max_position;
    }
    calculate_forced_lag(start_date, initial_lag) {
        let current_date = new Date(start_date);
        console.log("current_date", current_date);
        let forced_lag = initial_lag;
        console.log("forced_lag", forced_lag);
        let days_counted = 0;
        console.log("days_counted", days_counted);

        // Avanzamos el número de días del lag inicial
        while (days_counted < initial_lag) {
            current_date.setDate(current_date.getDate() + 1);
            days_counted++;
            console.log("days_counted", days_counted);
            console.log("current_date", current_date);
        }

        // A partir de aquí, seguimos avanzando días hasta encontrar un día laborable
        while (this.isNonWorkingDay(current_date)) {
            current_date.setDate(current_date.getDate() + 1);
            forced_lag++;
            console.log("forced_lag", forced_lag);
            console.log("current_date", current_date);
        }
        console.log("forced_lag final", forced_lag);
        return forced_lag;
    }
    // Método para ajustar el movimiento de las barras hijas
    adjust_child_movement(child_bar, parent_movement) {
        // Aquí puedes implementar la lógica para ajustar el movimiento
        // basado en el tipo de dependencia y los lags definidos
        return parent_movement; // Por ahora retornamos el mismo movimiento
    }
    // Función auxiliar para obtener la dependencia específica entre dos tareas
    get_dependency_for_child(child_id, parent_id) {
        // Usamos el dependency_map para encontrar la dependencia específica
        const dependencies = this.dependency_map[parent_id];
        if (!dependencies) return null;

        return dependencies.find(dep => dep.taskId === child_id);
    }

    // Función auxiliar para obtener la fecha a partir de una posición en el gráfico
    get_date_from_position(position) {
        const days_from_start = Math.floor(position / this.options.column_width);
        const result_date = new Date(this.gantt_start);
        result_date.setDate(result_date.getDate() + days_from_start);
        return result_date;
    }

    // bind_bar_progress() {
    //     let x_on_start = 0;
    //     let y_on_start = 0;
    //     let is_resizing = null;
    //     let bar = null;
    //     let $bar_progress = null;
    //     let $bar = null;

    //     $.on(this.$svg, 'mousedown', '.handle.progress', (e, handle) => {
    //         is_resizing = true;
    //         x_on_start = e.offsetX || e.layerX;
    //         y_on_start = e.offsetY || e.layerY;

    //         const $bar_wrapper = $.closest('.bar-wrapper', handle);
    //         const id = $bar_wrapper.getAttribute('data-id');
    //         bar = this.get_bar(id);

    //         $bar_progress = bar.$bar_progress;
    //         $bar = bar.$bar;

    //         $bar_progress.finaldx = 0;
    //         $bar_progress.owidth = $bar_progress.getWidth();
    //         $bar_progress.min_dx = -$bar_progress.getWidth();
    //         $bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth();
    //     });

    //     $.on(this.$svg, 'mousemove', (e) => {
    //         if (!is_resizing) return;
    //         let dx = (e.offsetX || e.layerX) - x_on_start;

    //         if (dx > $bar_progress.max_dx) {
    //             dx = $bar_progress.max_dx;
    //         }
    //         if (dx < $bar_progress.min_dx) {
    //             dx = $bar_progress.min_dx;
    //         }

    //         const $handle = bar.$handle_progress;
    //         $.attr($bar_progress, 'width', $bar_progress.owidth + dx);
    //         $.attr($handle, 'cx', $bar_progress.getEndX());
    //         $bar_progress.finaldx = dx;
    //     });

    //     $.on(this.$svg, 'mouseup', () => {
    //         is_resizing = false;
    //         if (!($bar_progress && $bar_progress.finaldx)) return;

    //         $bar_progress.finaldx = 0;
    //         bar.progress_changed();
    //         bar.set_action_completed();
    //         bar = null;
    //         $bar_progress = null;
    //         $bar = null;
    //     });
    // }

    // Nueva versión de la función para obtener todas las tareas dependientes
    get_all_dependent_tasks(task_id) {
        let out = [];
        let to_process = [task_id];
        while (to_process.length) {
            const deps = to_process.reduce((acc, curr) => {
                if (this.dependency_map[curr]) {
                    acc = acc.concat(this.dependency_map[curr].map(d => d.taskId));
                }
                return acc;
            }, []);

            out = out.concat(deps);
            to_process = deps.filter((d) => !out.includes(d));
        }

        return out.filter(Boolean);
    }

    // Función para verificar si un día es no laborable
    isNonWorkingDay(date) {
        const weekDays = this.options.nonWorkingDays.weekDays;
        const especialDays = this.options.nonWorkingDays.especialDays;
        return weekDays.includes(date.getDay()) || especialDays.includes(date_utils.formatDateToYMD(date));
    }

    get_snap_position(dx, bar) {
        // console.log("Gantt chart dates:", this.dates);
        // console.log("Gantt chart start:", this.gantt_start);
        // console.log("Gantt chart end:", this.gantt_end);
        let odx = dx,
            rem,
            position;

        // Función para obtener el día más cercano que sea laborable
        const getNearestWorkingDayPosition = (basePosition, increment) => {
            let tempDate = new Date(this.gantt_start);
            tempDate.setDate(tempDate.getDate() + (basePosition / this.options.column_width));
            while (this.isNonWorkingDay(tempDate)) {
                tempDate.setDate(tempDate.getDate() + increment);
                basePosition += increment * this.options.column_width;
            }
            return basePosition - bar.$bar.ox;
        };

        if (this.view_is(VIEW_MODE.WEEK)) {
            rem = dx % (this.options.column_width / 7);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 14
                    ? 0
                    : this.options.column_width / 7);
            // position = getNearestWorkingDayPosition(new Date(this.gantt_start), bar.x + position, 1);

        } else if (this.view_is(VIEW_MODE.MONTH)) {
            rem = dx % (this.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 60
                    ? 0
                    : this.options.column_width / 30);
            // position = getNearestWorkingDayPosition(new Date(this.gantt_start), bar.x + position, 1);

        } else {
            rem = dx % this.options.column_width;
            position =
                odx -
                rem +
                (rem < this.options.column_width / 2
                    ? 0
                    : this.options.column_width);

            position = getNearestWorkingDayPosition(bar.$bar.ox + position, 1);
        }

        return position;
    }
    get_days_movement(finaldx) {
        return finaldx / this.options.column_width;
    }

    unselect_all() {
        [...this.$svg.querySelectorAll('.bar-wrapper')].forEach((el) => {
            el.classList.remove('active');
        });
        if (this.popup) this.popup.parent.classList.remove('hidden');
    }

    view_is(modes) {
        if (typeof modes === 'string') {
            return this.options.view_mode === modes;
        }

        if (Array.isArray(modes)) {
            return modes.some((mode) => this.options.view_mode === mode);
        }

        return false;
    }

    get_task(id) {
        return this.tasks.find((task) => {
            return task.id === id;
        });
    }

    get_bar(id) {
        return this.bars.find((bar) => {
            return bar.task.id === id;
        });
    }

    show_popup(options) {
        if (this.options.popup === false) return;
        if (!this.popup) {
            this.popup = new Popup(this.$popup_wrapper, this.options.popup);
        }
        this.popup.show(options);
    }

    hide_popup() {
        this.popup && this.popup.hide();
    }

    trigger_event(event, args) {
        if (this.options['on_' + event]) {
            this.options['on_' + event].apply(null, args);
        }
    }

    /**
     * Gets the oldest starting date from the list of tasks
     *
     * @returns Date
     * @memberof Gantt
     */
    get_oldest_starting_date() {
        if (!this.tasks.length) return new Date();
        return this.tasks
            .map((task) => task._start)
            .reduce((prev_date, cur_date) =>
                cur_date <= prev_date ? cur_date : prev_date,
            );
    }

    /**
     * Clear all elements from the parent svg element
     *
     * @memberof Gantt
     */
    clear() {
        this.$svg.innerHTML = '';
        this.$header?.remove?.();
        this.$current_highlight?.remove?.();
        this.popup?.hide?.();
    }
}

Gantt.VIEW_MODE = VIEW_MODE;

function generate_id(task) {
    return task.name + '_' + Math.random().toString(36).slice(2, 12);
}
