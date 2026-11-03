/* Unit circle bowtie practice.
   Students get a random angle and trig function, e.g. sin(11π/6), and answer
   five questions in order. The unit circle drawing shows whatever they pick.
   After the last question, the first wrong step (if any) gets guided feedback,
   and the student redoes the problem from that step. */
(function () {
  var app = document.getElementById("bowtie-app");
  if (!app) return;

  var NS = "http://www.w3.org/2000/svg";
  var W = 780, H = 600, CX = 390, CY = 300, R = 205;   // viewBox size, center, unit length (px)
  var PI = Math.PI;
  var COL = { height: "#dc2626", across: "#1d4ed8", slope: "#059669" };

  var FAMILIES = ["axis", "squat", "equal", "tall"];
  var FAMILY_LABEL = { axis: "Axis", squat: "Squat", equal: "Equal", tall: "Tall" };
  var FAMILY_DEN = { axis: 2, squat: 6, equal: 4, tall: 3 };
  var REF = { squat: PI / 6, equal: PI / 4, tall: PI / 3 };
  var ENDS = ["right", "top", "left", "bottom"];
  var END_LABEL = { right: "Right", top: "Top", left: "Left", bottom: "Bottom" };
  var MEASURES = ["height", "across", "slope"];
  var MEASURE_LABEL = { height: "Height", across: "Across", slope: "Slope" };
  var FN_MEASURE = { sin: "height", cos: "across", tan: "slope" };
  var LENGTH_SIZES = ["none", "short", "equal", "long", "full"];
  var SLOPE_SIZES = ["none", "shallow", "equal", "steep", "undefined"];
  var SIZE_LABEL = {
    none: "None", short: "Short", equal: "Equal", long: "Long", full: "Full",
    shallow: "Shallow", steep: "Steep", undefined: "Undefined"
  };
  var LENGTH_MAG = { none: "0", short: "1/2", equal: "r2/2", long: "r3/2", full: "1" };
  var SLOPE_MAG = { none: "0", shallow: "r3/3", equal: "1", steep: "r3", undefined: "undef" };
  var LENGTH_VALUES = ["-1", "-r3/2", "-r2/2", "-1/2", "0", "1/2", "r2/2", "r3/2", "1"];
  var SLOPE_VALUES = ["-r3", "-1", "-r3/3", "0", "r3/3", "1", "r3", "undef"];
  var LADDER = [["none", "0"], ["short", "1"], ["equal", "2"], ["long", "3"], ["full", "4"]];

  // ---------- small helpers ----------
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function mod(a, m) { return ((a % m) + m) % m; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // "11π/6", "π", "−π/4", "0" — n and d already reduced
  function piText(n, d) {
    if (n === 0) return "0";
    var sign = n < 0 ? "−" : "", a = Math.abs(n);
    var top = (a === 1 ? "" : a) + "π";
    return sign + (d === 1 ? top : top + "/" + d);
  }
  // same but never reduced, e.g. "12π/6", "π/6"
  function piRaw(n, d) {
    if (n === 0) return "0";
    var sign = n < 0 ? "−" : "", a = Math.abs(n);
    return sign + (a === 1 ? "" : a) + "π/" + d;
  }
  var QUARTER_NAME = ["0", "π/2", "π", "3π/2", "2π"];

  function frac(top, bot) {
    return '<span class="bq-frac"><span>' + top + "</span><span>" + bot + "</span></span>";
  }
  function magHTML(m) {
    switch (m) {
      case "0": return "0";
      case "1": return "1";
      case "1/2": return frac("1", "2");
      case "r2/2": return frac("√2", "2");
      case "r3/2": return frac("√3", "2");
      case "r3/3": return frac("√3", "3");
      case "r3": return "√3";
      case "undef": return "undefined";
    }
    return m;
  }
  function magText(m) {
    return { "0": "0", "1": "1", "1/2": "1/2", "r2/2": "√2/2", "r3/2": "√3/2",
             "r3/3": "√3/3", "r3": "√3", "undef": "undefined" }[m];
  }
  function splitVal(v) { return v.charAt(0) === "-" ? { neg: true, mag: v.slice(1) } : { neg: false, mag: v }; }
  function valHTML(v) { var s = splitVal(v); return (s.neg ? "−" : "") + magHTML(s.mag); }
  function valText(v) { var s = splitVal(v); return (s.neg ? "−" : "") + magText(s.mag); }

  // ---------- settings (remembered per browser) ----------
  var settings = { sin: true, cos: true, tan: true, wide: false };
  try {
    var saved = JSON.parse(localStorage.getItem("bowtie-settings") || "null");
    if (saved) for (var k in settings) if (k in saved) settings[k] = !!saved[k];
  } catch (e) {}
  function saveSettings() { try { localStorage.setItem("bowtie-settings", JSON.stringify(settings)); } catch (e) {} }

  // ---------- problems ----------
  var lastKey = null;
  function makeProblem() {
    var fns = ["sin", "cos", "tan"].filter(function (f) { return settings[f]; });
    if (!fns.length) fns = ["sin"];
    var fn = pick(fns);
    var famPool = ["axis", "squat", "squat", "equal", "equal", "tall", "tall"];
    var p, tries = 0;
    do {
      var fam = pick(famPool), d = FAMILY_DEN[fam];
      var lo = settings.wide ? -2 * d : 0, hi = settings.wide ? 4 * d : 2 * d;
      var ns = [];
      for (var n = lo; n < hi; n++) {
        if (fam === "axis" || gcd(n, d) === 1) ns.push(n);
      }
      p = solve(pick(ns), d, fn);
      tries++;
    } while (p.key === lastKey && tries < 20);
    lastKey = p.key;
    return p;
  }

  // Work out the correct answer to every step.
  function solve(n0, d0, fn) {
    var g = gcd(n0, d0) || d0, n = n0 / g, d = d0 / g;
    var p = { n: n, d: d, fn: fn, key: fn + n + "/" + d, text: piText(n, d) };
    var cosS, sinS;
    if (d === 1 || d === 2) {                       // multiple of π/2
      p.family = "axis";
      p.quarters = 2 * n / d;
      p.corner = ENDS[mod(p.quarters, 4)];
      cosS = { right: 1, top: 0, left: -1, bottom: 0 }[p.corner];
      sinS = { right: 0, top: 1, left: 0, bottom: -1 }[p.corner];
    } else {
      p.family = { 6: "squat", 4: "equal", 3: "tall" }[d];
      var m = mod(n, 2 * d);
      p.q = Math.floor(2 * m / d) + 1;
      p.corner = "Q" + p.q;
      cosS = (p.q === 1 || p.q === 4) ? 1 : -1;
      sinS = (p.q <= 2) ? 1 : -1;
    }
    p.measure = FN_MEASURE[fn];
    p.size = sizeFor(p.family, p.corner, p.measure);
    var mag = (p.measure === "slope" ? SLOPE_MAG : LENGTH_MAG)[p.size];
    var sign = p.measure === "height" ? sinS : p.measure === "across" ? cosS : sinS * cosS;
    p.value = (mag === "0" || mag === "undef") ? mag : (sign < 0 ? "-" : "") + mag;
    p.answers = [p.family, p.corner, p.measure, p.size, p.value];
    return p;
  }

  function sizeFor(family, corner, measure) {
    if (family === "axis") {
      var flat = corner === "right" || corner === "left";
      if (measure === "height") return flat ? "none" : "full";
      if (measure === "across") return flat ? "full" : "none";
      return flat ? "none" : "undefined";
    }
    if (measure === "slope") return { squat: "shallow", equal: "equal", tall: "steep" }[family];
    if (family === "equal") return "equal";
    if (family === "squat") return measure === "height" ? "short" : "long";
    return measure === "height" ? "long" : "short";   // tall
  }

  // ---------- state ----------
  var st, score = { right: 0, total: 0 };
  function newProblem() { startProblem(makeProblem(), false); }
  function startProblem(p, followup) {
    st = { p: p, ans: [], fb: null, done: false, firstTry: true, skip: false, followup: followup };
    lastKey = p.key;
    render();
  }
  function stepNow() { return st.done ? 5 : st.ans.length; }

  function choose(step, val) {
    if (st.done) return;
    if (st.skip) {                       // answered straight from "skip to the answer"
      st.skip = false;
      if (val === st.p.value) {
        st.ans = st.p.answers.slice();
        st.done = true; st.skipped = true;
        score.total++; if (st.firstTry) score.right++;
      } else {
        st.firstTry = false; st.ans = [];
        st.fb = { step: "skip", wrong: val };
      }
      render(); focusPrompt(); return;
    }
    if (step !== st.ans.length) return;
    st.ans.push(val);
    st.fb = null;
    if (st.ans.length === 5) evaluate();
    render();
    focusPrompt();
  }
  function skipToEnd() {
    if (st.done) return;
    st.skip = true; st.fb = null;
    render(); focusPrompt();
  }
  function rewind(step) {
    if (st.done) return;
    st.skip = false;
    st.ans.length = step;
    st.fb = null;
    render();
    focusPrompt();
  }
  function evaluate() {
    var p = st.p, k = firstWrong(st.ans, p);
    if (k === -1) {
      st.done = true;
      score.total++;
      if (st.firstTry) score.right++;
      return;
    }
    st.firstTry = false;
    if (st.ans[4] === p.value) {
      // Right answer, wrong reasoning. Find a problem where the same mistake gives a wrong answer.
      var next = followUp(p, st.ans);
      if (next) {
        st.done = true; st.lucky = next;
        score.total++;
        return;
      }
      st.fb = { step: k, wrong: st.ans[k], rightValue: true };
      st.ans.length = k;
      return;
    }
    st.fb = { step: k, wrong: st.ans[k] };
    st.ans.length = k;
  }
  function firstWrong(ans, p) {
    for (var k = 0; k < 5; k++) if (ans[k] !== p.answers[k]) return k;
    return -1;
  }

  // ---------- lucky answers ----------
  // The value a student's own choices lead to, if each later step follows from the earlier ones.
  function cornerSigns(family, corner) {
    if (family === "axis") {
      var i = ENDS.indexOf(corner);
      if (i < 0) return null;
      return [[1, 0], [0, 1], [-1, 0], [0, -1]][i];
    }
    var q = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }[corner];
    if (!q) return null;
    return [(q === 1 || q === 4) ? 1 : -1, q <= 2 ? 1 : -1];
  }
  function chainValue(family, corner, measure, size) {
    var sg = cornerSigns(family, corner);
    var mag = (measure === "slope" ? SLOPE_MAG : LENGTH_MAG)[size];
    if (!sg || !mag) return null;
    var sign = measure === "height" ? sg[1] : measure === "across" ? sg[0] : sg[0] * sg[1];
    return (mag === "0" || mag === "undef") ? mag : (sign < 0 ? "-" : "") + mag;
  }

  // Carry each mistake over to problem q, where it still makes sense:
  //   bowtie mistake  -> any angle with the same true bowtie
  //   corner mistake  -> the same angle
  //   measure mistake -> the same function
  //   size mistake    -> the same bowtie and the same measure
  // Then follow the student's own logic to a value.
  function flat(corner) { return corner === "right" || corner === "left"; }
  function replay(p, ans, q) {
    var fam = q.family, cor = q.corner, mea = q.measure;
    if (ans[0] !== p.family && q.family === p.family) fam = ans[0];
    if (ans[1] !== p.corner && q.n === p.n && q.d === p.d) cor = ans[1];
    if (ans[2] !== p.measure && q.fn === p.fn) mea = ans[2];
    if (!cornerSigns(fam, cor)) return null;
    var siz = sizeFor(fam, cor, mea);
    // a size mistake: their size didn't follow from their own bowtie and measure
    var sizeSlip = ans[3] !== sizeFor(ans[0], ans[1], ans[2]);
    if (sizeSlip && fam === ans[0] && mea === ans[2] && (fam !== "axis" || flat(cor) === flat(ans[1]))) siz = ans[3];
    return chainValue(fam, cor, mea, siz);
  }

  function followUp(p, ans) {
    var tiers = [[], [], []];
    function consider(q, t) {
      if (q.key === p.key) return;
      var v = replay(p, ans, q);
      if (v !== null && v !== q.value) tiers[t].push(q);
    }
    // 1. the same angle with another function, 2. the same function at another angle
    // with the same bowtie, 3. another function at another angle with the same bowtie
    ["sin", "cos", "tan"].forEach(function (fn) {
      if (fn !== p.fn) consider(solve(p.n, p.d, fn), 0);
      var dd = FAMILY_DEN[p.family];
      for (var n = 0; n < 2 * dd; n++) {
        if (p.family !== "axis" && gcd(n, dd) !== 1) continue;
        var q = solve(n, dd, fn);
        if (q.n === p.n && q.d === p.d) continue;
        consider(q, fn === p.fn ? 1 : 2);
      }
    });
    for (var t = 0; t < 3; t++) if (tiers[t].length) return pick(tiers[t]);
    return null;
  }

  // ---------- layout ----------
  var grid = document.createElement("div");
  grid.className = "bq-grid";
  app.appendChild(grid);

  var figure = document.createElement("div");
  figure.className = "bq-figure";
  grid.appendChild(figure);

  var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "bq-svg", role: "img" }, figure);

  var panel = document.createElement("div");
  panel.className = "bq-panel";
  grid.appendChild(panel);

  var settingsBox = document.createElement("details");
  settingsBox.className = "bq-settings";
  app.appendChild(settingsBox);

  function svgEl(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function X(x) { return CX + x * R; }
  function Y(y) { return CY - y * R; }

  // ---------- drawing ----------
  function cornerPoint(family, corner) {
    if (family === "axis") {
      var a = { right: 0, top: PI / 2, left: PI, bottom: 3 * PI / 2 }[corner];
      return { x: Math.round(Math.cos(a)), y: Math.round(Math.sin(a)) };
    }
    var r = REF[family], q = +corner.slice(1);
    var ang = [r, PI - r, PI + r, 2 * PI - r][q - 1];
    return { x: Math.cos(ang), y: Math.sin(ang) };
  }

  function drawBase(g, cx, cy, rad, opts) {
    opts = opts || {};
    var ext = rad * 1.28;
    svgEl("line", { x1: cx - ext, y1: cy, x2: cx + ext, y2: cy, class: "bq-axis" }, g);
    svgEl("line", { x1: cx, y1: cy - ext, x2: cx, y2: cy + ext, class: "bq-axis" }, g);
    svgEl("circle", { cx: cx, cy: cy, r: rad, class: "bq-circle" }, g);
    if (opts.quads) {
      var o = rad * 1.18;
      [["Q1", 1, 1], ["Q2", -1, 1], ["Q3", -1, -1], ["Q4", 1, -1]].forEach(function (q) {
        var t = svgEl("text", { x: cx + q[1] * o, y: cy - q[2] * o + 6, class: "bq-quad" }, g);
        t.textContent = q[0];
      });
    }
  }

  // bowtie: two diagonals through the origin + the two vertical sides
  function drawBowtie(g, family, cx, cy, rad, cls) {
    function px(p) { return [cx + p.x * rad, cy - p.y * rad]; }
    if (family === "axis") {
      svgEl("line", { x1: cx - rad, y1: cy, x2: cx + rad, y2: cy, class: "bq-tie bq-tie-axis " + cls }, g);
      svgEl("line", { x1: cx, y1: cy - rad, x2: cx, y2: cy + rad, class: "bq-tie bq-tie-axis " + cls }, g);
      ENDS.forEach(function (e) {
        var p = px(cornerPoint("axis", e));
        svgEl("circle", { cx: p[0], cy: p[1], r: rad > 100 ? 6 : 4, class: "bq-corner " + cls }, g);
      });
      return;
    }
    var P = [1, 2, 3, 4].map(function (q) { return px(cornerPoint(family, "Q" + q)); });
    var pts = [P[0], P[2], P[1], P[3]];
    svgEl("line", { x1: P[0][0], y1: P[0][1], x2: P[2][0], y2: P[2][1], class: "bq-tie " + cls }, g);
    svgEl("line", { x1: P[1][0], y1: P[1][1], x2: P[3][0], y2: P[3][1], class: "bq-tie " + cls }, g);
    svgEl("line", { x1: P[0][0], y1: P[0][1], x2: P[3][0], y2: P[3][1], class: "bq-tie " + cls }, g);
    svgEl("line", { x1: P[1][0], y1: P[1][1], x2: P[2][0], y2: P[2][1], class: "bq-tie " + cls }, g);
    pts.forEach(function (p) {
      svgEl("circle", { cx: p[0], cy: p[1], r: rad > 100 ? 6 : 4, class: "bq-corner " + cls }, g);
    });
  }

  function label(text, x, y, color, anchor) {
    var t = svgEl("text", { x: x, y: y, class: "bq-label", fill: color, "text-anchor": anchor || "middle" }, svg);
    t.textContent = text;
    return t;
  }

  // The angle itself, drawn from the positive x-axis. Extra turns spiral outward.
  function drawArc(n, d) {
    var th = n * PI / d;
    if (Math.abs(th) < 1e-9) return;
    var steps = Math.max(24, Math.ceil(Math.abs(th) / 0.05)), pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = th * i / steps, rr = 0.2 + 0.07 * Math.abs(t) / (2 * PI);
      pts.push(X(rr * Math.cos(t)).toFixed(1) + "," + Y(rr * Math.sin(t)).toFixed(1));
    }
    svgEl("polyline", { points: pts.join(" "), class: "bq-arc", "marker-end": "url(#bq-arrow)" }, svg);
  }

  // Draw what the student has chosen so far (sel), with hint = which step is
  // being shown as the correct answer after a mistake.
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = svgEl("defs", {}, svg);
    var mk = svgEl("marker", { id: "bq-arrow", viewBox: "0 0 10 10", refX: 7, refY: 5,
      markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    svgEl("path", { d: "M0,0 L10,5 L0,10 z", fill: "#1a1a1a" }, mk);

    var p = st.p, fb = st.fb;

    // Bowtie mistake: show all four kinds side by side.
    if (fb && fb.step === 0) {
      svg.setAttribute("aria-label", "The four kinds of bowtie. The correct one is " + FAMILY_LABEL[p.family] + ".");
      FAMILIES.forEach(function (f, i) {
        var cx = i % 2 ? 580 : 200, cy = i < 2 ? 145 : 445, right = f === p.family;
        var g = svgEl("g", {}, svg);
        if (right) svgEl("rect", { x: cx - 142, y: cy - 138, width: 284, height: 290, rx: 10, class: "bq-best" }, g);
        drawBase(g, cx, cy, 95);
        drawBowtie(g, f, cx, cy, 95, right ? "bq-hint" : "");
        var t = svgEl("text", { x: cx, y: cy + 140, class: "bq-thumb" + (right ? " bq-thumb-on" : "") }, g);
        t.textContent = FAMILY_LABEL[f] + (f === "axis" ? " (Nπ/2)" : " (Nπ/" + FAMILY_DEN[f] + ")");
      });
      return;
    }

    var sel = st.ans.slice(), hint = -1;
    if (st.done && !st.lucky) sel = p.answers.slice();
    else if (fb && fb.step !== "skip") { sel[fb.step] = p.answers[fb.step]; hint = fb.step; }

    var family = sel[0], corner = sel[1], measure = sel[2], size = sel[3], value = sel[4];
    var desc = "Unit circle";
    drawBase(svg, CX, CY, R, { quads: true });

    if (family) {
      drawBowtie(svg, family, CX, CY, R, hint === 0 ? "bq-hint" : "");
      desc += " with a " + family + " bowtie";
    }

    // clickable corners while choosing the corner
    if (family && !st.done && !fb && st.ans.length === 1) {
      var opts = family === "axis" ? ENDS : ["Q1", "Q2", "Q3", "Q4"];
      opts.forEach(function (c) {
        var cp = cornerPoint(family, c);
        var h = svgEl("circle", { cx: X(cp.x), cy: Y(cp.y), r: 22, class: "bq-hot", tabindex: -1 }, svg);
        h.addEventListener("click", function () { choose(1, c); });
      });
    }

    if (!corner) { svg.setAttribute("aria-label", desc); return; }
    var P = cornerPoint(family, corner), Px = X(P.x), Py = Y(P.y), Fx = X(P.x);
    var hintCls = hint === 1 ? " bq-hint" : "";

    if (family !== "axis") {
      svgEl("polygon", { points: [X(0), Y(0), Fx, Y(0), Px, Py].join(" "), class: "bq-tri" + hintCls }, svg);
      // right-angle mark at the foot
      var sx = P.x > 0 ? -1 : 1, sy = P.y > 0 ? -1 : 1, k = 11;
      svgEl("path", { d: "M" + (Fx + sx * k) + "," + Y(0) + " v" + (sy * k) + " h" + (-sx * k), class: "bq-right" }, svg);
    }
    if (hint === 1 || (st.done && !st.lucky)) drawArc(p.n, p.d);

    desc += ", point in " + corner;
    if (measure) {
      var mh = hint === 2 ? " bq-hint-seg" : "";
      var col = COL[measure], words = [MEASURE_LABEL[measure].toLowerCase()];
      if (size) words.push(SIZE_LABEL[size].toLowerCase());
      var txt = words.join(": ");
      if (value) txt += " = " + valText(value);
      if (hint === 3 || hint === 4) txt = "✓ " + txt;
      if (measure === "height") {
        svgEl("line", { x1: Fx, y1: Y(0), x2: Px, y2: Py, class: "bq-seg" + mh, stroke: col }, svg);
        var right = P.x >= 0;
        label(txt, Fx + (right ? 14 : -14), (Y(0) + Py) / 2 + 5 + (P.y === 0 ? -18 : 0), col, right ? "start" : "end");
      } else if (measure === "across") {
        svgEl("line", { x1: X(0), y1: Y(0), x2: Fx, y2: Y(0), class: "bq-seg" + mh, stroke: col }, svg);
        var below = P.y >= 0;
        var lx = P.x === 0 ? X(0) + 12 : (X(0) + Fx) / 2;
        label(txt, lx, Y(0) + (below ? 26 : -14), col, P.x === 0 ? "start" : "middle");
      } else {
        svgEl("line", { x1: X(0), y1: Y(0), x2: Px, y2: Py, class: "bq-seg" + mh, stroke: col }, svg);
        if (family !== "axis") {
          svgEl("line", { x1: X(0), y1: Y(0), x2: Fx, y2: Y(0), class: "bq-run" }, svg);
          svgEl("line", { x1: Fx, y1: Y(0), x2: Px, y2: Py, class: "bq-run" }, svg);
        }
        // put the label on the outside of the radius
        // (away from the triangle, which sits between the radius and the x-axis)
        var mx = X(P.x / 2), my = Y(P.y / 2), nx = -P.y, ny = P.x;
        var flip = P.x === 0 ? nx < 0 : P.y === 0 ? ny < 0 : ny * P.y < 0;
        if (flip) { nx = -nx; ny = -ny; }
        label(txt, mx + nx * 20, my - ny * 20 + 5, col, nx < -0.01 ? "end" : nx > 0.01 ? "start" : "middle");
      }
      desc += ", showing the " + measure;
    }
    svgEl("circle", { cx: X(0), cy: Y(0), r: 3.5, class: "bq-dot" }, svg);
    svgEl("circle", { cx: Px, cy: Py, r: 8, class: "bq-point" + hintCls }, svg);
    svg.setAttribute("aria-label", desc);
  }

  // ---------- feedback text ----------
  function feedback(k, wrong) {
    var p = st.p, A = p.text, fn = p.fn, out = "";
    if (k === 0) {
      out = "<p>You picked <b>" + FAMILY_LABEL[wrong].toLowerCase() + "</b>.</p>";
      if (p.family === "axis") {
        var asHalves = p.d === 2 ? "" : " = " + piRaw(p.quarters, 2);
        out += "<p>θ = " + A + asHalves + " is a whole number of quarter turns, so the point lands right on an axis. " +
          "All Nπ/2 angles are <b>axis</b> angles. Memorize that.</p>";
      } else {
        out += "<p>θ = " + A + " has a denominator of " + p.d + ". All Nπ/" + p.d +
          " reference bowties are <b>" + p.family + "</b>. Memorize that.</p>";
      }
      out += "<p class=\"bq-small\">The picture shows all four kinds of bowtie.</p>";
    } else if (k === 1) {
      out = "<p>You picked <b>" + (p.family === "axis" ? "the " + wrong + " end" : wrong) + "</b>.</p>";
      out += "<p>" + (p.family === "axis" ? endExplain(p) : quadExplain(p)) + "</p>";
      out += "<p class=\"bq-small\">The picture shows the angle and the correct corner.</p>";
    } else if (k === 2) {
      out = "<p>You picked <b>" + wrong + "</b>.</p><p>" + {
        sin: "<b>sin</b> is the <b>height</b> of the point: how far up or down it is from the x-axis.",
        cos: "<b>cos</b> is the distance <b>across</b>: how far left or right the point is from the origin.",
        tan: "<b>tan</b> is the <b>slope</b> of the radius: height ÷ across."
      }[fn] + "</p>";
    } else if (k === 3) {
      out = "<p>You picked <b>" + wrong + "</b>.</p><p>" + sizeExplain(p) + "</p>";
    } else {
      var w = splitVal(wrong), r = splitVal(p.value);
      out = "<p>You picked <b>" + valHTML(wrong) + "</b>.</p>";
      if (w.mag !== r.mag) out += magExplain(p);
      else out += "<p>" + signExplain(p) + "</p>";
    }
    return out;
  }

  function quadExplain(p) {
    var n = p.n, d = p.d, m = mod(n, 2 * d), pre = "";
    var turns = (n - m) / (2 * d);
    if (turns > 0) {
      pre = "First take away " + (turns === 1 ? "one full turn" : turns + " full turns") + ": " +
        p.text + " − " + piRaw(turns * 2 * d, d) + " = " + piText(m, d) + ". ";
    } else if (turns < 0) {
      pre = "A negative angle goes clockwise. Add " + (turns === -1 ? "one full turn" : -turns + " full turns") + ": " +
        p.text + " + " + piRaw(-turns * 2 * d, d) + " = " + piText(m, d) + ". ";
    }
    var D = d, M = m;
    if (d === 3) { D = 6; M = 2 * m; pre += piText(m, d) + " = " + piRaw(M, 6) + ". "; }
    var q = p.q, L = (q - 1) * D / 2, U = q * D / 2;
    var Ltxt = L === 0 ? "0" : piRaw(L, D) + " (= " + QUARTER_NAME[q - 1] + ")";
    var Utxt = piRaw(U, D) + " (= " + QUARTER_NAME[q] + ")";
    var body;
    if (M - L < U - M) body = piRaw(M, D) + " is just past " + Ltxt;
    else if (U - M < M - L) body = piRaw(M, D) + " is just short of " + Utxt;
    else body = piRaw(M, D) + " is halfway between " + Ltxt + " and " + Utxt;
    return pre + body + ", so it's in <b>Q" + q + "</b>.";
  }

  function endExplain(p) {
    var k = p.quarters, end = p.corner;
    if (k === 0) return "θ = 0 means no turn at all, so the point is at the <b>right</b> end.";
    var word = Math.abs(k) === 1 ? "quarter turn" : "quarter turns";
    var s = "θ = " + p.text + (p.d === 2 ? "" : " = " + piRaw(k, 2)) + " is " + Math.abs(k) + " " + word +
      (k < 0 ? " clockwise" : "") + " from the positive x-axis";
    if (k < 0 || k > 3) s += ". Every 4 quarter turns is a full circle, so it ends up where " + mod(k, 4) +
      " quarter turn" + (mod(k, 4) === 1 ? "" : "s") + " would";
    return s + ": the <b>" + end + "</b> end.";
  }

  function sizeExplain(p) {
    var f = p.family, m = p.measure, s = p.size;
    if (f === "axis") {
      var flat = p.corner === "right" || p.corner === "left";
      if (m === "height") return flat ? "On the x-axis the point has no height at all, so the height is <b>none</b>."
        : "At the " + p.corner + " of the circle the point is a whole radius away from the x-axis, so the height is <b>full</b>.";
      if (m === "across") return flat ? "On the x-axis the point is a whole radius away from the origin, so the distance across is <b>full</b>."
        : "At the " + p.corner + " of the circle the point is straight " + (p.corner === "top" ? "above" : "below") +
          " the origin, so the distance across is <b>none</b>.";
      return flat ? "The radius lies flat along the x-axis, so the slope is <b>none</b>."
        : "The radius points straight up and down, so the slope is <b>undefined</b>.";
    }
    if (m === "slope") {
      return {
        squat: "A squat triangle has a short height and a long distance across, so its radius is <b>shallow</b> (flatter than 45°).",
        equal: "An equal triangle has the same height and distance across, so its radius is exactly 45°: the slope is <b>equal</b>.",
        tall: "A tall triangle has a long height and a short distance across, so its radius is <b>steep</b> (steeper than 45°)."
      }[f];
    }
    var lead = {
      squat: "In a squat triangle the height is the short side and the distance across is the long side.",
      equal: "In an equal triangle the height and the distance across are the same.",
      tall: "In a tall triangle the height is the long side and the distance across is the short side."
    }[f];
    return lead + " So the " + (m === "height" ? "height" : "distance across") + " is <b>" + s + "</b>.";
  }

  function magExplain(p) {
    var s = p.size;
    if (p.measure !== "slope") {
      var rows = LADDER.map(function (r) {
        var on = r[0] === s ? ' class="bq-on"' : "";
        return "<tr" + on + "><th>" + cap(r[0]) + "</th><td>√(" + r[1] + "/4)</td><td>=</td><td>" +
          magHTML(LENGTH_MAG[r[0]]) + "</td></tr>";
      }).join("");
      return "<p><b>" + cap(s) + "</b> is √(" + LADDER.filter(function (r) { return r[0] === s; })[0][1] +
        "/4) = " + magHTML(LENGTH_MAG[s]) + ". Every length comes from the same ladder:</p>" +
        '<table class="bq-ladder">' + rows + "</table>";
    }
    var why = {
      none: "A flat radius has no height: 0 ÷ 1 = <b>0</b>.",
      shallow: "A shallow (squat) radius: (1/2) ÷ (√3/2) = 1/√3 = <b>√3/3</b>.",
      equal: "An equal radius: (√2/2) ÷ (√2/2) = <b>1</b>.",
      steep: "A steep (tall) radius: (√3/2) ÷ (1/2) = <b>√3</b>.",
      undefined: "A vertical radius has no distance across: 1 ÷ 0 can't be done, so the slope is <b>undefined</b>."
    }[s];
    return "<p>Slope = height ÷ across. " + why + "</p>";
  }

  function signExplain(p) {
    var m = p.measure;
    if (p.family === "axis") {
      var c = p.corner;
      if (m === "height") return "At the " + c + " end the point is " + (c === "top" ? "above" : "below") +
        " the x-axis, so the height is " + (c === "top" ? "positive" : "negative") + ".";
      return "At the " + c + " end the point is " + (c === "right" ? "right" : "left") +
        " of the origin, so the distance across is " + (c === "right" ? "positive" : "negative") + ".";
    }
    var q = p.q;
    if (m === "height") return "In Q" + q + " the point is " + (q <= 2 ? "above" : "below") +
      " the x-axis, so the height is " + (q <= 2 ? "positive" : "negative") + ".";
    if (m === "across") return "In Q" + q + " the point is " + (q === 1 || q === 4 ? "right" : "left") +
      " of the y-axis, so the distance across is " + (q === 1 || q === 4 ? "positive" : "negative") + ".";
    var up = q === 1 || q === 3;
    return "In Q" + q + " the radius goes " + (up ? "uphill" : "downhill") + " from left to right, so the slope is " +
      (up ? "positive" : "negative") + ".";
  }

  // ---------- panel ----------
  var STEP_NAMES = ["Bowtie", "Corner", "Measure", "Size", "Value"];

  function prompt(k) {
    var p = st.p, a = st.ans, fam = a[0];
    var measureWord = { height: "height", across: "distance across", slope: "slope" }[a[2]];
    if (k === 0) {
      var den = p.d === 1 ? 2 : p.d;                 // π, 3π, ... are Nπ/2 angles too
      return { q: p.n === 0 ? "What kind of bowtie does θ = 0 have?" : "What kind of bowtie do all Nπ/" + den + " angles have?",
        opts: FAMILIES.map(function (f) { return [f, FAMILY_LABEL[f]]; }) };
    }
    if (k === 1) {
      if (fam === "axis") return { q: "Which end of the axis is " + p.text + " on?",
        opts: ENDS.map(function (e) { return [e, END_LABEL[e]]; }) };
      return { q: "Which quadrant is " + p.text + " in? Pick a corner of the bowtie.",
        opts: ["Q1", "Q2", "Q3", "Q4"].map(function (q) { return [q, q]; }) };
    }
    if (k === 2) return {
      q: "Do we want the height, distance across, or slope of the radius?",
      opts: MEASURES.map(function (m) { return [m, MEASURE_LABEL[m]]; }) };
    if (k === 3) {
      if (a[2] === "slope") return { q: "Is the slope none, shallow, equal, steep, or undefined?",
        opts: SLOPE_SIZES.map(function (s) { return [s, SIZE_LABEL[s]]; }) };
      return { q: "Is the " + measureWord + " none, short, equal, long, or full?",
        opts: LENGTH_SIZES.map(function (s) { return [s, SIZE_LABEL[s]]; }) };
    }
    var where = fam === "axis" ? "at the " + a[1] + " end" : "in " + a[1];
    return {
      q: "You chose " + (a[3] === "none" ? "no" : /^[aeiou]/.test(a[3]) ? "an " + a[3] : "a " + a[3]) + " " + measureWord + " " + where + ". What is " + p.fn + "(" + p.text + ")?",
      opts: (a[2] === "slope" ? SLOPE_VALUES : LENGTH_VALUES).map(function (v) { return [v, valHTML(v)]; }),
      values: true };
  }

  function answerLabel(k, v) {
    if (k === 0) return FAMILY_LABEL[v];
    if (k === 1) return st.ans[0] === "axis" ? END_LABEL[v] : v;
    if (k === 2) return MEASURE_LABEL[v];
    if (k === 3) return SIZE_LABEL[v];
    return valHTML(v);
  }

  function render() {
    draw();
    var p = st.p, k = stepNow(), h = "";
    h += '<div class="bq-head"><div class="bq-problem">' + p.fn + "(" + p.text + ")</div>" +
      (st.followup ? '<div class="bq-tag">Follow-up</div>' : "") +
      '<div class="bq-score">' + (score.total ? "First try: " + score.right + " of " + score.total : "") + "</div></div>";

    h += '<ol class="bq-trail">';
    for (var i = 0; i < 5; i++) {
      var cls = i < st.ans.length ? "bq-done" : i === k ? "bq-now" : "";
      var inner = i < st.ans.length ? STEP_NAMES[i] + ": <b>" + answerLabel(i, st.ans[i]) + "</b>" : STEP_NAMES[i];
      if (i < st.ans.length && !st.done)
        h += '<li class="' + cls + '"><button type="button" data-rewind="' + i + '" title="Change this answer">' + inner + "</button></li>";
      else h += '<li class="' + cls + '"><span>' + inner + "</span></li>";
    }
    h += "</ol>";

    if (st.fb) {
      if (st.fb.step === "skip")
        h += '<div class="bq-fb" role="alert"><div class="bq-fb-title">Not quite.</div><p>You picked <b>' +
          valHTML(st.fb.wrong) + "</b>. Let's work through it one step at a time.</p></div>";
      else h += '<div class="bq-fb" role="alert"><div class="bq-fb-title">' +
        (st.fb.rightValue ? "Right answer, but step " : "Not quite. Let\'s fix step ") + (st.fb.step + 1) +
        " (" + STEP_NAMES[st.fb.step].toLowerCase() + ")" + (st.fb.rightValue ? " was off." : ".") + "</div>" + feedback(st.fb.step, st.fb.wrong) +
        '<p class="bq-small">Now pick again.</p></div>';
    }

    if (st.done && st.lucky) {
      var nq = st.lucky;
      h += '<div class="bq-fb bq-lucky" role="alert"><div class="bq-fb-title">You got lucky.</div><p>' +
        p.fn + "(" + p.text + ") = " + valHTML(p.value) + ". That answer is correct… by accident. Try this one.</p></div>" +
        '<button type="button" class="bq-next" data-followup>Try ' + nq.fn + "(" + nq.text + ") →</button>";
    } else if (st.done) {
      h += '<div class="bq-win" role="status"><div class="bq-win-title">' +
        (st.firstTry ? "Correct, first try!" : "Correct!") + "</div><p>" + p.fn + "(" + p.text + ") = <b>" +
        valHTML(p.value) + "</b></p></div>" +
        '<button type="button" class="bq-next">Next problem →</button>';
    } else {
      var pr = st.skip ? {
        q: "What is " + p.fn + "(" + p.text + ")?",
        opts: (FN_MEASURE[p.fn] === "slope" ? SLOPE_VALUES : LENGTH_VALUES).map(function (v) { return [v, valHTML(v)]; }),
        values: true } : prompt(k);
      if (st.skip) k = 4;
      h += '<div class="bq-prompt" tabindex="-1"><div class="bq-step">' + (st.skip ? "Skip to the answer" : "Step " + (k + 1) + " of 5") + "</div><div class=\"bq-q\">" +
        esc(pr.q) + "</div>" + (pr.sub ? '<div class="bq-sub">' + esc(pr.sub) + "</div>" : "") + "</div>";
      h += '<div class="bq-opts' + (pr.values ? " bq-values" : "") + '">';
      pr.opts.forEach(function (o) {
        h += '<button type="button" data-choose="' + o[0] + '">' + o[1] + "</button>";
      });
      h += "</div>";
      if (st.skip) h += '<button type="button" class="bq-skip" data-unskip>← Go back to the steps</button>';
      else if (k < 4) h += '<button type="button" class="bq-skip" data-skip>Know it already? Skip to the answer →</button>';
    }
    panel.innerHTML = h;

    panel.querySelectorAll("[data-choose]").forEach(function (b) {
      b.addEventListener("click", function () { choose(k, b.getAttribute("data-choose")); });
    });
    panel.querySelectorAll("[data-rewind]").forEach(function (b) {
      b.addEventListener("click", function () { rewind(+b.getAttribute("data-rewind")); });
    });
    var sk = panel.querySelector("[data-skip]");
    if (sk) sk.addEventListener("click", skipToEnd);
    var us = panel.querySelector("[data-unskip]");
    if (us) us.addEventListener("click", function () { st.skip = false; render(); focusPrompt(); });
    var next = panel.querySelector(".bq-next");
    if (next) next.addEventListener("click", function () {
      if (st.lucky) startProblem(st.lucky, true); else newProblem();
      focusPrompt();
    });
  }

  function focusPrompt() {
    var el = panel.querySelector(".bq-fb") || panel.querySelector(".bq-prompt") || panel.querySelector(".bq-next");
    if (el && el.focus) { if (!el.hasAttribute("tabindex") && el.tagName !== "BUTTON") el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
  }

  // ---------- settings ----------
  function renderSettings() {
    settingsBox.innerHTML = "<summary>Practice settings</summary><div class=\"bq-set\">" +
      "<span>Functions:</span>" +
      ["sin", "cos", "tan"].map(function (f) {
        return '<label><input type="checkbox" data-set="' + f + '"' + (settings[f] ? " checked" : "") + "> " + f + "</label>";
      }).join("") +
      '<label class="bq-wide"><input type="checkbox" data-set="wide"' + (settings.wide ? " checked" : "") +
      "> Include negative angles and angles past 2π</label></div>";
    settingsBox.querySelectorAll("[data-set]").forEach(function (c) {
      c.addEventListener("change", function () {
        var key = c.getAttribute("data-set");
        settings[key] = c.checked;
        if (!settings.sin && !settings.cos && !settings.tan) { settings[key] = true; c.checked = true; }
        saveSettings();
        newProblem();
      });
    });
  }

  // Test hook: start a specific problem, e.g. window.__bowtie.set(11, 6, "sin")
  window.__bowtie = {
    set: function (n, d, fn) { startProblem(solve(n, d, fn), false); },
    replay: function (p, ans, q) { return replay(p, ans, q); },
    solve: solve,
    state: function () { return st; }
  };

  renderSettings();
  newProblem();
})();
