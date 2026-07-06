/**
 * Main Orchestration Module
 * 
 * Runs on page load, fetches site-wide content from static JSON data files,
 * populates the document structure, coordinates theme switching, and
 * initializes the sub-modules for GitHub stats, scroll animations, and contact form.
 */

import { fetchGithubData } from "./github.js";
import { initScrollAnimations, initScrollSpy, initStatsCountUp, initNavbarInteractions } from "./animations.js";
import { initContactForm } from "./contact.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Core UI Features (Navbar, Theme, etc.)
  initTheme();
  initNavbarInteractions();

  // Show skeletal structures for Projects/Stats
  renderProjectSkeletons();

  // 2. Fetch all static content files in parallel
  try {
    const [configRes, skillsRes, experienceRes, overridesRes] = await Promise.all([
      fetch("./data/config.json"),
      fetch("./data/skills.json"),
      fetch("./data/experience.json"),
      fetch("./data/projects-override.json")
    ]);

    const config = await configRes.json();
    const skills = await skillsRes.json();
    const experience = await experienceRes.json();
    const overrides = await overridesRes.json();

    // 3. Populate JSON-driven page content
    populateHero(config);
    populateAbout(config);
    populateSkills(skills);
    populateTimeline(experience);
    populateSocials(config);

    // 4. Initialize Contact Form validation and EmailJS
    initContactForm();

    // 5. Fetch and Render GitHub Projects and Profile Stats
    const githubData = await fetchGithubData(config.githubUsername, overrides);
    renderGithubData(githubData, overrides);

    // 6. Bootstrap observers and animations once page content is dynamically rendered
    initScrollAnimations();
    initScrollSpy();

  } catch (err) {
    console.error("Critical error loading portfolio content:", err);
    renderFallbackUI();
  }
});

/**
 * Initializes and manages Dark/Light theme toggle
 */
function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const storedTheme = localStorage.getItem("theme") || "dark"; // Dark mode by default

  if (storedTheme === "light") {
    document.documentElement.classList.add("light-theme");
  }

  updateThemeToggleIcon(storedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isCurrentlyLight = document.documentElement.classList.contains("light-theme");
      const newTheme = isCurrentlyLight ? "dark" : "light";

      if (isCurrentlyLight) {
        document.documentElement.classList.remove("light-theme");
      } else {
        document.documentElement.classList.add("light-theme");
      }

      localStorage.setItem("theme", newTheme);
      updateThemeToggleIcon(newTheme);
    });
  }
}

/**
 * Updates the icons inside the theme toggler
 */
function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  if (theme === "light") {
    // Show Sun icon for light, Sun is active so let's display moon icon to show "switch to dark" option
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      <span class="sr-only">Toggle dark theme</span>
    `;
  } else {
    // Show Sun icon to show "switch to light" option
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      <span class="sr-only">Toggle light theme</span>
    `;
  }
}

/**
 * Populates HERO section
 */
function populateHero(config) {
  const nameEl = document.getElementById("heroName");
  const roleEl = document.getElementById("heroRole");
  const taglineEl = document.getElementById("heroTagline");
  const resumeBtn = document.getElementById("resumeBtn");

  if (nameEl) nameEl.textContent = config.name;
  
  if (roleEl) {
    const roles = config.roles && config.roles.length > 0 
      ? config.roles 
      : [config.role || "Full-Stack Software Engineer", "Frontend Developer", "React Enthusiast", "Problem Solver"];
    initTypewriter(roleEl, roles);
  }
  
  if (taglineEl) taglineEl.textContent = config.tagline;

  if (resumeBtn && config.resumePath) {
    resumeBtn.setAttribute("href", config.resumePath);
  }

  // Trigger typing effect or load animations immediately for hero
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.classList.add("visible");
  }
}

/**
 * Typewriter effect for cycling through multiple roles
 * @param {HTMLElement} element - The target element
 * @param {Array<string>} words - Array of role titles to cycle
 */
