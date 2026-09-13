---
layout: proof
title: "Power Rule: d/dx[x^n] = nx^(n-1)"
description: "Proof using the limit definition (binomial expansion, n a positive integer)"
order: 1
---

<h1>Power Rule</h1>

<p>Goal: show that for a positive integer $n$,</p>

<p>$$\frac{d}{dx}\left[x^n\right] = n x^{n-1}$$</p>

<h2>Starting from the definition</h2>

<p>$$f'(x) = \lim_{h \to 0} \frac{(x+h)^n - x^n}{h}$$</p>

<h2>Expand using the binomial theorem</h2>

<p>$$(x+h)^n = x^n + n x^{n-1} h + \binom{n}{2} x^{n-2} h^2 + \cdots + h^n$$</p>

<p>Subtracting $x^n$ and dividing by $h$:</p>

<p>$$\frac{(x+h)^n - x^n}{h} = n x^{n-1} + \binom{n}{2} x^{n-2} h + \cdots + h^{n-1}$$</p>

<h2>Take the limit as h &rarr; 0</h2>

<p>Every term after the first contains a positive power of $h$, so it vanishes as $h \to 0$:</p>

<p>$$\lim_{h \to 0} \left[ n x^{n-1} + \binom{n}{2} x^{n-2} h + \cdots + h^{n-1} \right] = n x^{n-1}$$</p>

<p>Therefore:</p>

<p>$$\frac{d}{dx}\left[x^n\right] = n x^{n-1} \qquad \blacksquare$$</p>

<p><em>This is a placeholder proof — replace with your own HTML/LaTeX content, or edit through this same file.</em></p>
