---
layout: base
title: All Proofs
permalink: /proofs/
---

<h1>All Proofs</h1>

<ul class="proof-list">
{%- for item in collections.proofs %}
  <li>
    <a href="{{ item.url }}">{{ item.data.title }}</a>
    {% if item.data.description %}
    <div class="proof-desc">{{ item.data.description }}</div>
    {% endif %}
  </li>
{%- endfor %}
</ul>