function initTypewriter(element, words) {
  if (!element || !words || words.length === 0) return;

  // Create text container and blinking cursor
  element.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor"></span>';
  const textEl = element.querySelector('.typewriter-text');

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let delay = 100; // standard typing speed

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      // Deleting character
      textEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      delay = 50; // faster deletion
    } else {
      // Typing character
      textEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      delay = 100; // standard typing speed
    }

    if (!isDeleting && charIndex === currentWord.length) {
      // Full word typed, pause before deleting
      delay = 2000; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Word completely deleted, move to next word
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 500; // brief pause before starting to type next word
    }

    setTimeout(type, delay);
  }

  // Start the typing loop
  type();
}

/**
 * Populates ABOUT section
 */
function populateAbout(config) {
  const bioContainer = document.getElementById("aboutBio");
  if (!bioContainer) return;

  bioContainer.innerHTML = "";
  
  // Accept string bio or array of paragraphs
  if (Array.isArray(config.bio)) {
    config.bio.forEach(p => {
      const paragraph = document.createElement("p");
      paragraph.className = "text-muted";
      paragraph.textContent = p;
      bioContainer.appendChild(paragraph);
    });
  } else {
    const paragraph = document.createElement("p");
    paragraph.className = "text-muted";
    paragraph.textContent = config.bio;
    bioContainer.appendChild(paragraph);
  }

  // Render "Beyond Code" hobby/interest pills, if provided in config.json
  const hobbiesList = document.getElementById("hobbiesList");
  if (hobbiesList && Array.isArray(config.hobbies) && config.hobbies.length > 0) {
    hobbiesList.innerHTML = "";
    config.hobbies.forEach(hobby => {
      const pill = document.createElement("span");
      pill.className = "hobby-pill";
      pill.textContent = hobby.label || hobby;
      hobbiesList.appendChild(pill);
    });
  } else if (hobbiesList) {
    // Hide the whole "Beyond Code" block if no hobbies are configured
    const beyondCodeBlock = hobbiesList.closest(".beyond-code");
    if (beyondCodeBlock) beyondCodeBlock.style.display = "none";
  }
}

/**
 * Populates SKILLS section
 */
function populateSkills(skills) {
  const skillsContainer = document.getElementById("skillsContainer");
  if (!skillsContainer) return;

  skillsContainer.innerHTML = "";

  skills.forEach((cat, index) => {
    const categoryCard = document.createElement("div");
    categoryCard.className = `skills-category reveal reveal-up`;
    categoryCard.style.transitionDelay = `${index * 100}ms`;

    const title = document.createElement("h3");
    title.className = "skills-cat-title";
    title.textContent = cat.category;
    categoryCard.appendChild(title);

    const badgesGrid = document.createElement("div");
    badgesGrid.className = "skills-grid";

    cat.skills.forEach(skill => {
      const badge = document.createElement("div");
      badge.className = "skill-badge";

      // Dynamically load simple Lucide icons (SVG) via simple text map or embed
      const iconMarkup = getLucideIcon(skill.icon);
      
      badge.innerHTML = `
        ${iconMarkup}
        <span>${skill.name}</span>
      `;
      badgesGrid.appendChild(badge);
    });

    categoryCard.appendChild(badgesGrid);
    skillsContainer.appendChild(categoryCard);
  });
}

/**
 * Populates unified Timeline for Experience and Education
 */
