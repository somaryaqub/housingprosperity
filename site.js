// Scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1, rootMargin: "0px 0px -24px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // ── btn-secondary: border draw, reverses and replays every 7s ──
  function setBorderPerimeters() {
    document.querySelectorAll(".btn-secondary").forEach(btn => {
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      const perimeter = (w + h) * 2;
      btn.style.setProperty("--perimeter", perimeter);
      const rect = btn.querySelector("svg.btn-border rect");
      if (rect) {
        rect.setAttribute("width", w - 1);
        rect.setAttribute("height", h - 1);
      }
    });
  }
  setBorderPerimeters();
  window.addEventListener("resize", setBorderPerimeters);

  function cycleBorderDraw(btn) {
    const rect = btn.querySelector("svg.btn-border rect");
    if (!rect) return;
    const perimeter = parseFloat(btn.style.getPropertyValue("--perimeter")) || 999;
    // Step 1: erase (forward dashoffset back to perimeter)
    rect.animate(
      [{ strokeDashoffset: 0 }, { strokeDashoffset: perimeter }],
      { duration: 900, easing: "cubic-bezier(0.4,0,0.2,1)", fill: "forwards" }
    ).finished.then(() => {
      // Step 2: brief pause, then redraw
      setTimeout(() => {
        rect.animate(
          [{ strokeDashoffset: perimeter }, { strokeDashoffset: 0 }],
          { duration: 1200, easing: "cubic-bezier(0.4,0,0.2,1)", fill: "forwards" }
        );
      }, 300);
    });
  }

  // Initial draw fires via CSS animation; start cycling after first cycle completes
  document.querySelectorAll(".btn-secondary").forEach(btn => {
    // First cycle starts after the initial CSS animation (1s delay + 1.2s draw = ~2.5s)
    setTimeout(() => {
      setInterval(() => cycleBorderDraw(btn), 7000);
    }, 2500);
  });

  // ── btn-ghost-white: fill sweep, reverses and replays every 7s ──
  function cycleFillSweep(btn) {
    // Step 1: retract right-to-left
    btn.classList.remove("border-draw-ready");
    btn.classList.add("border-draw-reverse");
    // Step 2: after retract completes (~500ms), reset origin and sweep in again
    setTimeout(() => {
      btn.classList.remove("border-draw-reverse");
      // tiny pause so ::before resets transform-origin to left
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          btn.classList.add("border-draw-ready");
        });
      });
    }, 550);
  }

  const btnObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // First trigger on scroll
        e.target.classList.add("border-draw-ready");
        btnObserver.unobserve(e.target);
        // Then cycle every 7s
        setTimeout(() => {
          setInterval(() => cycleFillSweep(e.target), 7000);
        }, 800);
      }
    });
  }, { threshold: 0.8 });
  document.querySelectorAll(".btn-ghost-white").forEach(btn => btnObserver.observe(btn));

  // Nav scroll shadow
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });

  // ── Hamburger drawer ──
  function initDrawer() {
    const hamburger = document.getElementById("navHamburger");
    const drawer    = document.getElementById("navDrawer");
    const overlay   = document.getElementById("navOverlay");
    const closeBtn  = document.getElementById("navDrawerClose");

    if (!hamburger || !drawer || !overlay || !closeBtn) return;

    function openDrawer() {
      drawer.classList.add("open");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeDrawer() {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);

    // Close drawer on any drawer link click
    drawer.querySelectorAll(".drawer-link").forEach(link => {
      link.addEventListener("click", closeDrawer);
    });
  }


  // ── Open a collapsed section when a link or URL hash points at it (or inside it) ──
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    let opened = false;
    for (let n = el; n; n = n.parentElement) {
      if (n.tagName === "DETAILS" && !n.open) { n.open = true; opened = true; }
    }
    if (opened) el.scrollIntoView();
  }
  window.addEventListener("hashchange", openFromHash);
  window.addEventListener("load", openFromHash);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDrawer);
  } else {
    initDrawer();
  }
