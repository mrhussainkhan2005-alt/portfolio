/* =========================================================
   MOHAMMAD HUSSAIN KHAN — PORTFOLIO SCRIPT
   Vanilla JavaScript. No dependencies.
   ========================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------
     1. THEME TOGGLE (light / dark, saved to localStorage)
     --------------------------------------------------- */
  var THEME_KEY = "mhk-theme";
  var themeToggle = document.getElementById("theme-toggle");
  var rootEl = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      rootEl.setAttribute("data-theme", "dark");
      themeToggle.setAttribute("aria-pressed", "true");
      themeToggle.setAttribute("aria-label", "Switch to light theme");
    } else {
      rootEl.removeAttribute("data-theme");
      themeToggle.setAttribute("aria-pressed", "false");
      themeToggle.setAttribute("aria-label", "Switch to dark theme");
    }
  }

  function getPreferredTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (e) {
      /* localStorage unavailable — fall back to system preference */
    }
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener("click", function () {
    var isDark = rootEl.getAttribute("data-theme") === "dark";
    var next = isDark ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* ignore if storage is blocked */
    }
  });

  /* ---------------------------------------------------
     2. MOBILE MENU
     --------------------------------------------------- */
  var hamburger = document.getElementById("nav-hamburger");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMobileMenu() {
    mobileMenu.setAttribute("data-open", "false");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  function openMobileMenu() {
    mobileMenu.setAttribute("data-open", "true");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  hamburger.addEventListener("click", function () {
    var isOpen = mobileMenu.getAttribute("data-open") === "true";
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  document.querySelectorAll("[data-mobile-link]").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.getAttribute("data-open") === "true") {
      closeMobileMenu();
    }
  });

  /* ---------------------------------------------------
     3. SMOOTH SCROLL FOR IN-PAGE LINKS
     (native CSS scroll-behavior handles most of this;
     this also accounts for the sticky header height)
     --------------------------------------------------- */
  var header = document.getElementById("site-header");

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = link.getAttribute("href");
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      var headerHeight = header.offsetHeight;
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });

      // Move focus for keyboard/screen-reader users once scrolling settles.
      window.setTimeout(function () {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 420);
    });
  });

  /* ---------------------------------------------------
     4. SCROLL-SPY — highlight active nav link
     --------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isMatch = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isMatch);
      if (isMatch) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------
     5. SCROLL REVEAL ANIMATIONS
     --------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------
     6. PROJECT IMAGE LIGHTBOX
     --------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxTriggers = document.querySelectorAll("[data-lightbox-trigger]");
  var lightboxCloseEls = document.querySelectorAll("[data-lightbox-close]");
  var lightboxDialog = lightbox.querySelector(".lightbox__dialog");
  var lastFocusedElement = null;

  function getFocusableInLightbox() {
    return Array.prototype.slice.call(
      lightboxDialog.querySelectorAll('button, [href], img[tabindex]')
    );
  }

  function trapLightboxFocus(e) {
    if (e.key !== "Tab") return;
    var focusable = getFocusableInLightbox();
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openLightbox(src, alt) {
    lastFocusedElement = document.activeElement;
    lightboxImage.setAttribute("src", src);
    lightboxImage.setAttribute("alt", alt || "Project preview image");
    lightbox.setAttribute("data-open", "true");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", trapLightboxFocus);
    var closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute("data-open", "false");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImage.setAttribute("src", "");
    document.removeEventListener("keydown", trapLightboxFocus);
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  lightboxTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var src = trigger.getAttribute("data-lightbox-src");
      var alt = trigger.getAttribute("data-lightbox-alt");
      openLightbox(src, alt);
    });
  });

  lightboxCloseEls.forEach(function (el) {
    el.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.getAttribute("data-open") === "true") {
      closeLightbox();
    }
  });

  /* ---------------------------------------------------
     7. CONTACT FORM (mailto — no backend, no fake success)
     --------------------------------------------------- */
  var contactForm = document.getElementById("contact-form");
  var contactStatus = document.getElementById("contact-form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var message = document.getElementById("cf-message").value.trim();

      if (!name || !email || !message) {
        contactStatus.textContent = "Please fill in every field before sending.";
        return;
      }

      var subject = "Portfolio enquiry from " + name;
      var body = message + "\n\n— " + name + " (" + email + ")";
      var mailtoLink =
        "mailto:mrhussainkhan2005@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailtoLink;
      contactStatus.textContent = "Opening your email app now — please review and hit send there.";
    });
  }

  /* ---------------------------------------------------
     8. BACK TO TOP
     --------------------------------------------------- */
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
})();
