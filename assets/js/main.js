/**
 * Progressive enhancement only — all real content lives in index.html
 * so the page works fully with this script disabled or failing.
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- mobile nav toggle ---------------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var links = document.querySelector("[data-nav-links]");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- hero name split-text entrance ---------------- */
  // Wraps each character of the hero name in its own <span> and fades/
  // slides them in with a per-character stagger, like the pasted
  // SplitText component — done here in plain CSS transitions instead
  // since this project has no React/build step. Skipped under
  // prefers-reduced-motion (plain static text); with JS disabled the
  // <span data-split-text> never gets split, so it just renders as
  // normal text either way.
  var splitEl = document.querySelector("[data-split-text]");
  if (splitEl && !reducedMotion) {
    var text = splitEl.textContent;
    splitEl.textContent = "";
    var chars = text.split("").map(function (ch) {
      var span = document.createElement("span");
      span.className = "split-char";
      span.textContent = ch === " " ? " " : ch;
      splitEl.appendChild(span);
      return span;
    });
    var STAGGER_MS = 35;
    chars.forEach(function (span, i) {
      span.style.transitionDelay = (i * STAGGER_MS) + "ms";
    });
    // rAF so the initial (opacity: 0) state paints first, then the
    // .is-visible class transition actually animates instead of
    // snapping straight to visible.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        chars.forEach(function (span) { span.classList.add("is-visible"); });
      });
    });
  }

  /* ---------------- hero scroll-expand intro ---------------- */
  // Page opens on the hero shrunk to a small rounded card (via CSS
  // `transform: scale`); scrolling grows it to full size, then normal
  // page flow continues below. Pure CSS/JS, no image asset needed —
  // it's the hero's own existing content that expands.
  var expandRoot = document.querySelector("[data-scroll-expand]");
  if (expandRoot) {
    var frame = expandRoot.querySelector("[data-scroll-frame]");
    var spacer = expandRoot.querySelector(".hero-expand__spacer");
    var hint = expandRoot.querySelector("[data-scroll-hint]");
    var headline = expandRoot.querySelector("[data-hero-headline]");
    var bgDecor = document.querySelector(".bg-decor");
    var MAX_BG_BLUR = 10; // px, ~"50% blurred" while shrunk, sharp once fully expanded
    // Symmetric with scroll direction: shows once fully expanded, hides
    // again the same way if the card shrinks back down (not one-time).
    var setHeadlineVisible = function (visible) {
      if (headline) headline.classList.toggle("is-visible", visible);
    };

    // On short viewports (landscape phones, small laptops with lots of
    // browser chrome) the fully-expanded hero can be taller than the
    // screen — pinned inside the sticky stage, that would clip its
    // bottom edge. Fall back to the plain, non-animated hero there too.
    var isShort = function () { return window.innerHeight < 480; };

    var applyStatic = function () {
      frame.style.transform = "none";
      frame.style.borderRadius = "0";
      if (hint) hint.style.display = "none";
      if (bgDecor) bgDecor.style.filter = "none";
      spacer.style.height = "auto";
      setHeadlineVisible(true);
    };

    if (reducedMotion || isShort()) {
      if (frame && spacer) applyStatic();
    } else if (frame && spacer) {
      var START_RADIUS = 28; // px, matches the CSS default in style.css
      var EXPAND_VH = 1.2;   // viewport heights of scroll to reach full size

      var startScale = function () {
        return window.innerWidth <= 720 ? 0.78 : 0.44; // matches the CSS breakpoint
      };

      var ticking = false;
      var update = function () {
        ticking = false;
        if (isShort()) { applyStatic(); return; } // e.g. rotated to landscape mid-scroll

        var rect = spacer.getBoundingClientRect();
        var expandPx = window.innerHeight * EXPAND_VH;
        var scrolled = Math.max(0, -rect.top);
        var progress = Math.min(1, scrolled / expandPx);

        var scale = startScale() + (1 - startScale()) * progress;
        frame.style.transform = "scale(" + scale.toFixed(4) + ")";
        frame.style.borderRadius = (START_RADIUS * (1 - progress)).toFixed(1) + "px";

        if (hint) hint.style.opacity = String(Math.max(0, 1 - progress / 0.15));
        // Background reads sharp once fully expanded, blurred while shrunk —
        // draws the eye to the small card instead of the pattern around it.
        if (bgDecor) bgDecor.style.filter = "blur(" + (MAX_BG_BLUR * (1 - progress)).toFixed(2) + "px)";
        // Only the name shows while shrunk; the flag/intro/stats fade in
        // once the card reaches full size, and fade back out the same way
        // if it shrinks back down (e.g. scrolling back up past the hero).
        setHeadlineVisible(progress >= 0.98);
      };
      var onScroll = function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }
  }

  /* ---------------- smooth scroll (Lenis) ---------------- */
  // https://github.com/darkroomengineering/lenis — progressive enhancement,
  // the page scrolls natively if this CDN script fails to load.
  var lenis = null;
  if (typeof Lenis !== "undefined") {
    // No manual offset here: every section already sets `scroll-margin-top`
    // in CSS to clear the sticky nav, and Lenis reads that same computed
    // style when it resolves an anchor's target — adding our own offset on
    // top of it would double-count the nav height.
    lenis = new Lenis({
      autoRaf: true,
      anchors: true,
    });
  }

  /* ---------------- contact background (Vanta FOG) ---------------- */
  // https://www.vantajs.com/ (three.js-based). CDN scripts + the canvas
  // host are progressive enhancement: skipped under reduced-motion, and
  // the contact section just keeps its plain dark background if either
  // the three.js/vanta CDN scripts fail to load or the host is missing.
  var vantaEl = document.querySelector("[data-vanta-contact]");
  if (vantaEl && !reducedMotion && typeof VANTA !== "undefined" && VANTA.FOG) {
    VANTA.FOG({
      el: vantaEl,
      mouseControls: true,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      // No color overrides — this is FOG's own default palette.
    });
  }

  /* ---------------- scroll reveal (self-healing) ---------------- */
  var revealEls = document.querySelectorAll(".reveal");

  var reveal = function (el) { el.classList.add("is-visible"); };

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(reveal);
  }

  // Safety net: never let a rendering hiccup (a missed observer entry,
  // a jump straight to an anchor, etc.) leave real content invisible.
  window.setTimeout(function () { revealEls.forEach(reveal); }, 2000);

  /* ---------------- back-to-top ---------------- */
  var toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    var onScroll = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 640);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTop.addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
