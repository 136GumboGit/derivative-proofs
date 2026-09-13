# Derivative Proofs

A static reference site collecting proofs of derivative rules from the limit definition. Built with 11ty, styled for clean academic reading, math rendered with MathJax.

This is a **separate, standalone project** — not connected to any other site or repo you maintain. Keep it in its own GitHub repository and its own Netlify project.

## Project Structure

```
derivative-proofs/
├── src/
│   ├── _includes/
│   │   ├── base.njk       # Main layout (loads MathJax)
│   │   └── proof.njk      # Layout for individual proof pages
│   ├── css/
│   │   └── style.css      # Academic, serif, minimal styling
│   ├── proofs/
│   │   └── power-rule.md  # Sample proof — copy this pattern for each new proof
│   ├── index.md           # Homepage
│   └── proofs.md          # Index page listing all proofs
├── .eleventy.js
├── package.json
├── netlify.toml
└── .gitignore
```

## Adding a New Proof

1. Create a new file in `src/proofs/`, e.g. `src/proofs/product-rule.md`
2. Use this frontmatter pattern:

```markdown
---
layout: proof
title: "Product Rule: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)"
description: "One-line description shown on the proofs index"
order: 2
---

<h1>Product Rule</h1>

<p>Your HTML/LaTeX content here. Use $...$ for inline math and $$...$$ for display math.</p>
```

3. Since you already have your proofs as HTML with LaTeX, you can mostly copy-paste the existing HTML body straight into one of these files — just wrap it with the frontmatter block above and make sure any `$...$` / `$$...$$` LaTeX delimiters match what MathJax expects (it's configured for both `$...$` and `\(...\)` inline, `$$...$$` and `\[...\]` display).

4. `order` controls the sort position on the "All Proofs" index page.

## Local Preview (optional)

```bash
npm install
npm run serve
# visit http://localhost:8080
```

## Deploying

### 1. Push to its own GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/derivative-proofs.git
git branch -M main
git push -u origin main
```

**Use a new, separate repository** — do not push this into the music project's repo.

### 2. Deploy on Netlify

1. netlify.com → **New site from Git**
2. Select the `derivative-proofs` repository (not the music one)
3. Netlify auto-detects the build settings from `netlify.toml`
4. Deploy

Note: `@11ty/eleventy` is listed under `dependencies` (not `devDependencies`) in `package.json` specifically so the build won't break if Netlify sets `NODE_ENV=production` — that tripped up the other project, so it's avoided here from the start.

### 3. (Optional) Custom domain

Site Settings → Domain management → Add a custom domain. Since this is meant to be public and separate from your personal project, a distinct domain (or the free `.netlify.app` subdomain) keeps the two identities cleanly apart.

## Keeping This Separate From Your Music Project

- Different GitHub repo
- Different Netlify project
- No shared domain, no links between the two sites
- No shared CMS login
- Nothing here references "Michael Philip" or the music project, and nothing there should reference this