function populateTimeline(entries) {
  const timelineContainer = document.getElementById("timelineContainer");
  if (!timelineContainer) return;

  timelineContainer.innerHTML = "";

  // Helper to extract the START year of a dateRange (e.g. "Sep 2023 - May 2026" -> 2023)
  const getSortYear = (dateStr) => {
    const years = dateStr.match(/\b(19|20)\d{2}\b/g);
    if (years && years.length > 0) {
      return Number(years[0]);
    }
    return 0;
  };

  // Sort timeline entries chronologically by start date (newest first)
  const sortedEntries = [...entries].sort((a, b) => getSortYear(b.dateRange) - getSortYear(a.dateRange));

  sortedEntries.forEach((entry, index) => {
    const timelineItem = document.createElement("div");
    timelineItem.className = `timeline-item reveal reveal-${index % 2 === 0 ? "left" : "right"}`;
    timelineItem.style.transitionDelay = `${index * 100}ms`;

    const isExp = entry.type === "experience";
    const typeBadge = isExp
      ? `<span class="timeline-badge badge-exp">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M15 2H9a1 1 0 0 0-1 1v2H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1z"/><path d="M15 5H9v4h6V5z"/><path d="M2 11h20"/></svg>
          Experience
         </span>`
      : `<span class="timeline-badge badge-edu">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          Education
         </span>`;

    timelineItem.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-date">${entry.dateRange}</div>
      <div class="timeline-card">
        <div class="timeline-header">
          <div>
            <h3 class="timeline-title">${entry.title}</h3>
            <span class="timeline-org">${entry.organization}</span>
            ${entry.cgpa ? `<span class="timeline-cgpa">CGPA: ${entry.cgpa}</span>` : ''}
          </div>
          ${typeBadge}
        </div>
        <p class="timeline-desc text-muted">${entry.description}</p>
      </div>
    `;

    timelineContainer.appendChild(timelineItem);
  });
}

/**
 * Populates Social links in Hero, Contact, and Footer sections
 */
function populateSocials(config) {
  const heroSocials = document.getElementById("heroSocials");
  const contactSocials = document.getElementById("contactSocials");
  const footerCopyright = document.getElementById("footerCopyright");

  const socials = config.socialLinks;
  if (!socials) return;

  const getSocialIconMarkup = (platform) => {
    switch (platform.toLowerCase()) {
      case "github":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`;
      case "linkedin":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`;
      case "twitter":
      case "x":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`;
      case "email":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    }
  };

  const socialPlatforms = Object.keys(socials);

  // Populate Hero Socials
  if (heroSocials) {
    heroSocials.innerHTML = "";
    socialPlatforms.forEach(platform => {
      let href = socials[platform];
      if (platform === "email" && !href.startsWith("mailto:")) {
        href = `mailto:${href}`;
      }
      const a = document.createElement("a");
      a.className = "social-btn";
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", `Visit our ${platform} profile`);
      a.innerHTML = getSocialIconMarkup(platform);
      heroSocials.appendChild(a);
    });
  }

  // Populate Contact Social Cards
  if (contactSocials) {
    contactSocials.innerHTML = "";
    socialPlatforms.forEach(platform => {
      let href = socials[platform];
      let displayVal = href;
      if (platform === "email") {
        if (!href.startsWith("mailto:")) {
          href = `mailto:${href}`;
        }
        displayVal = displayVal.replace("mailto:", "");
      } else {
        displayVal = displayVal.replace("https://", "").replace("www.", "");
      }

      const card = document.createElement("a");
      card.className = "contact-social-card";
      card.href = href;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.innerHTML = `
        <div class="social-icon-wrapper">${getSocialIconMarkup(platform)}</div>
        <div class="social-text">
          <span class="social-platform">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
          <span class="social-handle">${displayVal}</span>
        </div>
      `;
      contactSocials.appendChild(card);
    });
  }

  // Footer copyright
  if (footerCopyright) {
    const currentYear = new Date().getFullYear();
    footerCopyright.textContent = `© ${currentYear} ${config.name}. All Rights Reserved.`;
  }
}

/**
 * Renders loading skeletons inside Projects grid
 */
function renderProjectSkeletons() {
  const grid = document.getElementById("projectsGrid");
  if (grid) {
    grid.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const card = document.createElement("div");
      card.className = "project-card skeleton-card";
      card.innerHTML = `
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
        <div class="skeleton-footer"></div>
      `;
      grid.appendChild(card);
    }
  }
}

/**
 * Renders GitHub repositories and profile statistics, replacing the skeletons.
 */
