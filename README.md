<div align="center">

# Parth Tank — Developer Portfolio

A modern, animated, fully static developer portfolio built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step, deployed directly on GitHub Pages.

🔗 **Live Site:** [parthtank911.github.io/portfolio](https://parthtank911.github.io/portfolio/)
&nbsp;•&nbsp;
💻 **GitHub:** [github.com/Parthtank911](https://github.com/Parthtank911)

</div>

---

## ✨ Overview

This portfolio showcases my work as a **Full-Stack MERN Developer & AI/ML Enthusiast** — projects are pulled live from my GitHub repositories via the GitHub REST API, so the site always reflects my latest public work without any manual updates.

## 🚀 Features

- **Live GitHub integration** — projects and profile stats (repos, followers, following) fetched dynamically from the GitHub API, no hardcoding
- **Animated, scroll-triggered UI** — smooth reveal animations using Intersection Observer
- **Typewriter hero effect** — cycles through multiple role titles
- **Dark mode by default**, with a light mode toggle (persisted via `localStorage`)
- **Fully responsive** — mobile, tablet, and desktop
- **Working contact form** powered by [EmailJS](https://www.emailjs.com/) — no backend required
- **Data-driven content** — bio, skills, experience/education timeline, and hobbies all pulled from editable JSON files
- **Zero build step** — plain static files, deploys directly to GitHub Pages

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5 |
| Styling | Hand-written CSS (custom properties, no framework) |
| Logic | Vanilla JavaScript (ES Modules) |
| Data | Static JSON files |
| Contact Form | EmailJS |
| Hosting | GitHub Pages |

## 📁 Project Structure

```
├── index.html                  # Main page markup
├── css/
│   └── style.css               # All styling (design tokens, layout, animations)
├── js/
│   ├── main.js                 # Orchestrates page load, populates JSON-driven content
│   ├── github.js               # Fetches GitHub repos & profile stats
│   ├── animations.js            # Scroll reveal, scroll-spy, count-up animations
│   ├── contact.js              # Contact form validation + EmailJS integration
│   ├── config.js               # Active EmailJS credentials (commit this — see below)
│   └── config.example.js       # EmailJS credentials template
├── data/
│   ├── config.json             # Name, role, tagline, bio, hobbies, social links
│   ├── skills.json             # Tech stack grouped by category
│   ├── experience.json         # Experience / education timeline
│   └── projects-override.json  # Sort/filter rules + manually featured projects
└── assets/
    └── resume.pdf              # Downloadable resume
```

## 🧑‍💻 Local Development

No build tools required — just serve the folder with any static server:

```bash
npx serve .
```

Or simply open `index.html` directly in a browser.

## ⚙️ Configuration

All personal content lives in `data/*.json` — edit these to update the site without touching any code:

- **`config.json`** — name, role, tagline, bio, hobbies, GitHub username, social links
- **`skills.json`** — tech stack, grouped by category
- **`experience.json`** — timeline entries (`type: "experience"` or `"education"`)
- **`projects-override.json`** — control which repos are excluded, add manually featured projects, set sort order

### Contact Form (EmailJS) Setup

1. Copy `js/config.example.js` → `js/config.js`
2. Sign up free at [emailjs.com](https://www.emailjs.com/), create an **Email Service** and a **Template**
3. In your template, use these exact variable names: `{{from_name}}`, `{{reply_to}}`, `{{subject}}`, `{{message}}`
4. Paste your **Service ID**, **Template ID**, and **Public Key** into `js/config.js`
5. Commit `js/config.js` as-is — GitHub Pages has no server or build step, so it can only serve files physically present in the repo. This is safe: EmailJS Public Keys are designed to be used client-side.

## 📄 Resume

Replace `assets/resume.pdf` with your own resume — it's linked from the hero section's "Download Resume" button via `resumePath` in `config.json`.

## 🌐 Deployment (GitHub Pages)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to your default branch, root folder
4. Your site goes live at `https://<username>.github.io/<repo-name>/`

No build or deploy step needed — GitHub Pages serves the static files directly, and updates automatically on every push.

## 📬 Contact

- **Email:** parthtank911@gmail.com
- **GitHub:** [github.com/Parthtank911](https://github.com/Parthtank911)

---

<div align="center">
Built with HTML, CSS, and JavaScript — no frameworks, no fuss.
</div>
