const M = "year", E = "month", D = "day", Y = "hour", A = "minute", L = "second", H = "millisecond", S = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec"
}, r = {
  parse_duration(a) {
    const e = /([0-9]+)(y|m|d|h|min|s|ms)/gm.exec(a);
    if (e !== null) {
      if (e[2] === "y")
        return { duration: parseInt(e[1]), scale: "year" };
      if (e[2] === "m")
        return { duration: parseInt(e[1]), scale: "month" };
      if (e[2] === "d")
        return { duration: parseInt(e[1]), scale: "day" };
      if (e[2] === "h")
        return { duration: parseInt(e[1]), scale: "hour" };
      if (e[2] === "min")
        return { duration: parseInt(e[1]), scale: "minute" };
      if (e[2] === "s")
        return { duration: parseInt(e[1]), scale: "second" };
      if (e[2] === "ms")
        return { duration: parseInt(e[1]), scale: "millisecond" };
    }
  },
  parse(a, t = "-", e = /[.:]/) {
    if (a instanceof Date)
      return a;
    if (typeof a == "string") {
      let i, s;
      const n = a.split(" ");
      i = n[0].split(t).map((h) => parseInt(h, 10)), s = n[1] && n[1].split(e), i[1] = i[1] ? i[1] - 1 : 0;
      let o = i;
      return s && s.length && (s.length === 4 && (s[3] = "0." + s[3], s[3] = parseFloat(s[3]) * 1e3), o = o.concat(s)), new Date(...o);
    }
  },
  to_string(a, t = !1) {
    if (!(a instanceof Date))
      throw new TypeError("Invalid argument type");
    const e = this.get_date_values(a).map((n, o) => (o === 1 && (n = n + 1), o === 6 ? x(n + "", 3, "0") : x(n + "", 2, "0"))), i = `${e[0]}-${e[1]}-${e[2]}`, s = `${e[3]}:${e[4]}:${e[5]}.${e[6]}`;
    return i + (t ? " " + s : "");
  },
  format(a, t = "YYYY-MM-DD HH:mm:ss.SSS", e = "en") {
    const s = new Intl.DateTimeFormat(e, {
      month: "long"
    }).format(a), n = s.charAt(0).toUpperCase() + s.slice(1), o = this.get_date_values(a).map((f) => x(f, 2, 0)), h = {
      YYYY: o[0],
      MM: x(+o[1] + 1, 2, 0),
      DD: o[2],
      HH: o[3],
      mm: o[4],
      ss: o[5],
      SSS: o[6],
      D: o[2],
      MMMM: n,
      MMM: S[n]
    };
    let l = t;
    const d = [];
    return Object.keys(h).sort((f, _) => _.length - f.length).forEach((f) => {
      l.includes(f) && (l = l.replaceAll(f, `$${d.length}`), d.push(h[f]));
    }), d.forEach((f, _) => {
      l = l.replaceAll(`$${_}`, f);
    }), l;
  },
  diff(a, t, e = D) {
    let i, s, n, o, h, l, d;
    return i = a - t, s = i / 1e3, o = s / 60, n = o / 60, h = n / 24, l = h / 30, d = l / 12, e.endsWith("s") || (e += "s"), Math.floor(
      {
        milliseconds: i,
        seconds: s,
        minutes: o,
        hours: n,
        days: h,
        months: l,
        years: d
      }[e]
    );
  },
  today() {
    const a = this.get_date_values(/* @__PURE__ */ new Date()).slice(0, 3);
    return new Date(...a);
  },
  now() {
    return /* @__PURE__ */ new Date();
  },
  add(a, t, e) {
    t = parseInt(t, 10);
    const i = [
      a.getFullYear() + (e === M ? t : 0),
      a.getMonth() + (e === E ? t : 0),
      a.getDate() + (e === D ? t - 1 : 0),
      a.getHours() + (e === Y ? t : 0),
      a.getMinutes() + (e === A ? t : 0),
      a.getSeconds() + (e === L ? t : 0),
      a.getMilliseconds() + (e === H ? t : 0)
    ];
    return new Date(...i);
  },
  start_of(a, t) {
    const e = {
      [M]: 6,
      [E]: 5,
      [D]: 4,
      [Y]: 3,
      [A]: 2,
      [L]: 1,
      [H]: 0
    };
    function i(n) {
      const o = e[t];
      return e[n] <= o;
    }
    const s = [
      a.getFullYear(),
      i(M) ? 0 : a.getMonth(),
      i(E) ? 1 : a.getDate(),
      i(D) ? 0 : a.getHours(),
      i(Y) ? 0 : a.getMinutes(),
      i(A) ? 0 : a.getSeconds(),
      i(L) ? 0 : a.getMilliseconds()
    ];
    return new Date(...s);
  },
  clone(a) {
    return new Date(...this.get_date_values(a));
  },
  get_date_values(a) {
    return [
      a.getFullYear(),
      a.getMonth(),
      a.getDate(),
      a.getHours(),
      a.getMinutes(),
      a.getSeconds(),
      a.getMilliseconds()
    ];
  },
  get_days_in_month(a) {
    const t = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], e = a.getMonth();
    if (e !== 1)
      return t[e];
    const i = a.getFullYear();
    return i % 4 === 0 && i % 100 != 0 || i % 400 === 0 ? 29 : 28;
  },
  formatDateToYMD(a) {
    const t = a.getFullYear(), e = String(a.getMonth() + 1).padStart(2, "0"), i = String(a.getDate()).padStart(2, "0");
    return `${t}-${e}-${i}`;
  }
};
function x(a, t, e) {
  return a = a + "", t = t >> 0, e = String(typeof e < "u" ? e : " "), a.length > t ? String(a) : (t = t - a.length, t > e.length && (e += e.repeat(t / e.length)), e.slice(0, t) + String(a));
}
function u(a, t) {
  return typeof a == "string" ? (t || document).querySelector(a) : a || null;
}
function c(a, t) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", a);
  for (let i in t)
    i === "append_to" ? t.append_to.appendChild(e) : i === "innerHTML" ? e.innerHTML = t.innerHTML : i === "clipPath" ? e.setAttribute("clip-path", "url(#" + t[i] + ")") : e.setAttribute(i, t[i]);
  return e;
}
function N(a, t, e, i) {
  const s = X(a, t, e, i);
  if (s === a) {
    const n = document.createEvent("HTMLEvents");
    n.initEvent("click", !0, !0), n.eventName = "click", s.dispatchEvent(n);
  }
}
function X(a, t, e, i, s = "0.4s", n = "0.1s") {
  const o = a.querySelector("animate");
  if (o)
    return u.attr(o, {
      attributeName: t,
      from: e,
      to: i,
      dur: s,
      begin: "click + " + n
      // artificial click
    }), a;
  const h = c("animate", {
    attributeName: t,
    from: e,
    to: i,
    dur: s,
    begin: n,
    calcMode: "spline",
    values: e + ";" + i,
    keyTimes: "0; 1",
    keySplines: C("ease-out")
  });
  return a.appendChild(h), a;
}
function C(a) {
  return {
    ease: ".25 .1 .25 1",
    linear: "0 0 1 1",
    "ease-in": ".42 0 1 1",
    "ease-out": "0 0 .58 1",
    "ease-in-out": ".42 0 .58 1"
  }[a];
}
u.on = (a, t, e, i) => {
  i ? u.delegate(a, t, e, i) : (i = e, u.bind(a, t, i));
};
u.off = (a, t, e) => {
  a.removeEventListener(t, e);
};
u.bind = (a, t, e) => {
  t.split(/\s+/).forEach(function(i) {
    a.addEventListener(i, e);
  });
};
u.delegate = (a, t, e, i) => {
  a.addEventListener(t, function(s) {
    const n = s.target.closest(e);
    n && (s.delegatedTarget = n, i.call(this, s, n));
  });
};
u.closest = (a, t) => t ? t.matches(a) ? t : u.closest(a, t.parentNode) : null;
u.attr = (a, t, e) => {
  if (!e && typeof t == "string")
    return a.getAttribute(t);
  if (typeof t == "object") {
    for (let i in t)
      u.attr(a, i, t[i]);
    return;
  }
  a.setAttribute(t, e);
};
class O {
  constructor(t, e) {
    this.set_defaults(t, e), this.prepare(), this.draw(), this.bind();
  }
  set_defaults(t, e) {
    this.action_completed = !1, this.gantt = t, this.task = e;
  }
  prepare() {
    this.prepare_values(), this.prepare_helpers();
  }
  prepare_values() {
    this.invalid = this.task.invalid, this.height = this.gantt.options.bar_height, this.image_size = this.height - 5, this.compute_x(), this.compute_y(), this.compute_duration(), this.corner_radius = this.gantt.options.bar_corner_radius, this.width = this.calculateWidth(this.task._start, this.task.workingDays), this.group = c("g", {
      class: "bar-wrapper" + (this.task.custom_class ? " " + this.task.custom_class : "") + (this.task.important ? " important" : ""),
      "data-id": this.task.id
    }), this.bar_group = c("g", {
      class: "bar-group",
      append_to: this.group
    }), this.handle_group = c("g", {
      class: "handle-group",
      append_to: this.group
    });
  }
  isNonWorkingDay(t) {
    const e = this.gantt.options.nonWorkingDays.weekDays, i = this.gantt.options.nonWorkingDays.especialDays, s = e.includes(t.getDay()), n = i.includes(r.formatDateToYMD(t));
    return s || n;
  }
  calculateWidth(t, e) {
    let i = new Date(t), s = e, n = e;
    for (; s > 0; )
      this.isNonWorkingDay(i) ? n++ : s--, s > 0 && i.setDate(i.getDate() + 1);
    return this.gantt.options.column_width * n;
  }
  prepare_helpers() {
    SVGElement.prototype.getX = function() {
      return +this.getAttribute("x");
    }, SVGElement.prototype.getY = function() {
      return +this.getAttribute("y");
    }, SVGElement.prototype.getWidth = function() {
      return +this.getAttribute("width");
    }, SVGElement.prototype.getHeight = function() {
      return +this.getAttribute("height");
    }, SVGElement.prototype.getEndX = function() {
      return this.getX() + this.getWidth();
    };
  }
  // prepare_expected_progress_values() {
  //     this.compute_expected_progress();
  //     this.expected_progress_width =
  //         this.gantt.options.column_width *
  //         this.duration *
  //         (this.expected_progress / 100) || 0;
  // }
  draw() {
    this.draw_bar(), this.draw_label(), this.draw_resize_handles(), this.task.thumbnail && this.draw_thumbnail();
  }
  draw_bar() {
    this.$bar = c("rect", {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rx: this.corner_radius,
      ry: this.corner_radius,
      fill: this.task.color,
      // Asignar color al atributo 'fill'
      stroke: this.task.color,
      // Asignar color al atributo 'stroke'
      class: "bar" + (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !this.task.important ? " safari" : ""),
      append_to: this.bar_group
    }), N(this.$bar, "width", 0, this.width), this.invalid && this.$bar.classList.add("bar-invalid");
  }
  // draw_expected_progress_bar() {
  //     if (this.invalid) return;
  //     this.$expected_bar_progress = createSVG('rect', {
  //         x: this.x,
  //         y: this.y,
  //         width: this.expected_progress_width,
  //         height: this.height,
  //         rx: this.corner_radius,
  //         ry: this.corner_radius,
  //         class: 'bar-expected-progress',
  //         append_to: this.bar_group,
  //     });
  //     animateSVG(
  //         this.$expected_bar_progress,
  //         'width',
  //         0,
  //         this.expected_progress_width,
  //     );
  // }
  // draw_progress_bar() {
  //     if (this.invalid) return;
  //     this.$bar_progress = createSVG('rect', {
  //         x: this.x,
  //         y: this.y,
  //         width: this.progress_width,
  //         height: this.height,
  //         rx: this.corner_radius,
  //         ry: this.corner_radius,
  //         class: 'bar-progress',
  //         append_to: this.bar_group,
  //     });
  //     const x =
  //         (date_utils.diff(this.task._start, this.gantt.gantt_start, 'hour') /
  //             this.gantt.options.step) *
  //         this.gantt.options.column_width;
  //     let $date_highlight = document.createElement('div');
  //     $date_highlight.id = `${this.task.id}-highlight`;
  //     $date_highlight.classList.add('date-highlight');
  //     $date_highlight.style.height = this.height * 0.8 + 'px';
  //     $date_highlight.style.width = this.width + 'px';
  //     $date_highlight.style.top =
  //         this.gantt.options.header_height - 25 + 'px';
  //     $date_highlight.style.left = x + 'px';
  //     this.$date_highlight = $date_highlight;
  //     this.gantt.$lower_header.prepend($date_highlight);
  //     animateSVG(this.$bar_progress, 'width', 0, this.progress_width);
  // }
  draw_label() {
    let t = this.x + this.$bar.getWidth() / 2;
    this.task.thumbnail && (t = this.x + this.image_size + 5), c("text", {
      x: t,
      y: this.y + this.height / 2,
      innerHTML: this.task.name,
      class: "bar-label",
      append_to: this.bar_group
    }), requestAnimationFrame(() => this.update_label_position());
  }
  draw_thumbnail() {
    let t = 10, e = 2, i, s;
    i = c("defs", {
      append_to: this.bar_group
    }), c("rect", {
      id: "rect_" + this.task.id,
      x: this.x + t,
      y: this.y + e,
      width: this.image_size,
      height: this.image_size,
      rx: "15",
      class: "img_mask",
      append_to: i
    }), s = c("clipPath", {
      id: "clip_" + this.task.id,
      append_to: i
    }), c("use", {
      href: "#rect_" + this.task.id,
      append_to: s
    }), c("image", {
      x: this.x + t,
      y: this.y + e,
      width: this.image_size,
      height: this.image_size,
      class: "bar-img",
      href: this.task.thumbnail,
      clipPath: "clip_" + this.task.id,
      append_to: this.bar_group
    });
  }
  draw_resize_handles() {
    if (this.invalid || this.gantt.options.readonly)
      return;
    const t = this.$bar, e = 8;
    this.gantt.options.dates_readonly || (c("rect", {
      x: t.getX() + t.getWidth() + e - 4,
      y: t.getY() + 1,
      width: e,
      height: this.height - 2,
      rx: this.corner_radius,
      ry: this.corner_radius,
      class: "handle right",
      append_to: this.handle_group
    }), c("rect", {
      x: t.getX() - e - 4,
      y: t.getY() + 1,
      width: e,
      height: this.height - 2,
      rx: this.corner_radius,
      ry: this.corner_radius,
      class: "handle left",
      append_to: this.handle_group
    }));
  }
  bind() {
    this.invalid || this.setup_click_event();
  }
  setup_click_event() {
    this.task.id, u.on(this.group, "mouseover", (e) => {
      this.gantt.trigger_event("hover", [
        this.task,
        e.screenX,
        e.screenY,
        e
      ]);
    });
    let t;
    u.on(
      this.group,
      "mouseenter",
      (e) => t = setTimeout(() => {
        this.show_popup(e.offsetX || e.layerX);
      }, 200)
    ), u.on(this.group, "mouseleave", () => {
      var e, i;
      clearTimeout(t), (i = (e = this.gantt.popup) == null ? void 0 : e.hide) == null || i.call(e);
    }), u.on(this.group, "click", () => {
      this.gantt.trigger_event("click", [this.task]);
    }), u.on(this.group, "dblclick", (e) => {
      this.gantt.trigger_event("dblclick", [this.task]), !this.action_completed && (this.group.classList.remove("active"), this.gantt.popup && this.gantt.popup.parent.classList.remove("hidden"));
    });
  }
  show_popup(t) {
    this.gantt.bar_being_dragged || (r.format(
      this.task._start,
      "MMM D",
      this.gantt.options.language
    ), r.format(
      r.add(this.task._end, -1, "second"),
      "MMM D",
      this.gantt.options.language
    ), this.gantt.show_popup({
      x: t,
      target_element: this.$bar,
      title: this.task.name,
      // subtitle: subtitle,
      task: this.task
    }));
  }
  update_bar_position({ x: t = null, width: e = null }) {
    const i = this.$bar;
    t && (this.task.dependencies.map((s) => this.gantt.get_bar(s[0]).$bar.getX()), this.date_changed(!1), this.update_attr(i, "width", this.calculateWidth(this.task._start, this.task.workingDays)), this.update_attr(i, "x", t)), e && this.update_attr(i, "width", e), this.update_label_position(), this.update_handle_position(), this.update_arrow_position();
  }
  update_label_position_on_horizontal_scroll({ x: t, sx: e }) {
    const i = document.querySelector(".gantt-container"), s = this.group.querySelector(".bar-label"), n = this.group.querySelector(".bar-img") || "", o = this.bar_group.querySelector(".img_mask") || "";
    let h = this.$bar.getX() + this.$bar.getWidth(), l = s.getX() + t, d = n && n.getX() + t || 0, f = n && n.getBBox().width + 7 || 7, _ = l + s.getBBox().width + 7, g = e + i.clientWidth / 2;
    s.classList.contains("big") || (_ < h && t > 0 && _ < g || l - f > this.$bar.getX() && t < 0 && _ > g) && (s.setAttribute("x", l), n && (n.setAttribute("x", d), o.setAttribute("x", d)));
  }
  date_changed(t = !0) {
    let e = !1;
    const { new_start_date: i, new_end_date: s } = this.compute_start_end_date();
    Number(this.task._start) !== Number(i) && (e = !0, this.task._start = i), Number(this.task._end) !== Number(s) && (e = !0, this.task._end = s), console.log("changed", e, t), t && this.gantt.trigger_event("date_change", [
      this.task,
      i,
      r.add(s, -1, "second")
    ]);
  }
  // progress_changed() {
  //     const new_progress = this.compute_progress();
  //     this.task.progress = new_progress;
  //     this.gantt.trigger_event('progress_change', [this.task, new_progress]);
  // }
  set_action_completed() {
    this.action_completed = !0, setTimeout(() => this.action_completed = !1, 1e3);
  }
  compute_start_end_date() {
    const t = this.$bar, e = t.getX() / this.gantt.options.column_width;
    let i = r.add(
      this.gantt.gantt_start,
      e * this.gantt.options.step,
      "hour"
    );
    const s = this.gantt.gantt_start.getTimezoneOffset() - i.getTimezoneOffset();
    s && (i = r.add(
      i,
      s,
      "minute"
    ));
    const n = t.getWidth() / this.gantt.options.column_width, o = r.add(
      i,
      n * this.gantt.options.step,
      "hour"
    );
    return { new_start_date: i, new_end_date: o };
  }
  // compute_progress() {
  //     const progress =
  //         (this.$bar_progress.getWidth() / this.$bar.getWidth()) * 100;
  //     return parseInt(progress, 10);
  // }
  // compute_expected_progress() {
  //     this.expected_progress =
  //         date_utils.diff(date_utils.today(), this.task._start, 'hour') /
  //         this.gantt.options.step;
  //     this.expected_progress =
  //         ((this.expected_progress < this.duration
  //             ? this.expected_progress
  //             : this.duration) *
  //             100) /
  //         this.duration;
  // }
  compute_x() {
    const { step: t, column_width: e } = this.gantt.options, i = this.task._start, s = this.gantt.gantt_start;
    let o = r.diff(i, s, "hour") / t * e;
    this.gantt.view_is("Month") && (o = r.diff(i, s, "day") * e / 30), this.x = o;
  }
  compute_y() {
    this.y = this.gantt.options.header_height + this.gantt.options.padding + this.task._index * (this.height + this.gantt.options.padding);
  }
  compute_duration() {
    this.duration = r.diff(this.task._end, this.task._start, "hour") / this.gantt.options.step;
  }
  get_snap_position(t) {
    let e = t, i, s;
    return this.gantt.view_is("Week") ? (i = t % (this.gantt.options.column_width / 7), s = e - i + (i < this.gantt.options.column_width / 14 ? 0 : this.gantt.options.column_width / 7)) : this.gantt.view_is("Month") ? (i = t % (this.gantt.options.column_width / 30), s = e - i + (i < this.gantt.options.column_width / 60 ? 0 : this.gantt.options.column_width / 30)) : (i = t % this.gantt.options.column_width, s = e - i + (i < this.gantt.options.column_width / 2 ? 0 : this.gantt.options.column_width)), s;
  }
  update_attr(t, e, i) {
    return i = +i, isNaN(i) || t.setAttribute(e, i), t;
  }
  // update_expected_progressbar_position() {
  //     if (this.invalid) return;
  //     this.$expected_bar_progress.setAttribute('x', this.$bar.getX());
  //     this.compute_expected_progress();
  //     this.$expected_bar_progress.setAttribute(
  //         'width',
  //         this.gantt.options.column_width *
  //         this.duration *
  //         (this.expected_progress / 100) || 0,
  //     );
  // }
  // update_progressbar_position() {
  //     if (this.invalid || this.gantt.options.readonly) return;
  //     this.$bar_progress.setAttribute('x', this.$bar.getX());
  //     this.$bar_progress.setAttribute(
  //         'width',
  //         this.$bar.getWidth() * (this.task.progress / 100),
  //     );
  // }
  update_label_position() {
    const t = this.bar_group.querySelector(".img_mask") || "", e = this.$bar, i = this.group.querySelector(".bar-label"), s = this.group.querySelector(".bar-img");
    let n = 5, o = this.image_size + 10;
    const h = i.getBBox().width, l = e.getWidth();
    h > l ? (i.classList.add("big"), s ? (s.setAttribute("x", e.getX() + e.getWidth() + n), t.setAttribute(
      "x",
      e.getX() + e.getWidth() + n
    ), i.setAttribute(
      "x",
      e.getX() + e.getWidth() + o
    )) : i.setAttribute("x", e.getX() + e.getWidth() + n)) : (i.classList.remove("big"), s ? (s.setAttribute("x", e.getX() + n), t.setAttribute("x", e.getX() + n), i.setAttribute(
      "x",
      e.getX() + l / 2 + o
    )) : i.setAttribute(
      "x",
      e.getX() + l / 2 - h / 2
    ));
  }
  update_handle_position() {
    if (this.invalid || this.gantt.options.readonly)
      return;
    const t = this.$bar;
    this.handle_group.querySelector(".handle.left").setAttribute("x", t.getX() - 12), this.handle_group.querySelector(".handle.right").setAttribute("x", t.getEndX() + 4);
  }
  update_arrow_position() {
    this.arrows = this.arrows || [];
    for (let t of this.arrows)
      t.update();
  }
}
class I {
  constructor(t, e, i) {
    this.gantt = t, this.from_task = e, this.to_task = i, this.calculate_path(), this.draw();
  }
  calculate_path() {
    let t = this.from_task.$bar.getX() + this.from_task.$bar.getWidth();
    const e = this.from_task.$bar.getY() + this.gantt.options.bar_height / 2, i = this.to_task.$bar.getX() - this.gantt.options.padding / 2 - 7, s = this.gantt.options.header_height + this.gantt.options.bar_height / 2 + (this.gantt.options.padding + this.gantt.options.bar_height) * this.to_task.task._index + this.gantt.options.padding, n = this.from_task.task._index > this.to_task.task._index, o = this.gantt.options.arrow_curve, h = n ? 1 : 0, l = n ? -o : o, d = n ? s + this.gantt.options.arrow_curve : s - this.gantt.options.arrow_curve;
    if (this.path = `
            M ${t} ${e}
            L ${t + 10} ${e}
            a ${o} ${o} 0 0 ${h ? 0 : 1} ${o} ${l}
            V ${d}
            a ${o} ${o} 0 0 ${h} ${o} ${l}
            L ${i} ${s}
            m -5 -5
            l 5 5
            l -5 5`, // this.to_task.$bar.getX() <
    // this.from_task.$bar.getX() + this.gantt.options.padding
    t > i) {
      this.gantt.options.padding / 2 - o;
      const f = this.to_task.$bar.getY() + this.to_task.$bar.getHeight() / 2 - l, _ = this.to_task.$bar.getX() - this.gantt.options.padding;
      this.path = `
                M ${t} ${e}
                L ${t + 10} ${e}
                a ${o} ${o} 0 0 ${h ? 0 : 1} ${o} ${l}
                v ${this.gantt.options.bar_height / 2}
                a ${o} ${o} 0 0 1 -${o} ${o}
                H ${_ - 10}
                a ${o} ${o} 0 0 ${h} -${o} ${l}
                V ${f}
                a ${o} ${o} 0 0 ${h} ${o} ${l}
                L ${i} ${s}
                m -5 -5
                l 5 5
                l -5 5`;
    }
  }
  draw() {
    this.element = c("path", {
      d: this.path,
      "data-from": this.from_task.task.id,
      "data-to": this.to_task.task.id
    });
  }
  update() {
    this.calculate_path(), this.element.setAttribute("d", this.path);
  }
}
class R {
  constructor(t, e) {
    this.parent = t, this.custom_html = e, this.make();
  }
  make() {
    this.parent.innerHTML = `
            <div class="title"></div>
            <div class="subtitle"></div>
            <div class="pointer"></div>
        `, this.hide(), this.title = this.parent.querySelector(".title"), this.subtitle = this.parent.querySelector(".subtitle"), this.pointer = this.parent.querySelector(".pointer");
  }
  show(t) {
    if (!t.target_element)
      throw new Error("target_element is required to show popup");
    const e = t.target_element;
    if (this.custom_html) {
      let s = this.custom_html(t.task);
      s += '<div class="pointer"></div>', this.parent.innerHTML = s, this.pointer = this.parent.querySelector(".pointer");
    } else
      this.title.innerHTML = t.title, this.subtitle.innerHTML = t.subtitle;
    let i;
    e instanceof HTMLElement ? i = e.getBoundingClientRect() : e instanceof SVGElement && (i = t.target_element.getBBox()), this.parent.style.left = t.x - this.parent.clientWidth / 2 + "px", this.parent.style.top = i.y + i.height + 10 + "px", this.pointer.style.left = this.parent.clientWidth / 2 + "px", this.pointer.style.top = "-15px", this.parent.style.opacity = 1;
  }
  hide() {
    this.parent.style.opacity = 0, this.parent.style.left = 0;
  }
}
function z(a) {
  let t, e;
  if (typeof a == "string" && (a = document.querySelector(a)), a instanceof HTMLElement)
    e = a, t = a.querySelector("svg");
  else if (a instanceof SVGElement)
    t = a;
  else
    throw new TypeError(
      "Frappe Gantt only supports usage of a string CSS selector, HTML DOM element or SVG DOM element for the 'element' parameter"
    );
  const i = {
    $svg: null,
    $container: document.createElement("div"),
    $popup_wrapper: document.createElement("div")
  };
  return t ? (i.$svg = t, i.$svg.classList.add("gantt")) : i.$svg = c("svg", {
    append_to: e,
    class: "gantt"
  }), i.$container.classList.add("gantt-container"), i.$svg.parentElement.appendChild(i.$container), i.$container.appendChild(i.$svg), i.$popup_wrapper.classList.add("popup-wrapper"), i.$container.appendChild(i.$popup_wrapper), i;
}
const p = {
  HOUR: "Hour",
  QUARTER_DAY: "Quarter Day",
  HALF_DAY: "Half Day",
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  YEAR: "Year"
}, F = {
  HOUR: ["7d", "7d"],
  QUARTER_DAY: ["7d", "7d"],
  HALF_DAY: ["7d", "7d"],
  DAY: ["1m", "1m"],
  WEEK: ["1m", "1m"],
  MONTH: ["1m", "1m"],
  YEAR: ["2y", "2y"]
}, B = {
  header_height: 65,
  column_width: 10,
  view_modes: [...Object.values(p)],
  bar_height: 30,
  bar_corner_radius: 3,
  arrow_curve: 5,
  padding: 18,
  view_mode: "Day",
  date_format: "YYYY-MM-DD",
  // show_expected_progress: false,
  popup: null,
  language: "en",
  readonly: !1,
  // progress_readonly: false,
  dates_readonly: !1,
  highlight_weekend: !0,
  scroll_to: "start",
  lines: "both",
  auto_move_label: !0,
  today_button: !0,
  view_mode_select: !1
};
class q {
  constructor(t, e, i) {
    this.setup(t, e, i);
  }
  setup(t, e, i) {
    const s = z(t);
    this.$svg = s.$svg, this.$container = s.$container, this.$popup_wrapper = s.$popup_wrapper, this.setup_options(i), this.setup_tasks(e), this.change_view_mode(), this.bind_events();
  }
  setup_options(t) {
    this.options = { ...B, ...t }, t.view_mode_padding || (t.view_mode_padding = {});
    for (let [e, i] of Object.entries(t.view_mode_padding))
      typeof i == "string" && (t.view_mode_padding[e] = [i, i]);
    this.options.view_mode_padding = {
      ...F,
      ...t.view_mode_padding
    };
  }
  setup_tasks(t) {
    this.tasks = t.map((e, i) => {
      if (e._start = r.parse(e.start), e.end === void 0 && e.duration !== void 0 && (e.end = e._start, e.duration.split(" ").forEach((h) => {
        let { duration: l, scale: d } = r.parse_duration(h);
        e.end = r.add(e.end, l, d);
      })), e._end = r.parse(e.end), r.diff(e._end, e._start, "year") < 0)
        throw Error(
          "start of task can't be after end of task: in task #, " + (i + 1)
        );
      if (r.diff(e._end, e._start, "year") > 10 && (e.end = null), e._index = i, !e.start && !e.end) {
        const o = r.today();
        e._start = o, e._end = r.add(o, 2, "day");
      }
      if (!e.start && e.end && (e._start = r.add(e._end, -2, "day")), e.start && !e.end && (e._end = r.add(e._start, 2, "day")), r.get_date_values(e._end).slice(3).every((o) => o === 0) && (e._end = r.add(e._end, 1439, "minute")), (!e.start || !e.end) && (e.invalid = !0), typeof e.dependencies == "string" || !e.dependencies) {
        let o = [];
        e.dependencies && (o = e.dependencies.split(",").map((h) => h.trim().replaceAll(" ", "_")).filter((h) => h)), e.dependencies = o;
      }
      return e.id ? e.id = `${e.id}` : e.id = G(e), e.color = e.color, e;
    }), this.setup_dependencies(), this.setup_inverse_dependencies();
  }
  setup_dependencies() {
    this.dependency_map = {};
    for (let t of this.tasks)
      for (let [e, i, s, n] of t.dependencies)
        this.dependency_map[t.id] || (this.dependency_map[t.id] = []), this.dependency_map[t.id].push({
          taskId: e,
          type: i,
          lag: s,
          forcedLag: n
        });
  }
  setup_inverse_dependencies() {
    this.inverse_dependency_map = {};
    for (let t of this.tasks)
      for (let [e, i, s, n] of t.dependencies)
        this.inverse_dependency_map[e] || (this.inverse_dependency_map[e] = []), this.inverse_dependency_map[e].push({
          taskId: t.id,
          type: i,
          lag: s,
          forcedLag: n
        });
  }
  refresh(t) {
    this.setup_tasks(t), this.change_view_mode();
  }
  change_view_mode(t = this.options.view_mode) {
    this.update_view_scale(t), this.setup_dates(), this.render(), this.trigger_event("view_change", [t]);
  }
  update_view_scale(t) {
    this.options.view_mode = t, t === p.HOUR ? (this.options.step = 24 / 24, this.options.column_width = 30) : t === p.DAY ? (this.options.step = 24, this.options.column_width = 30) : t === p.HALF_DAY ? (this.options.step = 24 / 2, this.options.column_width = 30) : t === p.QUARTER_DAY ? (this.options.step = 24 / 4, this.options.column_width = 30) : t === p.WEEK ? (this.options.step = 24 * 7, this.options.column_width = 75) : t === p.MONTH ? (this.options.step = 24 * 30, this.options.column_width = 62) : t === p.YEAR && (this.options.step = 24 * 365, this.options.column_width = 62);
  }
  setup_dates() {
    this.setup_gantt_dates(), this.setup_date_values();
  }
  setup_gantt_dates() {
    this.gantt_start = this.gantt_end = null;
    for (let h of this.tasks)
      (!this.gantt_start || h._start < this.gantt_start) && (this.gantt_start = h._start), (!this.gantt_end || h._end > this.gantt_end) && (this.gantt_end = h._end);
    let t, e;
    this.gantt_start ? t = r.start_of(this.gantt_start, "day") : t = /* @__PURE__ */ new Date(), this.gantt_end ? e = r.start_of(this.gantt_end, "day") : e = /* @__PURE__ */ new Date();
    let i;
    for (let [h, l] of Object.entries(p))
      l === this.options.view_mode && (i = h);
    const [s, n] = this.options.view_mode_padding[i].map(r.parse_duration);
    t = r.add(
      t,
      -s.duration,
      s.scale
    );
    let o;
    this.view_is(p.YEAR) ? o = "YYYY" : this.view_is(p.MONTH) ? o = "YYYY-MM" : this.view_is(p.DAY) ? o = "YYYY-MM-DD" : o = "YYYY-MM-DD HH", this.gantt_start = r.parse(
      r.format(t, o)
    ), this.gantt_start.setHours(0, 0, 0, 0), this.gantt_end = r.add(
      e,
      n.duration,
      n.scale
    );
  }
  setup_date_values() {
    this.dates = [];
    let t = null;
    for (; t === null || t < this.gantt_end; )
      t ? this.view_is(p.YEAR) ? t = r.add(t, 1, "year") : this.view_is(p.MONTH) ? t = r.add(t, 1, "month") : t = r.add(
        t,
        this.options.step,
        "hour"
      ) : t = r.clone(this.gantt_start), this.dates.push(t);
  }
  bind_events() {
    this.options.readonly || (this.bind_grid_click(), this.bind_bar_events());
  }
  render() {
    this.clear(), this.setup_layers(), this.make_grid(), this.make_dates(), this.make_bars(), this.make_grid_extras(), this.make_arrows(), this.map_arrows_on_bars(), this.set_width(), this.set_scroll_position(this.options.scroll_to), this.update_button_position();
  }
  setup_layers() {
    this.layers = {};
    const t = ["grid", "arrow", "bar", "details"];
    for (let e of t)
      this.layers[e] = c("g", {
        class: e,
        append_to: this.$svg
      });
  }
  make_grid() {
    this.make_grid_background(), this.make_grid_rows(), this.make_grid_header();
  }
  make_grid_extras() {
    this.make_grid_highlights(), this.make_grid_ticks();
  }
  make_grid_background() {
    const t = this.dates.length * this.options.column_width, e = this.options.header_height + this.options.padding + (this.options.bar_height + this.options.padding) * this.tasks.length;
    c("rect", {
      x: 0,
      y: 0,
      width: t,
      height: e,
      class: "grid-background",
      append_to: this.$svg
    }), u.attr(this.$svg, {
      height: e + this.options.padding + 100,
      width: "100%"
    });
  }
  make_grid_rows() {
    const t = c("g", { append_to: this.layers.grid }), e = this.dates.length * this.options.column_width, i = this.options.bar_height + this.options.padding;
    let s = this.options.header_height + this.options.padding / 2;
    for (let n of this.tasks)
      c("rect", {
        x: 0,
        y: s,
        width: e,
        height: i,
        class: "grid-row",
        append_to: t
      }), this.options.lines === "both" || this.options.lines, s += this.options.bar_height + this.options.padding;
  }
  make_grid_header() {
    let t = document.createElement("div");
    t.style.height = this.options.header_height + 10 + "px", t.style.width = this.dates.length * this.options.column_width + "px", t.classList.add("grid-header"), this.$header = t, this.$container.appendChild(t);
    let e = document.createElement("div");
    e.classList.add("upper-header"), this.$upper_header = e, this.$header.appendChild(e);
    let i = document.createElement("div");
    i.classList.add("lower-header"), this.$lower_header = i, this.$header.appendChild(i), this.make_side_header();
  }
  make_side_header() {
    let t = document.createElement("div");
    if (t.classList.add("side-header"), this.options.view_mode_select) {
      const e = document.createElement("select");
      e.classList.add("viewmode-select");
      const i = document.createElement("option");
      i.selected = !0, i.disabled = !0, i.textContent = "Mode", e.appendChild(i);
      for (const s in p) {
        const n = document.createElement("option");
        n.value = p[s], n.textContent = p[s], e.appendChild(n);
      }
      e.addEventListener(
        "change",
        (function() {
          this.change_view_mode(e.value);
        }).bind(this)
      ), t.appendChild(e);
    }
    if (this.options.today_button) {
      let e = document.createElement("button");
      e.classList.add("today-button"), e.textContent = "Today", e.onclick = this.scroll_today.bind(this), t.appendChild(e), this.$today_button = e;
    }
    this.$header.appendChild(t), this.$side_header = t, window.addEventListener(
      "scroll",
      this.update_button_position.bind(this)
    ), window.addEventListener(
      "resize",
      this.update_button_position.bind(this)
    );
  }
  update_button_position() {
    const t = this.$container.getBoundingClientRect(), e = this.$side_header.getBoundingClientRect(), { left: i, y: s } = this.$header.getBoundingClientRect();
    e.top < t.top || e.bottom > t.bottom ? (this.$side_header.style.position = "absolute", this.$side_header.style.top = `${t.scrollTop + e.top}px`) : (this.$side_header.style.position = "fixed", this.$side_header.style.top = s + 10 + "px");
    const n = Math.min(
      this.$header.clientWidth,
      this.$container.clientWidth
    );
    this.$side_header.style.left = i + this.$container.scrollLeft + n - this.$side_header.clientWidth + "px", this.$today_button && (this.$today_button.style.left = `${t.left + 20}px`);
  }
  make_grid_ticks() {
    if (!["both", "vertical", "horizontal"].includes(this.options.lines))
      return;
    let t = 0, e = this.options.header_height + this.options.padding / 2, i = (this.options.bar_height + this.options.padding) * this.tasks.length, s = c("g", {
      class: "lines_layer",
      append_to: this.layers.grid
    }), n = this.options.header_height + this.options.padding / 2;
    const o = this.dates.length * this.options.column_width, h = this.options.bar_height + this.options.padding;
    if (this.options.lines !== "vertical")
      for (let l of this.tasks)
        c("line", {
          x1: 0,
          y1: n + h,
          x2: o,
          y2: n + h,
          class: "row-line",
          append_to: s
        }), n += h;
    if (this.options.lines !== "horizontal")
      for (let l of this.dates) {
        let d = "tick";
        this.view_is(p.DAY) && l.getDate() === 1 && (d += " thick"), this.view_is(p.WEEK) && l.getDate() >= 1 && l.getDate() < 8 && (d += " thick"), this.view_is(p.MONTH) && l.getMonth() % 3 === 0 && (d += " thick"), c("path", {
          d: `M ${t} ${e} v ${i}`,
          class: d,
          append_to: this.layers.grid
        }), this.view_is(p.MONTH) ? t += r.get_days_in_month(l) * this.options.column_width / 30 : t += this.options.column_width;
      }
  }
  highlightWeekends() {
    if (!this.view_is("Day") && !this.view_is("Half Day"))
      return;
    const t = this.options.nonWorkingDays.weekDays, e = this.options.nonWorkingDays.especialDays;
    for (let i = new Date(this.gantt_start); i <= this.gantt_end; i.setDate(i.getDate() + 1)) {
      const s = t.includes(i.getDay()), n = e.includes(r.formatDateToYMD(i));
      if (s || n) {
        const o = r.diff(i, this.gantt_start, "hour") / this.options.step * this.options.column_width, h = (this.options.bar_height + this.options.padding) * this.tasks.length;
        c("rect", {
          x: o,
          y: this.options.header_height + this.options.padding / 2,
          width: (this.view_is("Day") ? 1 : 2) * this.options.column_width,
          height: h,
          class: "holiday-highlight",
          append_to: this.layers.grid
        });
      }
    }
  }
  //compute the horizontal x distance
  computeGridHighlightDimensions(t) {
    let e = this.options.column_width / 2;
    if (this.view_is(p.DAY)) {
      let i = r.today();
      return {
        x: e + r.diff(i, this.gantt_start, "hour") / this.options.step * this.options.column_width,
        date: i
      };
    }
    for (let i of this.dates) {
      const s = /* @__PURE__ */ new Date(), n = new Date(i), o = new Date(i);
      switch (t) {
        case p.WEEK:
          o.setDate(i.getDate() + 7);
          break;
        case p.MONTH:
          o.setMonth(i.getMonth() + 1);
          break;
        case p.YEAR:
          o.setFullYear(i.getFullYear() + 1);
          break;
      }
      if (s >= n && s <= o)
        return { x: e, date: n };
      e += this.options.column_width;
    }
  }
  make_grid_highlights() {
    if (this.options.highlight_weekend && this.highlightWeekends(), this.view_is(p.DAY) || this.view_is(p.WEEK) || this.view_is(p.MONTH) || this.view_is(p.YEAR)) {
      const { x: t, date: e } = this.computeGridHighlightDimensions(
        this.options.view_mode
      );
      if (!this.dates.find((o) => o.getTime() == e.getTime()))
        return;
      const i = this.options.header_height + this.options.padding / 2, s = (this.options.bar_height + this.options.padding) * this.tasks.length;
      this.$current_highlight = this.create_el({
        top: i,
        left: t,
        height: s,
        classes: "current-highlight",
        append_to: this.$container
      });
      let n = document.getElementById(
        r.format(e).replaceAll(" ", "_")
      );
      n && n.classList.add("current-date-highlight");
    }
  }
  create_el({ left: t, top: e, width: i, height: s, id: n, classes: o, append_to: h }) {
    let l = document.createElement("div");
    return l.classList.add(o), l.style.top = e + "px", l.style.left = t + "px", n && (l.id = n), i ? l.style.width = s + "px" : l.style.width = "38px", s ? l.style.height = s + "px" : l.style.height = "30px", h.appendChild(l), l;
  }
  make_dates() {
    this.upper_texts_x = {}, this.get_dates_to_draw().forEach((t, e) => {
      let i = this.create_el({
        left: t.lower_x,
        top: t.lower_y - 10,
        id: t.formatted_date,
        classes: "lower-text",
        append_to: this.$lower_header
      }), s = this.options.on_date_click;
      if (i.addEventListener("click", function() {
        s && s.apply(null, [t]);
      }), i.innerText = t.lower_text, i.style.left = +i.style.left.slice(0, -2) + "px", t.upper_text) {
        this.upper_texts_x[t.upper_text] = t.upper_x;
        let n = document.createElement("div");
        n.classList.add("upper-text"), n.style.left = t.upper_x + "px", n.style.top = t.upper_y + "px", n.innerText = t.upper_text, this.$upper_header.appendChild(n), t.upper_x > this.layers.grid.getBBox().width && n.remove();
      }
    });
  }
  get_dates_to_draw() {
    let t = null;
    return this.dates.map((i, s) => {
      const n = this.get_date_info(i, t, s);
      return t = n, n;
    });
  }
  get_date_info(t, e) {
    let i = e ? e.date : r.add(t, 1, "day");
    const s = {
      Hour_lower: r.format(t, "HH", this.options.language),
      "Quarter Day_lower": r.format(
        t,
        "HH",
        this.options.language
      ),
      "Half Day_lower": r.format(
        t,
        "HH",
        this.options.language
      ),
      Day_lower: t.getDate() !== i.getDate() ? r.format(t, "D", this.options.language) : "",
      Week_lower: t.getMonth() !== i.getMonth() ? r.format(t, "D MMM", this.options.language) : r.format(t, "D", this.options.language),
      Month_lower: r.format(t, "MMMM", this.options.language),
      Year_lower: r.format(t, "YYYY", this.options.language),
      Hour_upper: t.getDate() !== i.getDate() ? r.format(t, "D MMMM", this.options.language) : "",
      "Quarter Day_upper": t.getDate() !== i.getDate() ? r.format(t, "D MMM", this.options.language) : "",
      "Half Day_upper": t.getDate() !== i.getDate() ? t.getMonth() !== i.getMonth() ? r.format(
        t,
        "D MMM",
        this.options.language
      ) : r.format(t, "D", this.options.language) : "",
      Day_upper: t.getMonth() !== i.getMonth() || !e ? r.format(t, "MMMM", this.options.language) : "",
      Week_upper: t.getMonth() !== i.getMonth() ? r.format(t, "MMMM", this.options.language) : "",
      Month_upper: t.getFullYear() !== i.getFullYear() ? r.format(t, "YYYY", this.options.language) : "",
      Year_upper: t.getFullYear() !== i.getFullYear() ? r.format(t, "YYYY", this.options.language) : ""
    };
    let n = this.view_is(p.MONTH) ? r.get_days_in_month(t) * this.options.column_width / 30 : this.options.column_width;
    const o = {
      x: e ? e.base_pos_x + e.column_width : 0,
      lower_y: this.options.header_height - 20,
      upper_y: this.options.header_height - 50
    }, h = {
      Hour_lower: n / 2,
      Hour_upper: n * 12,
      "Quarter Day_lower": n / 2,
      "Quarter Day_upper": n * 2,
      "Half Day_lower": n / 2,
      "Half Day_upper": n,
      Day_lower: n / 2,
      Day_upper: n / 2,
      Week_lower: n / 2,
      Week_upper: n * 4 / 2,
      Month_lower: n / 2,
      Month_upper: n / 2,
      Year_lower: n / 2,
      Year_upper: n * 30 / 2
    };
    return {
      date: t,
      formatted_date: r.format(t).replaceAll(" ", "_"),
      column_width: n,
      base_pos_x: o.x,
      upper_text: this.options.lower_text ? this.options.upper_text(
        t,
        this.options.view_mode,
        s[`${this.options.view_mode}_upper`]
      ) : s[`${this.options.view_mode}_upper`],
      lower_text: this.options.lower_text ? this.options.lower_text(
        t,
        this.options.view_mode,
        s[`${this.options.view_mode}_lower`]
      ) : s[`${this.options.view_mode}_lower`],
      upper_x: o.x + h[`${this.options.view_mode}_upper`],
      upper_y: o.upper_y,
      lower_x: o.x + h[`${this.options.view_mode}_lower`],
      lower_y: o.lower_y
    };
  }
  make_bars() {
    this.bars = this.tasks.map((t) => {
      const e = new O(this, t);
      return this.layers.bar.appendChild(e.group), e;
    });
  }
  make_arrows() {
    this.arrows = [];
    for (let t of this.tasks) {
      let e = [];
      e = t.dependencies.map((i) => {
        const s = this.get_task(i);
        if (!s)
          return;
        const n = new I(
          this,
          this.bars[s._index],
          // from_task
          this.bars[t._index]
          // to_task
        );
        return this.layers.arrow.appendChild(n.element), n;
      }).filter(Boolean), this.arrows = this.arrows.concat(e);
    }
  }
  map_arrows_on_bars() {
    for (let t of this.bars)
      t.arrows = this.arrows.filter((e) => e.from_task.task.id === t.task.id || e.to_task.task.id === t.task.id);
  }
  set_width() {
    const t = this.$svg.getBoundingClientRect().width, e = this.$svg.querySelector(".grid .grid-row") ? this.$svg.querySelector(".grid .grid-row").getAttribute("width") : 0;
    t < e && this.$svg.setAttribute("width", e);
  }
  set_scroll_position(t) {
    if (!t || t === "start")
      t = this.gantt_start;
    else {
      if (t === "today")
        return this.scroll_today();
      typeof t == "string" && (t = r.parse(t));
    }
    const e = this.$svg.parentElement;
    if (!e)
      return;
    const s = (r.diff(t, this.gantt_start, "hour") + 24) / this.options.step * this.options.column_width - this.options.column_width;
    e.scrollTo({ left: s, behavior: "smooth" });
  }
  scroll_today() {
    this.set_scroll_position(/* @__PURE__ */ new Date());
  }
  bind_grid_click() {
    u.on(this.$svg, "click", ".grid-row, .grid-header", () => {
      this.unselect_all(), this.hide_popup();
    });
  }
  bind_bar_events() {
    let t = !1, e = !1, i = !1, s = 0, n = 0, o = null, h = [], l, d = [];
    this.bar_being_dragged = null;
    function f() {
      return t || e || i;
    }
    this.$svg.onclick = (_) => {
      _.target.classList.contains("grid-row") && this.unselect_all();
    }, u.on(this.$svg, "mousedown", ".bar-wrapper, .handle", (_, g) => {
      const w = u.closest(".bar-wrapper", g);
      h.forEach((m) => m.group.classList.remove("active")), g.classList.contains("left") ? e = !0 : g.classList.contains("right") ? i = !0 : g.classList.contains("bar-wrapper") && (t = !0), w.classList.add("active"), this.popup && this.popup.parent.classList.add("hidden"), this.popup && this.popup.parent.classList.add("hidden"), s = _.offsetX || _.layerX, _.offsetY || _.layerY, o = w.getAttribute("data-id"), l = this.get_bar(o), d = this.get_all_dependent_tasks(o).map((m) => this.get_bar(m)), h = [l, ...d], this.bar_being_dragged = o, h.forEach((m) => {
        const y = m.$bar;
        y.ox = y.getX(), y.oy = y.getY(), y.owidth = y.getWidth(), y.finaldx = 0;
      });
    }), u.on(this.$container, "scroll", (_) => {
      let g = document.querySelectorAll(".bar-wrapper"), w = [];
      const m = [];
      let y;
      n && (y = _.currentTarget.scrollLeft - n);
      const T = _.currentTarget.scrollLeft / this.options.column_width * this.options.step / 24;
      let v = "D MMM";
      ["Year", "Month"].includes(this.options.view_mode) ? v = "YYYY" : ["Day", "Week"].includes(this.options.view_mode) ? v = "MMMM" : this.view_is("Half Day") ? v = "D" : this.view_is("Hour") && (v = "D MMMM");
      let W = r.format(
        r.add(this.gantt_start, T, "day"),
        v
      );
      const $ = Array.from(
        document.querySelectorAll(".upper-text")
      ).find(
        (b) => b.textContent === W
      );
      if ($ && !$.classList.contains("current-upper")) {
        const b = document.querySelector(".current-upper");
        b && (b.classList.remove("current-upper"), b.style.left = this.upper_texts_x[b.textContent] + "px", b.style.top = this.options.header_height - 50 + "px"), $.classList.add("current-upper");
        let k = this.$svg.getBoundingClientRect();
        $.style.left = k.x + this.$container.scrollLeft + 10 + "px", $.style.top = k.y + this.options.header_height - 50 + "px";
      }
      Array.prototype.forEach.call(g, function(b, k) {
        m.push(b.getAttribute("data-id"));
      }), y && (w = m.map((b) => this.get_bar(b)), this.options.auto_move_label && w.forEach((b) => {
        b.update_label_position_on_horizontal_scroll({
          x: y,
          sx: _.currentTarget.scrollLeft
        });
      })), n = _.currentTarget.scrollLeft;
    }), u.on(this.$svg, "mousemove", (_) => {
      if (!f())
        return;
      const g = (_.offsetX || _.layerX) - s, w = this.handle_parent_bar_movement(l, g, {
        is_dragging: t,
        is_resizing_left: e,
        is_resizing_right: i
      });
      console.log("parent_movement", w), w.success && (console.log("childlren_bars", d), this.handle_children_bars_movement(d, g, w.movement, l));
    }), document.addEventListener("mouseup", (_) => {
      t = !1, e = !1, i = !1;
    }), u.on(this.$svg, "mouseup", (_) => {
      h.forEach((g) => {
        const w = g.$bar;
        if (g.task.id == this.bar_being_dragged) {
          let m = this.get_days_movement(w.finaldx);
          this.inverse_dependency_map[this.bar_being_dragged] && this.inverse_dependency_map[this.bar_being_dragged].forEach((y) => {
            y.lag += m;
          });
        }
        w.finaldx && (g.date_changed(), g.set_action_completed());
      }), this.bar_being_dragged = null;
    });
  }
  handle_parent_bar_movement(t, e, i) {
    if (!t || !t.$bar)
      return { success: !1, movement: 0 };
    const s = t.$bar;
    s.finaldx = this.get_snap_position(e, t), this.hide_popup();
    const n = s.ox + s.finaldx;
    if (!this.is_valid_move(t, n))
      return { success: !1, movement: 0 };
    const { is_dragging: o, is_resizing_left: h, is_resizing_right: l } = i;
    return h ? t.update_bar_position({
      x: s.ox + s.finaldx,
      width: s.owidth - s.finaldx
    }) : l ? t.update_bar_position({
      width: s.owidth + s.finaldx
    }) : o && !this.options.readonly && !this.options.dates_readonly && t.update_bar_position({ x: s.ox + s.finaldx }), { success: !0, movement: s.finaldx };
  }
  handle_children_bars_movement(t, e, i, s) {
    t.forEach((n) => {
      var w;
      if (!n || !n.$bar)
        return;
      const o = this.get_dependency_for_child(n.task.id, s.task.id);
      if (!o)
        return;
      const { type: h, lag: l } = o;
      console.log("dependency", o);
      const d = this.get_date_from_position(s.$bar.ox + i + s.$bar.getWidth()), f = this.calculate_forced_lag(r.add(d, -1, "second"), l);
      if (f !== o.forcedLag) {
        o.forcedLag = f;
        const m = (w = this.inverse_dependency_map[s.task.id]) == null ? void 0 : w.find(
          (y) => y.taskId === n.task.id
        );
        m && (m.forcedLag = f);
      }
      const _ = n.$bar;
      let g;
      if (h === "endToStart") {
        const m = f * this.options.column_width;
        console.log("forced_lag_pixels", m), g = i + (m - l * this.options.column_width), console.log("adjusted_movement", g);
      }
      _.finaldx = this.get_snap_position(g, n), console.log("$bar.finaldx", _.finaldx), !this.options.readonly && !this.options.dates_readonly && n.update_bar_position({ x: _.ox + _.finaldx });
    });
  }
  // Método auxiliar para verificar si un movimiento es válido
  is_valid_move(t, e) {
    const s = this.options.column_width, n = this.$svg.getBoundingClientRect().width - t.$bar.getWidth();
    return e >= s && e <= n;
  }
  calculate_forced_lag(t, e) {
    let i = new Date(t);
    console.log("current_date", i);
    let s = e;
    console.log("forced_lag", s);
    let n = 0;
    for (console.log("days_counted", n); n < e; )
      i.setDate(i.getDate() + 1), n++, console.log("days_counted", n), console.log("current_date", i);
    for (; this.isNonWorkingDay(i); )
      i.setDate(i.getDate() + 1), s++, console.log("forced_lag", s), console.log("current_date", i);
    return console.log("forced_lag final", s), s;
  }
  // Método para ajustar el movimiento de las barras hijas
  adjust_child_movement(t, e) {
    return e;
  }
  // Función auxiliar para obtener la dependencia específica entre dos tareas
  get_dependency_for_child(t, e) {
    const i = this.dependency_map[e];
    return i ? i.find((s) => s.taskId === t) : null;
  }
  // Función auxiliar para obtener la fecha a partir de una posición en el gráfico
  get_date_from_position(t) {
    const e = Math.floor(t / this.options.column_width), i = new Date(this.gantt_start);
    return i.setDate(i.getDate() + e), i;
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
  get_all_dependent_tasks(t) {
    let e = [], i = [t];
    for (; i.length; ) {
      const s = i.reduce((n, o) => (this.dependency_map[o] && (n = n.concat(this.dependency_map[o].map((h) => h.taskId))), n), []);
      e = e.concat(s), i = s.filter((n) => !e.includes(n));
    }
    return e.filter(Boolean);
  }
  // Función para verificar si un día es no laborable
  isNonWorkingDay(t) {
    const e = this.options.nonWorkingDays.weekDays, i = this.options.nonWorkingDays.especialDays;
    return e.includes(t.getDay()) || i.includes(r.formatDateToYMD(t));
  }
  get_snap_position(t, e) {
    let i = t, s, n;
    const o = (h, l) => {
      let d = new Date(this.gantt_start);
      for (d.setDate(d.getDate() + h / this.options.column_width); this.isNonWorkingDay(d); )
        d.setDate(d.getDate() + l), h += l * this.options.column_width;
      return h - e.$bar.ox;
    };
    return this.view_is(p.WEEK) ? (s = t % (this.options.column_width / 7), n = i - s + (s < this.options.column_width / 14 ? 0 : this.options.column_width / 7)) : this.view_is(p.MONTH) ? (s = t % (this.options.column_width / 30), n = i - s + (s < this.options.column_width / 60 ? 0 : this.options.column_width / 30)) : (s = t % this.options.column_width, n = i - s + (s < this.options.column_width / 2 ? 0 : this.options.column_width), n = o(e.$bar.ox + n, 1)), n;
  }
  get_days_movement(t) {
    return t / this.options.column_width;
  }
  unselect_all() {
    [...this.$svg.querySelectorAll(".bar-wrapper")].forEach((t) => {
      t.classList.remove("active");
    }), this.popup && this.popup.parent.classList.remove("hidden");
  }
  view_is(t) {
    return typeof t == "string" ? this.options.view_mode === t : Array.isArray(t) ? t.some((e) => this.options.view_mode === e) : !1;
  }
  get_task(t) {
    return this.tasks.find((e) => e.id === t);
  }
  get_bar(t) {
    return this.bars.find((e) => e.task.id === t);
  }
  show_popup(t) {
    this.options.popup !== !1 && (this.popup || (this.popup = new R(this.$popup_wrapper, this.options.popup)), this.popup.show(t));
  }
  hide_popup() {
    this.popup && this.popup.hide();
  }
  trigger_event(t, e) {
    this.options["on_" + t] && this.options["on_" + t].apply(null, e);
  }
  /**
   * Gets the oldest starting date from the list of tasks
   *
   * @returns Date
   * @memberof Gantt
   */
  get_oldest_starting_date() {
    return this.tasks.length ? this.tasks.map((t) => t._start).reduce(
      (t, e) => e <= t ? e : t
    ) : /* @__PURE__ */ new Date();
  }
  /**
   * Clear all elements from the parent svg element
   *
   * @memberof Gantt
   */
  clear() {
    var t, e, i, s, n, o;
    this.$svg.innerHTML = "", (e = (t = this.$header) == null ? void 0 : t.remove) == null || e.call(t), (s = (i = this.$current_highlight) == null ? void 0 : i.remove) == null || s.call(i), (o = (n = this.popup) == null ? void 0 : n.hide) == null || o.call(n);
  }
}
q.VIEW_MODE = p;
function G(a) {
  return a.name + "_" + Math.random().toString(36).slice(2, 12);
}
export {
  q as default
};