function renderGithubData(data, overrides) {
  const { profile, repos } = data;

  // 1. Render GitHub Profile Card
  const profileCard = document.getElementById("githubProfileCard");
  
  if (profileCard && profile) {
    profileCard.style.display = "grid";
    profileCard.innerHTML = `
      <div class="github-profile-left">
        <div class="github-avatar-container">
          <img class="github-avatar" src="${profile.avatar_url}" alt="${profile.name || profile.login}" />
          <div class="github-badge-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </div>
        </div>
        <div class="github-info">
          <h3 class="github-name">${profile.name || "Parth Tank"}</h3>
          <span class="github-username">
            @${profile.login}
          </span>
          <p class="github-bio text-muted">${profile.bio || "Full-Stack Software Engineer. Coding beautiful, robust interfaces & API layers."}</p>
        </div>
      </div>
      <div class="github-profile-right">
        <div class="github-profile-stat">
          <span class="github-stat-num stat-number" data-target="${profile.public_repos}">0</span>
          <span class="github-stat-lbl">Public Repos</span>
        </div>
        <div class="github-profile-stat">
          <span class="github-stat-num stat-number" data-target="${profile.followers}">0</span>
          <span class="github-stat-lbl">Followers</span>
        </div>
        <div class="github-profile-stat">
          <span class="github-stat-num stat-number" data-target="${profile.following}">0</span>
          <span class="github-stat-lbl">Following</span>
        </div>
        <a href="${profile.html_url}" target="_blank" class="btn btn-secondary btn-sm github-action-btn">
          <span>View GitHub Profile</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    `;

    // Start counting animation
    initStatsCountUp();
  } else if (profileCard) {
    profileCard.style.display = "none";
  }

  // 2. Render Project Cards
  const projectsGrid = document.getElementById("projectsGrid");
  if (projectsGrid) {
    projectsGrid.innerHTML = "";

    if (repos.length === 0) {
      projectsGrid.innerHTML = `
        <div class="no-projects-fallback card-flat">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3>Could not load projects</h3>
          <p class="text-muted">Currently unable to pull repos from the GitHub API. It might be due to temporary network rate-limiting. Please try visiting again later or access my projects directly on my GitHub profile.</p>
          <a href="${profile?.html_url || '#'}" target="_blank" class="btn btn-secondary btn-sm">Visit GitHub Profile</a>
        </div>
      `;
      return;
    }

    repos.forEach((repo, index) => {
      const card = document.createElement("div");
      card.className = "project-card reveal reveal-up";
      card.style.transitionDelay = `${index * 80}ms`;

      // Format date
      const date = new Date(repo.updated_at);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      });

      card.innerHTML = `
        <div class="project-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="project-folder-icon"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <a href="${repo.html_url}" target="_blank" class="project-link-icon" aria-label="Open Project Codebase">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
        <h3 class="project-title">${repo.name.replace(/-/g, " ")}</h3>
        <p class="project-description">${repo.description}</p>
        <div class="project-footer">
          <span class="project-lang">
            <span class="lang-color-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
            ${repo.language}
          </span>
          <div class="project-meta">
            <span class="project-stars">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${repo.stars}
            </span>
            <span class="project-date">Updated ${formattedDate}</span>
          </div>
        </div>
      `;

      projectsGrid.appendChild(card);
    });
  }
}

/**
 * Fallback page builder when fetching data completely fails
 */
function renderFallbackUI() {
  const container = document.getElementById("projectsGrid");
  if (container) {
    container.innerHTML = `
      <div class="no-projects-fallback card-flat">
        <h3>Could not load projects grid</h3>
        <p class="text-muted">An error occurred while parsing static metadata config. Please review that the files inside the "/data/" directory are valid JSON formats.</p>
      </div>
    `;
  }
}

/**
 * Helper to yield color codes representing languages
 */
function getLanguageColor(lang) {
  const colors = {
    javascript: "#f1e05a",
    typescript: "#3178c6",
    html: "#e34c26",
    css: "#563d7c",
    python: "#3572a5",
    go: "#00add8",
    java: "#b07219",
    ruby: "#701516",
    cpp: "#f34b7d",
    rust: "#dea584",
    shell: "#89e051"
  };
  return colors[lang?.toLowerCase()] || "#64748b";
}

