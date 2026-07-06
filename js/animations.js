/**
 * Animations & Interactions Module
 * 
 * Implements smooth scroll-triggered reveal animations via Intersection Observer,
 * scroll-spy navbar highlighting, mobile drawer toggles, static count-up animations,
 * and back-to-top scrolling interactions.
 */

/**
 * Initializes scroll-triggered reveal animations.
 * Adds 'visible' class to elements with class 'reveal' when they enter viewport.
 */
export function initScrollAnimations() {
  const revealElements = document.querySelectorAll(".reveal, .reveal-up, .reveal-left, .reveal-right");
  
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add visible class to trigger CSS transition
          entry.target.classList.add("visible");
          // Once animated, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null, // viewport
      threshold: 0.1, // trigger when 10% is visible
      rootMargin: "0px 0px -50px 0px" // trigger slightly before entering viewport fully
    }
  );

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

/**
 * Initializes Scroll Spy to highlight active navigation link based on scroll position.
 */
export function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const spyObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    {
      root: null,
      threshold: 0.3, // Trigger when 30% of the section is visible
      rootMargin: "-20% 0px -60% 0px" // Focus window in the upper-middle of the screen
    }
  );

  sections.forEach(section => {
    spyObserver.observe(section);
  });
}

/**
 * Animates a numeric count-up from 0 to a target value.
 * @param {HTMLElement} element The target DOM element.
 * @param {number} targetValue The end number.
 * @param {number} duration Animation duration in ms.
 */
function animateCount(element, targetValue, duration = 1500) {
  let startTimestamp = null;
  const startValue = 0;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Cubic ease-out calculation
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(easeProgress * (targetValue - startValue) + startValue);
    
    element.textContent = currentValue;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = targetValue;
    }
  };

  window.requestAnimationFrame(step);
}

/**
 * Initializes the count-up animation for GitHub statistics when they enter the viewport.
 */
export function initStatsCountUp() {
  const statNumbers = document.querySelectorAll(".stat-number");

  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.getAttribute("data-target") || "0", 10);
          
          animateCount(element, target, 1500);
          observer.unobserve(element); // Animate only once
        }
      });
    },
    {
      root: null,
      threshold: 0.5
    }
  );

  statNumbers.forEach(num => {
    statsObserver.observe(num);
  });
}

/**
 * Sets up basic navbar scroll behaviors and mobile menu toggles.
 */
export function initNavbarInteractions() {
  const header = document.querySelector(".header");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link, .nav-cta");
  const backToTopBtn = document.getElementById("backToTop");

  // 1. Sticky header and Back-To-Top button on Scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    if (backToTopBtn) {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }
  });

  // 2. Mobile Hamburger menu toggle
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
      mobileMenuBtn.classList.toggle("open");
      navMenu.classList.toggle("open");
      
      // Prevent body scrolling when mobile menu is open
      document.body.classList.toggle("menu-open");
    });
  }

  // 3. Close mobile menu when nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu && navMenu.classList.contains("open")) {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuBtn.classList.remove("open");
        navMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
      }
    });
  });

  // 4. Back-to-top button smooth scroll
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}
