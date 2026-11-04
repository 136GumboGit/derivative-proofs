---
layout: proof
title: "Natural Log Rule: d/dx[ln x] = 1/x"
description: "Proof using the limit definition, the rules of logs, and e = lim (1+t)^(1/t)"
order: 3
---

<h1>Natural Log Rule</h1>

<p>Goal: show that for all $x > 0$,</p>

<p>$$\frac{d}{dx}\left[\ln x\right] = \frac{1}{x}$$</p>

<p>where $e$ is defined by</p>

<p>$$e = \lim_{t \to 0} (1+t)^{1/t}$$</p>

<h2>Starting from the definition</h2>

<p>$$f'(x) = \lim_{h \to 0} \frac{\ln(x+h) - \ln x}{h}$$</p>

<h2>Combine the logs</h2>

<p>Use the log rule $\ln a - \ln b = \ln\dfrac{a}{b}$ to combine the logs:</p>

<p>$$f'(x) = \lim_{h \to 0} \frac{\ln\left(\frac{x+h}{x}\right)}{h}$$</p>

<p>Dividing by $h$ is multiplying by $\frac{1}{h}$:</p>

<p>$$f'(x) = \lim_{h \to 0} \frac{1}{h}\ln\left(\frac{x+h}{x}\right)$$</p>

<p>Split the fraction:</p>

<p>$$f'(x) = \lim_{h \to 0} \frac{1}{h}\ln\left(1 + \frac{h}{x}\right)$$</p>

<p>Use the log rule $a \ln b = \ln\left(b^a\right)$ to move $\frac{1}{h}$ into the exponent:</p>

<p>$$f'(x) = \lim_{h \to 0} \ln\left[\left(1 + \frac{h}{x}\right)^{1/h}\right]$$</p>

<h2>Change variables</h2>

<p>Let</p>

<p>$$t = \frac{h}{x}$$</p>

<p>Multiply both sides by $x$:</p>

<p>$$h = xt$$</p>

<p>As $h \to 0$, $t = \frac{h}{x} \to 0$, so we can rewrite the limit in terms of $t$:</p>

<p>$$f'(x) = \lim_{t \to 0} \ln\left[(1 + t)^{\frac{1}{xt}}\right]$$</p>

<h2>Build the definition of e</h2>

<p>Split the exponent:</p>

<p>$$\frac{1}{xt} = \frac{1}{t} \cdot \frac{1}{x}$$</p>

<p>Use the exponent rule $b^{mn} = \left(b^m\right)^n$ to split the power:</p>

<p>$$f'(x) = \lim_{t \to 0} \ln\left[\left((1 + t)^{1/t}\right)^{1/x}\right]$$</p>

<p>Use the log rule $\ln\left(b^a\right) = a \ln b$ to bring $\frac{1}{x}$ out front:</p>

<p>$$f'(x) = \lim_{t \to 0} \frac{1}{x}\ln\left[(1 + t)^{1/t}\right]$$</p>

<p>Since $\frac{1}{x}$ does not depend on $t$, it can be pulled outside the limit:</p>

<p>$$f'(x) = \frac{1}{x}\lim_{t \to 0} \ln\left[(1 + t)^{1/t}\right]$$</p>

<h2>Take the limit as t &rarr; 0</h2>

<p>Because $\ln$ is continuous, the limit can move inside it:</p>

<p>$$f'(x) = \frac{1}{x}\ln\left[\lim_{t \to 0}(1 + t)^{1/t}\right]$$</p>

<p>The expression inside the log is the definition of $e$:</p>

<p>$$f'(x) = \frac{1}{x}\ln e$$</p>

<p>Use the log rule $\ln e = 1$:</p>

<p>$$f'(x) = \frac{1}{x} \cdot 1$$</p>

<p>Therefore:</p>

<p>$$\frac{d}{dx}\left[\ln x\right] = \frac{1}{x} \qquad \blacksquare$$</p>
