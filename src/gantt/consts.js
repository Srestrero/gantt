export const VIEW_MODE = {
    HOUR: 'Hour',
    QUARTER_DAY: 'Quarter Day',
    HALF_DAY: 'Half Day',
    DAY: 'Day',
    WEEK: 'Week',
    MONTH: 'Month',
    YEAR: 'Year',
};

export const VIEW_MODE_PADDING = {
    HOUR: ['7d', '7d'],
    QUARTER_DAY: ['7d', '7d'],
    HALF_DAY: ['7d', '7d'],
    DAY: ['1m', '1m'],
    WEEK: ['1m', '1m'],
    MONTH: ['1m', '1m'],
    YEAR: ['2y', '2y'],
};

export const DEFAULT_OPTIONS = {
    header_height: 65,
    column_width: 10,
    view_modes: [...Object.values(VIEW_MODE)],
    bar_height: 30,
    bar_corner_radius: 3,
    arrow_curve: 5,
    padding: 18,
    view_mode: 'Day',
    date_format: 'YYYY-MM-DD',
    // show_expected_progress: false,
    popup: null,
    language: 'en',
    readonly: false,
    // progress_readonly: false,
    dates_readonly: false,
    highlight_weekend: true,
    scroll_to: 'start',
    lines: 'both',
    auto_move_label: true,
    today_button: true,
    view_mode_select: false,
};