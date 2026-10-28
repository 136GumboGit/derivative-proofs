---
layout: proof
title: "Exponential Rule: d/dx[e^x] = e^x"
description: "Proof using the limit definition (factoring out e^x, series expansion of e^h)"
order: 2
---

<h1>Exponential Rule</h1>

<p>Goal: show that for all real $x$,</p>

<p>$$\frac{d}{dx}\left[e^x\right] = e^x$$</p>

<h2>Starting from the definition</h2>

<p>$$f'(x) = \lim_{h \to 0} \frac{e^{x+h} - e^x}{h}$$</p>

<h2>Factor out e<sup>x</sup></h2>

<p>By the law of exponents, $e^{x+h} = e^x \cdot e^h$, so</p>

<p>$$\frac{e^{x+h} - e^x}{h} = \frac{e^x e^h - e^x}{h} = e^x \cdot \frac{e^h - 1}{h}$$</p>

<p>Since $e^x$ does not depend on $h$, it can be pulled outside the limit:</p>

<p>$$f'(x) = e^x \cdot \lim_{h \to 0} \frac{e^h - 1}{h}$$</p>

<p>Everything now depends on one limit.</p>

<h2>Expand e<sup>h</sup> as a series</h2>

<p>$$e^h = 1 + h + \frac{h^2}{2!} + \frac{h^3}{3!} + \cdots$$</p>

<p>Subtracting $1$ and dividing by $h$:</p>

<p>$$\frac{e^h - 1}{h} = 1 + \frac{h}{2!} + \frac{h^2}{3!} + \cdots$$</p>

<h2>Take the limit as h &rarr; 0</h2>

<p>Every term after the first contains a positive power of $h$, so it vanishes as $h \to 0$:</p>

<p>$$\lim_{h \to 0} \left[ 1 + \frac{h}{2!} + \frac{h^2}{3!} + \cdots \right] = 1$$</p>

<p>Therefore:</p>

<p>$$\frac{d}{dx}\left[e^x\right] = e^x \cdot 1 = e^x \qquad \blacksquare$$</p>

<h2>A note on the key limit</h2>

<p>The fact that $\displaystyle\lim_{h \to 0} \frac{e^h - 1}{h} = 1$ is exactly what makes $e$ special. Geometrically, it says the graph of $y = e^x$ crosses the $y$-axis with slope exactly $1$. For any other base $b$, the same steps give</p>

<p>$$\frac{d}{dx}\left[b^x\right] = b^x \cdot \lim_{h \to 0} \frac{b^h - 1}{h} = b^x \ln b,$$</p>

<p>and $e$ is the one base for which that constant equals $1$.</p>
