# Developer Portfolio — Parth Tank

A modern, animated, fully static developer portfolio. Built with plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no bundler required. Deploys directly to GitHub Pages.

## Live projects & GitHub stats
Repos and GitHub stats are fetched live from the public GitHub API using the username set in `data/config.json` — no hardcoding needed.

## Local setup

1. **EmailJS contact form:**
   - Copy `js/config.example.js` to `js/config.js`
   - Sign up free at [emailjs.com](https://www.emailjs.com/), create an Email Service and a Template
   - Paste your **Service ID**, **Template ID**, and **Public Key** into `js/config.js`
   - `js/config.js` is gitignored, so your values won't be committed — but note EmailJS Public Keys are meant to be used client-side and aren't secret by design

2. **Resume:**
   - Replace `assets/resume.pdf` (currently a placeholder) with your real resume PDF

3. **Content:**
   - `data/config.json` — name, role, tagline, bio, hobbies, social links, GitHub username
   - `data/skills.json` — your tech stack, grouped by category
   - `data/experience.json` — experience/education timeline entries
   - `data/projects-override.json` — repos to exclude from the auto-fetched Projects section

## Running locally
No build step needed — just open `index.html` in a browser, or serve the folder with any static server, e.g.:
```
npx serve .
```

## Deploying to GitHub Pages
1. Push this repo to GitHub
2. Repo → **Settings → Pages** → set source to your default branch, root folder
3. Your site goes live at `https://<username>.github.io/<repo-name>/`

No build/deploy step required — GitHub Pages serves the static files directly.
