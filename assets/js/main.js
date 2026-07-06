/*
 * RomanT Apps — main.js
 * Vanilla JS, no dependencies. Handles:
 *  - sticky header shrink/blur on scroll
 *  - dark-mode toggle persisted to localStorage
 *  - IntersectionObserver scroll-reveal with stagger
 *  - count-up stats in view
 *  - 3D tilt + shine on app cards
 *  - hero phone-mockup parallax
 *  - smooth-scroll for nav anchors
 *  - category filter for apps grid
 *  - mobile nav toggle
 * All motion no-ops under prefers-reduced-motion: reduce.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------------
   * Theme toggle
   * ------------------------------------------------------------- */
  function initTheme() {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    var root = document.documentElement;

    function currentTheme() {
      return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function setTheme(theme) {
      root.setAttribute("data-theme", theme);
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      try {
        localStorage.setItem("romantapps-theme", theme);
      } catch (e) {
        /* storage unavailable, ignore */
      }
    }

    toggle.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");

    toggle.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* -------------------------------------------------------------
   * Sticky header shrink/blur on scroll
   * ------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* -------------------------------------------------------------
   * Mobile nav toggle
   * ------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* -------------------------------------------------------------
   * Smooth-scroll for in-page nav anchors
   * ------------------------------------------------------------- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        history.pushState(null, "", id);
      });
    });
  }

  /* -------------------------------------------------------------
   * Scroll-reveal with stagger (IntersectionObserver)
   * ------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------------
   * Count-up stats when in view
   * ------------------------------------------------------------- */
  function initCountUp() {
    var counters = document.querySelectorAll(".count-up[data-count-to]");
    if (!counters.length) return;

    function animateCount(el) {
      var target = parseFloat(el.getAttribute("data-count-to"), 10) || 0;
      if (reduceMotion) {
        el.textContent = String(target);
        return;
      }
      var duration = 1400;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); /* ease-out-cubic */
        var value = Math.round(eased * target);
        el.textContent = String(value);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = String(target);
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------------
   * 3D tilt + shine on app cards
   * ------------------------------------------------------------- */
  function initCardTilt() {
    if (reduceMotion) return;
    var cards = document.querySelectorAll(".app-card");
    if (!cards.length) return;

    var maxTilt = 7;

    cards.forEach(function (card) {
      var frame = null;

      function onMove(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateY = (x - 0.5) * (maxTilt * 2);
        var rotateX = (0.5 - y) * (maxTilt * 2);

        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(function () {
          card.style.transform =
            "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" +
            rotateY.toFixed(2) + "deg) translateY(-4px)";
        });
      }

      function onLeave() {
        if (frame) window.cancelAnimationFrame(frame);
        card.style.transform = "";
      }

      card.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        onMove(e);
      });
      card.addEventListener("pointerleave", onLeave);
    });
  }

  /* -------------------------------------------------------------
   * Hero phone-mockup parallax (pointer + scroll)
   * ------------------------------------------------------------- */
  function initParallax() {
    if (reduceMotion) return;
    var visual = document.getElementById("heroVisual");
    if (!visual) return;

    var phones = visual.querySelectorAll("[data-parallax]");
    if (!phones.length) return;

    var frame = null;

    visual.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var rect = visual.getBoundingClientRect();
      var cx = (e.clientX - rect.left) / rect.width - 0.5;
      var cy = (e.clientY - rect.top) / rect.height - 0.5;

      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () {
        phones.forEach(function (phone) {
          var factor = parseFloat(phone.getAttribute("data-parallax")) || 0.04;
          var moveX = cx * 60 * factor * 10;
          var moveY = cy * 60 * factor * 10;
          var baseTransform = phone.getAttribute("data-base-transform") || "";
          phone.style.transform =
            "translate(" + moveX.toFixed(1) + "px, " + moveY.toFixed(1) + "px)";
        });
      });
    });

    visual.addEventListener("pointerleave", function () {
      if (frame) window.cancelAnimationFrame(frame);
      phones.forEach(function (phone) {
        phone.style.transform = "";
      });
    });

    /* subtle scroll parallax too */
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          var scrollY = window.scrollY || 0;
          phones.forEach(function (phone, i) {
            var depth = (i + 1) * 0.015;
            phone.style.setProperty("--scroll-shift", (scrollY * depth).toFixed(1) + "px");
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------------
   * Category filter for apps grid
   * ------------------------------------------------------------- */
  function initFilters() {
    var chips = document.querySelectorAll(".filter-chip");
    var cards = document.querySelectorAll(".app-card");
    if (!chips.length || !cards.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        chip.setAttribute("aria-pressed", "true");

        var filter = chip.getAttribute("data-filter");

        cards.forEach(function (card) {
          var matches = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("is-hidden", !matches);
        });
      });
    });
  }

  /* -------------------------------------------------------------
   * Init
   * ------------------------------------------------------------- */
  function init() {
    initTheme();
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initReveal();
    initCountUp();
    initCardTilt();
    initParallax();
    initFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
