---
layout: proof
title: "The Six Trig Functions on the Unit Circle"
description: "Interactive: every trig function as a length, derived with similar triangles, plus the three Pythagorean identities"
order: 3
---

<h1>The Six Trig Functions on the Unit Circle</h1>

<p>Each of the six basic trig functions is the length of a segment on the unit circle. Draw the radius to the point $P$ at angle $\theta$, drop a perpendicular from $P$ to the $x$-axis, and draw the line tangent to the circle at $P$. That tangent line crosses the $x$-axis at $S$ and the $y$-axis at $C$.</p>

<div class="trig-wrap">
<div class="trig-hint">Drag the white point around the circle (or click it and use the arrow keys). Hover over a triangle or an identity card (tap a card on a phone) to highlight it.</div>
<div id="trig-app"></div>
</div>

<script src="/js/trig-circle.js" defer></script>

<h2>Name the segments</h2>

<p>Let $O$ be the origin, $P = (\cos\theta, \sin\theta)$ the point on the circle, and $F = (\cos\theta, 0)$ the foot of the perpendicular. Since the circle has radius $1$, $OP = 1$.</p>

<p>$$OF = \cos\theta \qquad FP = \sin\theta$$</p>

<p>The other four lengths are what we want to find:</p>

<p>$$PS = \tan\theta \qquad PC = \cot\theta \qquad OS = \sec\theta \qquad OC = \csc\theta$$</p>

<p>A tangent line is perpendicular to the radius, so the angle at $P$ in triangles $OPS$ and $OPC$ is a right angle.</p>

<h2>Find tan and sec with similar triangles</h2>

<p>Triangles $OFP$ and $OPS$ are both right triangles, and they share the angle $\theta$ at $O$. So they are similar.</p>

<p>Match corresponding sides (opposite $\theta$ over adjacent to $\theta$):</p>

<p>$$\frac{PS}{OP} = \frac{FP}{OF}$$</p>

<p>$$\frac{\tan\theta}{1} = \frac{\sin\theta}{\cos\theta}$$</p>

<p>$$\tan\theta = \frac{\sin\theta}{\cos\theta}$$</p>

<p>Now match hypotenuse over adjacent:</p>

<p>$$\frac{OS}{OP} = \frac{OP}{OF}$$</p>

<p>$$\frac{\sec\theta}{1} = \frac{1}{\cos\theta}$$</p>

<p>$$\sec\theta = \frac{1}{\cos\theta}$$</p>

<h2>Find cot and csc with similar triangles</h2>

<p>In triangle $OPC$, the angle at $O$ is $90^\circ - \theta$. The angles of a triangle add to $180^\circ$, so the angle at $C$ is</p>

<p>$$180^\circ - 90^\circ - (90^\circ - \theta) = \theta$$</p>

<p>So triangle $OPC$, with angle $\theta$ at $C$, is similar to triangle $OFP$, with angle $\theta$ at $O$.</p>

<p>Match adjacent over opposite:</p>

<p>$$\frac{PC}{OP} = \frac{OF}{FP}$$</p>

<p>$$\frac{\cot\theta}{1} = \frac{\cos\theta}{\sin\theta}$$</p>

<p>$$\cot\theta = \frac{\cos\theta}{\sin\theta} = \frac{1}{\tan\theta}$$</p>

<p>Now match hypotenuse over opposite:</p>

<p>$$\frac{OC}{OP} = \frac{OP}{FP}$$</p>

<p>$$\frac{\csc\theta}{1} = \frac{1}{\sin\theta}$$</p>

<p>$$\csc\theta = \frac{1}{\sin\theta}$$</p>

<h2>The three Pythagorean identities</h2>

<p>Each right triangle in the drawing gives one identity. Hover over the triangles above to see them.</p>

<p>Triangle $OFP$ has legs $\cos\theta$ and $\sin\theta$ and hypotenuse $1$:</p>

<p>$$\sin^2\theta + \cos^2\theta = 1$$</p>

<p>Triangle $OPS$ has legs $1$ and $\tan\theta$ and hypotenuse $\sec\theta$:</p>

<p>$$1 + \tan^2\theta = \sec^2\theta$$</p>

<p>Triangle $OPC$ has legs $1$ and $\cot\theta$ and hypotenuse $\csc\theta$:</p>

<p>$$1 + \cot^2\theta = \csc^2\theta \qquad \blacksquare$$</p>

<h2>A note on signs and undefined values</h2>

<p>As you drag $P$ into other quadrants, the drawing shows the lengths, while the table shows the signed values. When $P$ reaches the $y$-axis, $\cos\theta = 0$ and the tangent line never meets the $x$-axis, which is why $\tan\theta$ and $\sec\theta$ are undefined there. The same happens to $\cot\theta$ and $\csc\theta$ when $P$ reaches the $x$-axis.</p>
