---
layout: proof
title: "Exponential Rule: d/dx[e^x] = e^x"
description: "Proof using the limit definition and e = lim (1+h)^(1/h)"
order: 2
---

<h1>Exponential Rule</h1>

<p>Goal: show that for all real $x$,</p>

<p>$$\frac{d}{dx}\left[e^x\right] = e^x$$</p>

<p>where $e$ is defined by</p>

<p>$$e = \lim_{h \to 0} (1+h)^{1/h}$$</p>

<h2>Starting from the definition</h2>

<p>$$f'(x) = \lim_{h \to 0} \frac{e^{x+h} - e^x}{h}$$</p>

<h2>Factor out e<sup>x</sup></h2>

<p>By the law of exponents, $e^{x+h} = e^x \cdot e^h$, so</p>

<p>$$\frac{e^{x+h} - e^x}{h} = \frac{e^x e^h - e^x}{h} = e^x \cdot \frac{e^h - 1}{h}$$</p>

<p>Since $e^x$ does not depend on $h$, it can be pulled outside the limit:</p>

<p>$$f'(x) = e^x \cdot \lim_{h \to 0} \frac{e^h - 1}{h}$$</p>

<p>Everything now depends on one limit.</p>

<h2>Change variables</h2>

<p>Let</p>

<p>$$t = e^h - 1$$</p>

<p>Add 1 to both sides:</p>

<p>$$e^h = 1 + t$$</p>

<p>Take the natural log of both sides:</p>

<p>$$\ln\left(e^h\right) = \ln(1+t)$$</p>

<p>$$h = \ln(1+t)$$</p>

<p>Notice that as $h \to 0$,</p>

<p>$$e^h \to e^0 = 1$$</p>

<p>so</p>

<p>$$t = e^h - 1 \to 1 - 1 = 0$$</p>

<p>This means $t \to 0$ exactly when $h \to 0$, so we can rewrite the limit in terms of $t$:</p>

<p>$$\lim_{h \to 0} \frac{e^h - 1}{h} = \lim_{t \to 0} \frac{t}{\ln(1+t)}$$</p>

<p>Notice that the limit above is still $\frac{0}{0}$, which is indeterminate, but we now have a new pathway to determine what it is.</p>

<p>Divide the top and bottom by $t$:</p>

<p>$$\frac{t}{\ln(1+t)} = \frac{1}{\frac{1}{t}\ln(1+t)}$$</p>

<p>Use the log rule $a \ln b = \ln\left(b^a\right)$ to move $\frac{1}{t}$ into the exponent:</p>

<p>$$\frac{1}{\frac{1}{t}\ln(1+t)} = \frac{1}{\ln\left[(1+t)^{1/t}\right]}$$</p>

<h2>Take the limit as t &rarr; 0</h2>

<p>The expression inside the log is exactly the definition of $e$!!! Because $\ln$ is continuous, the limit can move inside it:</p>

<p>$$\lim_{t \to 0} \frac{1}{\ln\left[(1+t)^{1/t}\right]} = \frac{1}{\ln\left[\lim_{t \to 0}(1+t)^{1/t}\right]} = \frac{1}{\ln e} = 1$$</p>

<p>Therefore:</p>

<p>$$\frac{d}{dx}\left[e^x\right] = e^x \cdot 1 = e^x \qquad \blacksquare$$</p>

<h2>A note on the key limit</h2>

<p>The fact that $\displaystyle\lim_{h \to 0} \frac{e^h - 1}{h} = 1$ is exactly what makes $e$ special. Geometrically, it says the graph of $y = e^x$ crosses the $y$-axis with slope exactly $1$. For any other base $b$, the same steps give</p>

<p>$$\frac{d}{dx}\left[b^x\right] = b^x \cdot \lim_{h \to 0} \frac{b^h - 1}{h} = b^x \ln b,$$</p>

<p>and $e$ is the one base for which that constant equals $1$.</p>
