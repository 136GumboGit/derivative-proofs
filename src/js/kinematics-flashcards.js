(function () {
  const app = document.getElementById('kf-app');
  if (!app) return;

  const vi = '<i>v</i><sub>i</sub>';
  const vf = '<i>v</i><sub>f</sub>';
  const vb = '<span class="kf-vbar">v</span>';
  const d = '<i>d</i>', a = '<i>a</i>', t = '<i>t</i>';
  const dv = 'Δ<i>v</i>';
  const frac = (n, m) => `<span class="kf-frac"><span>${n}</span><span>${m}</span></span>`;
  const im = s => `<span class="kf-inline">${s}</span>`;

  // "symbol" is shown on the back; "text" (and term/unit for vocabulary) on the front.
  const CARDS = [
    { type: 'equation', symbol: `${vb} = ${frac(d, t)}`,
      text: 'This equation relates the average velocity, the displacement, and the time.' },
    { type: 'equation', symbol: `${a} = ${frac(dv, t)}`,
      text: 'This equation relates the acceleration, the change in velocity, and the time.' },
    { type: 'equation', symbol: `${dv} = ${vf} − ${vi}`,
      text: 'This equation relates the change in velocity, the final velocity, and the initial velocity.' },
    { type: 'equation', symbol: `${vb} = ${frac(`${vi} + ${vf}`, '2')}`,
      text: 'This equation relates the average velocity, the initial velocity, and the final velocity.<span class="kf-note">Constant acceleration only.</span>' },
    { type: 'equation', symbol: `${vf} = ${vi} + ${a}${t}`,
      text: 'This equation relates the initial velocity, the final velocity, the acceleration, and the time.' },
    { type: 'equation', symbol: `${d} = ${vi}${t} + ½${a}${t}<sup>2</sup>`,
      text: 'This equation relates the displacement, the initial velocity, the acceleration, and the time.' },
    { type: 'equation', symbol: `${vf}<sup>2</sup> = ${vi}<sup>2</sup> + 2${a}${d}`,
      text: 'This equation relates the final velocity, the initial velocity, the acceleration, and the displacement.' },

    { type: 'vocab', symbol: d, term: 'Displacement', unit: 'm',
      text: 'Vector: change in position. Can be negative.' },
    { type: 'vocab', symbol: vi, term: 'Initial velocity', unit: 'm/s',
      text: `Vector. “Starts from rest” means ${im(vi + ' = 0')}.` },
    { type: 'vocab', symbol: vf, term: 'Final velocity', unit: 'm/s',
      text: `Vector. “Comes to a stop” means ${im(vf + ' = 0')}.` },
    { type: 'vocab', symbol: dv, term: 'Change in velocity', unit: 'm/s',
      text: 'Vector: final velocity minus initial velocity.' },
    { type: 'vocab', symbol: vb, term: 'Average velocity', unit: 'm/s',
      text: `Two definitions:<br>${im(vb + ' = ' + d + ' / ' + t)} (always true)<br>${im(vb + ' = (' + vi + ' + ' + vf + ') / 2')} (constant acceleration only)` },
    { type: 'vocab', symbol: a, term: 'Acceleration', unit: 'm/s²',
      text: `Vector, and it must be <b>constant</b> for these equations. In free fall, ${im(a + ' = −<i>g</i> ≈ −9.8 m/s²')}.` },
    { type: 'vocab', symbol: t, term: 'Time interval', unit: 's',
      text: 'Scalar, always positive.' },

    { type: 'rule', symbol: 'How do you pick an equation?',
      text: `Acceleration must be constant. List the 3 variables you know and the 1 you want, then pick the equation that contains exactly those 4. If <b>${a}</b> is the one that’s missing, use ${im(vb + ' = ' + d + ' / ' + t)} and ${im(vb + ' = (' + vi + ' + ' + vf + ') / 2')} together.` }
  ];
  const LABEL = { equation: 'Equation', vocab: 'Vocabulary', rule: 'Strategy' };

  app.innerHTML = `
<div class="kf-filters" role="group" aria-label="Which cards">
<button class="kf-chip" data-filter="all" aria-pressed="true">All cards</button>
<button class="kf-chip" data-filter="equation" aria-pressed="false">Equations</button>
<button class="kf-chip" data-filter="vocab" aria-pressed="false">Vocabulary</button>
<button class="kf-chip" data-filter="rule" aria-pressed="false">Strategy</button>
</div>
<div class="kf-stage">
<button class="kf-card" type="button" aria-live="polite">
<div class="kf-face kf-front"><span class="kf-tag"></span><div class="kf-content"></div><div class="kf-hint">Click to see the back</div></div>
<div class="kf-face kf-back"><span class="kf-tag"></span><div class="kf-content"></div><div class="kf-hint">Click to see the front</div></div>
</button>
</div>
<div class="kf-progress"><div></div></div>
<div class="kf-controls">
<button class="kf-btn" data-act="prev">← Previous</button>
<span class="kf-counter"></span>
<button class="kf-btn" data-act="next">Next →</button>
</div>
<div class="kf-row2">
<button class="kf-btn kf-ghost" data-act="shuffle">Shuffle</button>
<button class="kf-btn kf-ghost" data-act="reset">Original order</button>
</div>
<p class="kf-keys"><kbd>Space</kbd> flip · <kbd>←</kbd> <kbd>→</kbd> move between cards</p>`;

  const card = app.querySelector('.kf-card');
  const front = app.querySelector('.kf-front .kf-content');
  const back = app.querySelector('.kf-back .kf-content');
  const tags = app.querySelectorAll('.kf-tag');
  const counter = app.querySelector('.kf-counter');
  const bar = app.querySelector('.kf-progress > div');
  const prevBtn = app.querySelector('[data-act="prev"]');
  const nextBtn = app.querySelector('[data-act="next"]');

  let filter = 'all';
  let order = CARDS.map((_, i) => i);
  let deck = [];
  let pos = 0;

  function buildDeck() {
    deck = order.filter(i => filter === 'all' || CARDS[i].type === filter);
    pos = 0;
    render();
  }

  function render() {
    const c = CARDS[deck[pos]];
    card.classList.remove('kf-flipped');
    const cls = c.type === 'vocab' ? 'kf-math kf-big' : c.type === 'rule' ? 'kf-math kf-q' : 'kf-math';
    back.innerHTML = `<div class="${cls}">${c.symbol}</div>`;
    front.innerHTML = c.type === 'vocab'
      ? `<div class="kf-text"><span class="kf-term">${c.term}</span><span class="kf-unit">Unit: ${c.unit}</span><br>${c.text}</div>`
      : `<div class="kf-text">${c.text}</div>`;
    tags.forEach(el => { el.textContent = LABEL[c.type]; });
    counter.textContent = `${pos + 1} / ${deck.length}`;
    bar.style.width = `${((pos + 1) / deck.length) * 100}%`;
    prevBtn.disabled = pos === 0;
    nextBtn.disabled = pos === deck.length - 1;
  }

  function flip() { card.classList.toggle('kf-flipped'); }
  function go(step) {
    const n = pos + step;
    if (n < 0 || n >= deck.length) return;
    pos = n;
    render();
  }

  card.addEventListener('click', flip);
  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  app.querySelector('[data-act="shuffle"]').addEventListener('click', () => {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    buildDeck();
  });
  app.querySelector('[data-act="reset"]').addEventListener('click', () => {
    order = CARDS.map((_, i) => i);
    buildDeck();
  });
  app.querySelectorAll('.kf-chip').forEach(b => b.addEventListener('click', () => {
    app.querySelectorAll('.kf-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    filter = b.dataset.filter;
    buildDeck();
  }));
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === ' ' || e.key === 'Enter') {
      if (e.target.tagName === 'BUTTON' && e.target !== card && e.key === 'Enter') return;
      e.preventDefault();
      flip();
    }
  });

  buildDeck();
})();
