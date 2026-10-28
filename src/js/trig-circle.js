/* Interactive unit circle: the six trig functions as segments.
   Drag the point P around the circle. Hover a triangle (or an identity card)
   to highlight the Pythagorean triangle behind that identity. */
(function () {
  var app = document.getElementById("trig-app");
  if (!app) return;

  var NS = "http://www.w3.org/2000/svg";
  var W = 760, H = 560;          // viewBox size
  var CX = 300, CY = 300;        // circle center in px
  var R = 140;                   // unit length in px
  var EPS = 0.035;               // treat |sin| or |cos| below this as undefined

  var COLORS = {
    cos: "#1d4ed8", sin: "#dc2626", tan: "#059669",
    cot: "#d97706", sec: "#7c3aed", csc: "#0891b2"
  };

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // math coords (unit circle) -> svg px
  function X(x) { return CX + x * R; }
  function Y(y) { return CY - y * R; }

  var svg = el("svg", {
    viewBox: "0 0 " + W + " " + H, class: "trig-svg",
    role: "img", "aria-label": "Unit circle with the six trig functions drawn as segments"
  }, app);

  var defs = el("defs", {}, svg);
  var clip = el("clipPath", { id: "trig-clip" }, defs);
  el("rect", { x: 0, y: 0, width: W, height: H }, clip);

  var world = el("g", { "clip-path": "url(#trig-clip)" }, svg);

  // axes and circle
  el("line", { x1: 0, y1: CY, x2: W, y2: CY, class: "trig-axis" }, world);
  el("line", { x1: CX, y1: 0, x2: CX, y2: H, class: "trig-axis" }, world);
  el("circle", { cx: CX, cy: CY, r: R, class: "trig-circle" }, world);

  // Pythagorean triangles (drawn under the segments)
  var triangles = {
    pyth: el("polygon", { class: "trig-tri", "data-id": "pyth" }, world),
    tansec: el("polygon", { class: "trig-tri", "data-id": "tansec" }, world),
    cotcsc: el("polygon", { class: "trig-tri", "data-id": "cotcsc" }, world)
  };
  // sin/cos triangle sits inside the tan/sec triangle, so put it on top
  world.appendChild(triangles.pyth);

  // tangent line (full, faint) and radius
  var tangentLine = el("line", { class: "trig-tangent" }, world);
  var radius = el("line", { class: "trig-radius" }, world);
  var arc = el("path", { class: "trig-arc" }, world);
  var thetaLabel = el("text", { class: "trig-theta" }, world);
  thetaLabel.textContent = "θ";

  // the six segments
  var segs = {};
  ["sec", "csc", "cos", "sin", "tan", "cot"].forEach(function (k) {
    segs[k] = el("line", { class: "trig-seg", stroke: COLORS[k] }, world);
  });
  var rightAngle = el("path", { class: "trig-right" }, world);

  // labels
  var labels = {};
  ["cos", "sin", "tan", "cot", "sec", "csc"].forEach(function (k) {
    var t = el("text", { class: "trig-label", fill: COLORS[k] }, svg);
    t.textContent = k + " θ";
    labels[k] = t;
  });
  var oneLabel = el("text", { class: "trig-label trig-one" }, svg);
  oneLabel.textContent = "1";

  // points
  var dots = {
    O: el("circle", { r: 3.5, class: "trig-dot" }, svg),
    F: el("circle", { r: 3.5, class: "trig-dot" }, svg),
    S: el("circle", { r: 3.5, class: "trig-dot" }, svg),
    C: el("circle", { r: 3.5, class: "trig-dot" }, svg)
  };
  var handleHalo = el("circle", { r: 18, class: "trig-halo" }, svg);
  var handle = el("circle", { r: 9, class: "trig-handle", tabindex: 0,
    role: "slider", "aria-label": "Point on the circle. Drag, or use arrow keys to change the angle." }, svg);

  // readout panel + identity cards (built in HTML)
  var panel = document.createElement("div");
  panel.className = "trig-panel";
  app.appendChild(panel);

  var readout = document.createElement("div");
  readout.className = "trig-readout";
  panel.appendChild(readout);

  var angleRow = document.createElement("div");
  angleRow.className = "trig-angle";
  readout.appendChild(angleRow);

  var table = document.createElement("table");
  table.className = "trig-table";
  readout.appendChild(table);
  var cells = {};
  ["sin", "cos", "tan", "cot", "sec", "csc"].forEach(function (k) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.innerHTML = '<span class="trig-swatch" style="background:' + COLORS[k] + '"></span>' + k + " θ";
    var td = document.createElement("td");
    tr.appendChild(th); tr.appendChild(td); table.appendChild(tr);
    cells[k] = td;
  });

  // angle as a multiple of pi/12, written like "π/3" or "7π/6" (null if not one)
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function piFraction(k) {           // k twelfths of pi, 0 <= k < 24
    if (k === 0) return "0";
    var g = gcd(k, 12), num = k / g, den = 12 / g;
    var top = (num === 1 ? "" : num) + "π";
    return den === 1 ? top : top + "/" + den;
  }

  var presets = document.createElement("div");
  presets.className = "trig-presets";
  [2, 3, 4, 8, 14, 21].forEach(function (k) {   // π/6, π/4, π/3, 2π/3, 7π/6, 7π/4
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = piFraction(k);
    b.addEventListener("click", function () { setAngle(k * Math.PI / 12); });
    presets.appendChild(b);
  });
  readout.appendChild(presets);

  var cards = document.createElement("div");
  cards.className = "trig-cards";
  panel.appendChild(cards);
  var CARD_DEFS = [
    { id: "pyth", title: "sin²θ + cos²θ = 1",
      legs: "legs: cos θ, sin θ — hypotenuse: 1" },
    { id: "tansec", title: "1 + tan²θ = sec²θ",
      legs: "legs: 1, tan θ — hypotenuse: sec θ" },
    { id: "cotcsc", title: "1 + cot²θ = csc²θ",
      legs: "legs: 1, cot θ — hypotenuse: csc θ" }
  ];
  var cardEls = {};
  CARD_DEFS.forEach(function (c) {
    var d = document.createElement("div");
    d.className = "trig-card";
    d.tabIndex = 0;
    d.setAttribute("data-id", c.id);
    d.innerHTML = '<div class="trig-card-title">' + c.title + '</div>' +
      '<div class="trig-card-legs">' + c.legs + '</div>' +
      '<div class="trig-card-check"></div>';
    cards.appendChild(d);
    cardEls[c.id] = d;
  });

  // ---------- highlighting ----------
  var active = null;
  function highlight(id) {
    active = id;
    for (var k in triangles) triangles[k].classList.toggle("on", k === id);
    for (var c in cardEls) cardEls[c].classList.toggle("on", c === id);
    var lit = { pyth: ["cos", "sin"], tansec: ["tan", "sec"], cotcsc: ["cot", "csc"] }[id] || [];
    for (var s in segs) {
      var dim = id && lit.indexOf(s) < 0;
      segs[s].classList.toggle("dim", !!dim);
      labels[s].classList.toggle("dim", !!dim);
    }
    radius.classList.toggle("lit", !!id);
  }
  function bindHover(node, id) {
    node.addEventListener("pointerenter", function () { if (!dragging) highlight(id); });
    node.addEventListener("pointerleave", function () { if (!dragging) highlight(null); });
    node.addEventListener("focus", function () { highlight(id); });
    node.addEventListener("blur", function () { highlight(null); });
  }
  for (var c2 in cardEls) bindHover(cardEls[c2], c2);
  // triangles: decide from whatever is under the pointer (robust after a drag)
  var hoverTri = null;
  svg.addEventListener("pointermove", function (evt) {
    if (dragging) return;
    var tgt = evt.target;
    var id = tgt && tgt.classList && tgt.classList.contains("trig-tri") ? tgt.getAttribute("data-id") : null;
    if (id !== hoverTri) { hoverTri = id; highlight(id); }
  });
  svg.addEventListener("pointerleave", function () {
    if (hoverTri) { hoverTri = null; highlight(null); }
  });

  // ---------- geometry ----------
  var theta = Math.PI / 3;

  function setLine(node, x1, y1, x2, y2) {
    node.setAttribute("x1", X(x1)); node.setAttribute("y1", Y(y1));
    node.setAttribute("x2", X(x2)); node.setAttribute("y2", Y(y2));
  }
  function show(node, on) { node.style.display = on ? "" : "none"; }
  function fmt(v) {
    if (!isFinite(v) || Math.abs(v) > 1e6) return "undefined";
    var s = v.toFixed(3);
    return s === "-0.000" ? "0.000" : s;
  }

  // place a label next to segment (x1,y1)-(x2,y2), pushed away from point (ax,ay)
  function placeLabel(node, x1, y1, x2, y2, ax, ay, extra) {
    var mx = (X(x1) + X(x2)) / 2, my = (Y(y1) + Y(y2)) / 2;
    var dx = X(x2) - X(x1), dy = Y(y2) - Y(y1);
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    // point the normal away from the "anchor" (usually the triangle's interior)
    if ((mx - X(ax)) * nx + (my - Y(ay)) * ny < 0) { nx = -nx; ny = -ny; }
    var off = 16 + (extra || 0);
    var lx = mx + nx * off, ly = my + ny * off;
    // keep labels on screen
    lx = Math.max(30, Math.min(W - 30, lx));
    ly = Math.max(16, Math.min(H - 8, ly));
    node.setAttribute("x", lx);
    node.setAttribute("y", ly + 5);
  }

  function draw() {
    var c = Math.cos(theta), s = Math.sin(theta);
    var px = c, py = s;
    var cosOK = Math.abs(c) > EPS, sinOK = Math.abs(s) > EPS;
    var Sx = cosOK ? 1 / c : null;   // tangent line meets x-axis at (sec, 0)
    var Cy = sinOK ? 1 / s : null;   // tangent line meets y-axis at (0, csc)

    // radius, foot of the perpendicular
    setLine(radius, 0, 0, px, py);
    setLine(segs.cos, 0, 0, px, 0);
    setLine(segs.sin, px, 0, px, py);

    // tangent line at P: direction (-s, c); draw it long and let the clip trim it
    var L = 20;
    setLine(tangentLine, px + s * L, py - c * L, px - s * L, py + c * L);

    show(segs.tan, cosOK); show(segs.sec, cosOK); show(labels.tan, cosOK); show(labels.sec, cosOK);
    show(segs.cot, sinOK); show(segs.csc, sinOK); show(labels.cot, sinOK); show(labels.csc, sinOK);
    show(dots.S, cosOK); show(dots.C, sinOK);
    show(triangles.tansec, cosOK); show(triangles.cotcsc, sinOK);

    if (cosOK) {
      setLine(segs.tan, px, py, Sx, 0);
      setLine(segs.sec, 0, 0, Sx, 0);
      triangles.tansec.setAttribute("points",
        [X(0), Y(0), X(px), Y(py), X(Sx), Y(0)].join(" "));
      dots.S.setAttribute("cx", X(Sx)); dots.S.setAttribute("cy", Y(0));
    }
    if (sinOK) {
      setLine(segs.cot, px, py, 0, Cy);
      setLine(segs.csc, 0, 0, 0, Cy);
      triangles.cotcsc.setAttribute("points",
        [X(0), Y(0), X(px), Y(py), X(0), Y(Cy)].join(" "));
      dots.C.setAttribute("cx", X(0)); dots.C.setAttribute("cy", Y(Cy));
    }
    triangles.pyth.setAttribute("points",
      [X(0), Y(0), X(px), Y(0), X(px), Y(py)].join(" "));

    // right-angle mark at the foot of sin
    var m = 0.08, sx = c >= 0 ? -1 : 1, sy = s >= 0 ? 1 : -1;
    rightAngle.setAttribute("d", "M" + X(px + sx * m) + " " + Y(0) +
      " L" + X(px + sx * m) + " " + Y(sy * m) + " L" + X(px) + " " + Y(sy * m));
    show(rightAngle, cosOK && sinOK);

    // theta arc
    var ar = 0.28;
    var t = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    var large = t > Math.PI ? 1 : 0;
    arc.setAttribute("d", "M" + X(ar) + " " + Y(0) + " A" + ar * R + " " + ar * R +
      " 0 " + large + " 0 " + X(ar * Math.cos(t)) + " " + Y(ar * Math.sin(t)));
    var lt = t / 2;
    thetaLabel.setAttribute("x", X(0.42 * Math.cos(lt)) - 5);
    thetaLabel.setAttribute("y", Y(0.42 * Math.sin(lt)) + 6);

    // labels — each one pushed to a fixed side so overlapping segments never share a spot
    var up = py >= 0 ? 1 : -1, right = px >= 0 ? 1 : -1;
    // cos: same side of the x-axis as P (inside the small triangle)
    placeLabel(labels.cos, 0, 0, px, 0, px / 2, -up, -2);
    // sec: the other side of the x-axis
    if (cosOK) placeLabel(labels.sec, 0, 0, Sx, 0, Sx / 2, up, 2);
    // sin: toward the y-axis (inside the small triangle)
    placeLabel(labels.sin, px, 0, px, py, px + right, py / 2, 14);
    // tan, cot: away from the origin
    if (cosOK) placeLabel(labels.tan, px, py, Sx, 0, 0, 0, 2);
    if (sinOK) placeLabel(labels.cot, px, py, 0, Cy, 0, 0, 2);
    // csc: the side of the y-axis away from P
    if (sinOK) placeLabel(labels.csc, 0, 0, 0, Cy, right, Cy / 2, 16);
    // 1: on the side of the radius away from the x-axis foot F
    placeLabel(oneLabel, 0, 0, px, py, px, 0, -2);

    // dots
    dots.O.setAttribute("cx", X(0)); dots.O.setAttribute("cy", Y(0));
    dots.F.setAttribute("cx", X(px)); dots.F.setAttribute("cy", Y(0));
    handle.setAttribute("cx", X(px)); handle.setAttribute("cy", Y(py));
    handleHalo.setAttribute("cx", X(px)); handleHalo.setAttribute("cy", Y(py));

    // readouts
    var rad = t >= 2 * Math.PI - 0.0005 ? 0 : t;
    var k = Math.round(rad / (Math.PI / 12));
    var exact = Math.abs(rad - k * Math.PI / 12) < 0.0005 ? piFraction(k % 24) : null;
    angleRow.textContent = "θ = " + (exact && exact !== "0" ? exact + " ≈ " : "") +
      rad.toFixed(3) + " rad";
    handle.setAttribute("aria-valuenow", rad.toFixed(3));
    handle.setAttribute("aria-valuetext", (exact ? exact + " radians" : rad.toFixed(2) + " radians"));
    var vals = {
      sin: s, cos: c,
      tan: cosOK ? s / c : NaN, cot: sinOK ? c / s : NaN,
      sec: cosOK ? 1 / c : NaN, csc: sinOK ? 1 / s : NaN
    };
    for (var k in cells) cells[k].textContent = fmt(vals[k]);

    function sq(v) { return (v * v).toFixed(3); }
    cardEls.pyth.querySelector(".trig-card-check").textContent =
      sq(s) + " + " + sq(c) + " = " + (s * s + c * c).toFixed(3);
    cardEls.tansec.querySelector(".trig-card-check").textContent = cosOK
      ? "1 + " + sq(vals.tan) + " = " + (1 + vals.tan * vals.tan).toFixed(3) + " = " + sq(vals.sec)
      : "undefined when cos θ = 0";
    cardEls.cotcsc.querySelector(".trig-card-check").textContent = sinOK
      ? "1 + " + sq(vals.cot) + " = " + (1 + vals.cot * vals.cot).toFixed(3) + " = " + sq(vals.csc)
      : "undefined when sin θ = 0";

    if (active) highlight(active);
  }

  function setAngle(a) { theta = a; draw(); }

  // bigger touch target and labels when the drawing is shown small (phones)
  function fitToSize() {
    var small = svg.getBoundingClientRect().width < 520;
    svg.classList.toggle("trig-small", small);
    handle.setAttribute("r", small ? 15 : 9);
    handleHalo.setAttribute("r", small ? 38 : 18);
    draw();
  }
  window.addEventListener("resize", fitToSize);

  // ---------- dragging ----------
  var dragging = false;
  function pointerAngle(evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    var a = Math.atan2(CY - p.y, p.x - CX);
    // gently snap to multiples of π/12 so students can land on exact angles
    var u = Math.PI / 12, n = Math.round(a / u);
    if (Math.abs(a - n * u) < 0.03) a = n * u;
    return a;
  }
  function startDrag(evt) {
    dragging = true;
    svg.classList.add("dragging");
    if (evt.pointerId !== undefined && svg.setPointerCapture) svg.setPointerCapture(evt.pointerId);
    setAngle(pointerAngle(evt));
    evt.preventDefault();
  }
  handle.addEventListener("pointerdown", startDrag);
  handleHalo.addEventListener("pointerdown", startDrag);
  // clicking on the circle itself also moves the point there
  svg.addEventListener("pointerdown", function (evt) {
    if (dragging) return;
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    var d = Math.hypot(p.x - CX, p.y - CY);
    if (Math.abs(d - R) < 22) startDrag(evt);
  });
  svg.addEventListener("pointermove", function (evt) {
    if (dragging) setAngle(pointerAngle(evt));
  });
  function endDrag() { dragging = false; svg.classList.remove("dragging"); }
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  handle.addEventListener("keydown", function (evt) {
    // arrow: 0.01 rad; shift+arrow: jump to the next multiple of π/12
    if (evt.shiftKey) {
      var u = Math.PI / 12, dir = (evt.key === "ArrowLeft" || evt.key === "ArrowUp") ? 1 : -1;
      if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].indexOf(evt.key) >= 0) {
        var n = dir > 0 ? Math.floor(theta / u + 1e-6) + 1 : Math.ceil(theta / u - 1e-6) - 1;
        setAngle(n * u); evt.preventDefault();
      }
      return;
    }
    var step = 0.01;
    if (evt.key === "ArrowLeft" || evt.key === "ArrowUp") { setAngle(theta + step); evt.preventDefault(); }
    if (evt.key === "ArrowRight" || evt.key === "ArrowDown") { setAngle(theta - step); evt.preventDefault(); }
  });

  fitToSize();
})();