/**
 * Custom SVG Lucide Icon library embedded inside the Javascript layer.
 * Generates an SVG string representation of popular Lucide icons used across the site.
 */
function getLucideIcon(iconName) {
  const iconBase = "xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'";
  
  switch (iconName) {
    case "Code":
      return `<svg ${iconBase} class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    case "Braces":
      return `<svg ${iconBase} class="lucide lucide-braces"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>`;
    case "ShieldCheck":
      return `<svg ${iconBase} class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;
    case "Atom":
      return `<svg ${iconBase} class="lucide lucide-atom"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.3-4.5-11.77-4.48-4.48-9.74-6.5-11.77-4.5-2.04 2.03-.02 7.3 4.5 11.77 4.48 4.48 9.74 6.5 11.77 4.5Z"/><path d="M3.8 20.2c-2.04-2.03.02-7.3 4.5-11.77 4.48-4.48 9.74-6.5 11.77-4.5 2.04 2.03-.02 7.3-4.5 11.77-4.48 4.48-9.74 6.5-11.77 4.5Z"/></svg>`;
    case "Palette":
      return `<svg ${iconBase} class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.15-.82-.4-1.15-.25-.33-.35-.78-.23-1.21.15-.54.67-.91 1.25-.91H16c5.5 0 10-4.5 10-10C26 6.5 19.7 2 12 2Z"/></svg>`;
    case "Cpu":
      return `<svg ${iconBase} class="lucide lucide-cpu"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/></svg>`;
    case "Server":
      return `<svg ${iconBase} class="lucide lucide-server"><rect width="20" height="8" x="2" y="3" rx="2"/><rect width="20" height="8" x="2" y="13" rx="2"/><line x1="6" y1="7" x2="6.01" y2="7"/><line x1="6" y1="17" x2="6.01" y2="17"/><line x1="10" y1="7" x2="14" y2="7"/><line x1="10" y1="17" x2="14" y2="17"/></svg>`;
    case "Terminal":
      return `<svg ${iconBase} class="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`;
    case "GitBranch":
      return `<svg ${iconBase} class="lucide lucide-git-branch"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`;
    case "Database":
      return `<svg ${iconBase} class="lucide lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`;
    case "Layers":
      return `<svg ${iconBase} class="lucide lucide-layers"><path d="m12 3-10 5L12 13l10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`;
    case "Flame":
      return `<svg ${iconBase} class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    case "Cloud":
      return `<svg ${iconBase} class="lucide lucide-cloud"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.01-1.04-1.92-1.85-2.65A6.5 6.5 0 0 0 4 12c0 .26.01.51.04.76A4 4 0 0 0 7.5 20H17.5z"/></svg>`;
    case "GitFork":
      return `<svg ${iconBase} class="lucide lucide-git-fork"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9"/></svg>`;
    case "Container":
      return `<svg ${iconBase} class="lucide lucide-boxes"><path d="M2.9 11.2c-.3-.2-.5-.5-.6-.8-.1-.4-.1-.8.1-1.1L5 4.7c.2-.3.5-.5.8-.6.4-.1.8 0 1.1.1l11.4 5.7c.3.2.5.5.6.8.1.4.1.8-.1 1.1l-2.6 4.6c-.2.3-.5.5-.8.6-.4.1-.8 0-1.1-.1L2.9 11.2Z"/><path d="m18 10-5.5-2.7C12 7 11.6 7 11.1 7.2L6 9.8"/></svg>`;
    case "Infinity":
      return `<svg ${iconBase} class="lucide lucide-infinity"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>`;
    case "Workflow":
      return `<svg ${iconBase} class="lucide lucide-workflow"><rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="13" rx="2"/><path d="M17 11V3h-6"/><path d="M7 11v10h6"/></svg>`;
    case "Users":
      return `<svg ${iconBase} class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    case "UserPlus":
      return `<svg ${iconBase} class="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`;
    default:
      return `<svg ${iconBase} class="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`;
  }
}