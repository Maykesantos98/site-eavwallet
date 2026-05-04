const SUPPORTED_LANGS = ["pt", "en", "es"];

function detectLang() {
  const stored = localStorage.getItem("eav-lang");
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const browser = (navigator.language || "pt").slice(0, 2);
  return SUPPORTED_LANGS.includes(browser) ? browser : "pt";
}

function applyTranslations(dict) {
  document.documentElement.lang = dict.__lang || "pt-BR";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const pairs = el.getAttribute("data-i18n-attr").split(";");
    pairs.forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
    });
  });
}

async function setupI18n() {
  const initial = detectLang();
  let dict = null;
  try {
    const res = await fetch("i18n.json");
    const all = await res.json();
    dict = all[initial];
    if (!dict) return;
    dict.__lang = { pt: "pt-BR", en: "en", es: "es" }[initial];
    applyTranslations(dict);
    window.__i18nAll = all;
    window.__currentLang = initial;
  } catch (err) {}

  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.getAttribute("data-lang-switch");
      if (!SUPPORTED_LANGS.includes(next) || !window.__i18nAll) return;
      localStorage.setItem("eav-lang", next);
      const d = window.__i18nAll[next];
      d.__lang = { pt: "pt-BR", en: "en", es: "es" }[next];
      applyTranslations(d);
      window.__currentLang = next;
      document.querySelectorAll("[data-lang-switch]").forEach((b) => {
        b.classList.toggle("is-active", b.getAttribute("data-lang-switch") === next);
      });
    });
    btn.classList.toggle("is-active", btn.getAttribute("data-lang-switch") === initial);
  });
}

setupI18n();

const revealItems = document.querySelectorAll(".reveal");
const animatedMoney = document.querySelectorAll(".count-money");
const navGroups = document.querySelectorAll(".nav-group");
const mobileMenuButton = document.querySelector("[data-mobile-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const mobileBackdrop = document.querySelector("[data-mobile-backdrop]");

function setMobileMenu(open) {
  if (!mobilePanel) return;
  mobilePanel.classList.toggle("is-open", open);
  mobileBackdrop?.classList.toggle("is-open", open);
  mobileMenuButton?.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("is-menu-open", open);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll(".count-money").forEach(animateMoney);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

if (window.lucide) {
  window.lucide.createIcons();
}

navGroups.forEach((group) => {
  const trigger = group.querySelector(".nav-trigger");

  trigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = group.classList.contains("is-open");
    navGroups.forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
    });
    group.classList.toggle("is-open", !isOpen);
    trigger.setAttribute("aria-expanded", String(!isOpen));
  });
});

mobileMenuButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = mobilePanel?.classList.contains("is-open");
  setMobileMenu(!isOpen);
});

mobileBackdrop?.addEventListener("click", () => setMobileMenu(false));

mobilePanel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMobileMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMobileMenu(false);
});

document.addEventListener("click", (event) => {
  navGroups.forEach((item) => {
    item.classList.remove("is-open");
    item.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
  });
  if (
    mobilePanel?.classList.contains("is-open") &&
    !mobilePanel.contains(event.target) &&
    !mobileMenuButton?.contains(event.target)
  ) {
    setMobileMenu(false);
  }
});

function animateMoney(element) {
  if (element.dataset.done === "true") {
    return;
  }

  element.dataset.done = "true";
  const target = Number(element.dataset.value || 0);
  const duration = 1100;
  const start = performance.now();
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatter.format(target * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

animatedMoney.forEach((item) => {
  const rect = item.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    animateMoney(item);
  }
});

// === Generic count-up (proof strip stats) ===
function animateCount(el) {
  if (el.dataset.done === "true") return;
  el.dataset.done = "true";
  const target = Number(el.dataset.target || el.textContent || 0);
  const fmt = el.dataset.format || "int";
  const duration = 1400;
  const start = performance.now();
  const formatter = fmt === "int"
    ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 })
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = formatter.format(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = formatter.format(target);
  }
  requestAnimationFrame(step);
}
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll(".count-up").forEach((el) => countObserver.observe(el));

const heroVisual = document.querySelector(".hero-visual");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function setHeroVar(name, value) {
  if (!heroVisual) return;
  heroVisual.style.setProperty(name, value);
}

if (heroVisual && isFinePointer) {
  heroVisual.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion.matches) return;
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setHeroVar("--tilt-x", `${y * -8}deg`);
    setHeroVar("--tilt-y", `${x * 8}deg`);
    setHeroVar("--shift-x", `${x * 12}px`);
    setHeroVar("--shift-y", `${y * 12}px`);
  });

  heroVisual.addEventListener("pointerleave", () => {
    setHeroVar("--tilt-x", "0deg");
    setHeroVar("--tilt-y", "0deg");
    setHeroVar("--shift-x", "0px");
    setHeroVar("--shift-y", "0px");
  });
}

if (heroVisual && isFinePointer) {
  let scrollTicking = false;
  function updateScrollTilt() {
    scrollTicking = false;
    if (prefersReducedMotion.matches) return;
    const rect = heroVisual.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const center = rect.top + rect.height / 2;
    const progress = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
    setHeroVar("--scroll-tilt-x", `${progress * 4}deg`);
    setHeroVar("--scroll-tilt-y", `${progress * -2}deg`);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollTilt);
    },
    { passive: true }
  );
  updateScrollTilt();
}

// === App showcase (interactive phone carousel, rAF-driven) ===
(function setupAppShowcase() {
  const showcase = document.querySelector("[data-app-showcase]");
  if (!showcase) return;

  const slides = Array.from(showcase.querySelectorAll(".app-slide"));
  const thumbs = Array.from(showcase.querySelectorAll(".app-thumb"));
  const dots = Array.from(showcase.querySelectorAll(".app-dot"));
  const chipGroups = Array.from(showcase.querySelectorAll(".app-chip-group"));
  const goButtons = Array.from(showcase.querySelectorAll("[data-app-go]"));
  const titleEl = showcase.querySelector("[data-app-title]");
  const descEl = showcase.querySelector("[data-app-desc]");
  const currentEl = showcase.querySelector("[data-app-current]");
  const totalEl = showcase.querySelector("[data-app-total]");
  const progressEl = showcase.querySelector("[data-app-progress]");
  const infoContent = showcase.querySelector(".app-info-content");
  const prevBtn = showcase.querySelector("[data-app-prev]");
  const nextBtn = showcase.querySelector("[data-app-next]");
  const playBtn = showcase.querySelector("[data-app-play]");
  const tapEl = showcase.querySelector(".app-phone-tap");
  const hintEl = showcase.querySelector("[data-app-hint]");
  const hintTextEl = showcase.querySelector("[data-app-hint-text]");

  if (!slides.length || !goButtons.length) return;

  const total = slides.length;
  const INTERVAL = 5000;
  let active = 0;
  let isPlaying = true;
  let isHovered = false;
  let cycleStart = performance.now();
  let elapsedAtPause = 0;
  let rafId = null;

  if (totalEl) totalEl.textContent = `/ ${String(total).padStart(2, "0")}`;

  function setActive(index, opts) {
    const fromUser = !!(opts && opts.fromUser);
    const restart = !opts || opts.restart !== false;
    const next = ((index % total) + total) % total;
    if (next === active && !fromUser) return;

    active = next;

    slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
    thumbs.forEach((t, i) => {
      t.classList.toggle("is-active", i === active);
      t.setAttribute("aria-selected", i === active ? "true" : "false");
    });
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    chipGroups.forEach((g) => g.classList.toggle("is-active", Number(g.dataset.chipFor) === active));

    const activeThumb = thumbs[active];
    const newTitle = activeThumb && activeThumb.querySelector("strong") ? activeThumb.querySelector("strong").innerHTML : "";
    const newDesc = activeThumb && activeThumb.querySelector("small") ? activeThumb.querySelector("small").innerHTML : "";
    const newNum = String(active + 1).padStart(2, "0");

    if (infoContent) infoContent.classList.add("is-changing");
    if (currentEl) currentEl.classList.add("is-changing");

    window.setTimeout(() => {
      if (titleEl) titleEl.innerHTML = newTitle;
      if (descEl) descEl.innerHTML = newDesc;
      if (currentEl) currentEl.textContent = newNum;
      if (infoContent) infoContent.classList.remove("is-changing");
      if (currentEl) currentEl.classList.remove("is-changing");
    }, 220);

    // Tap pulse on screen
    if (tapEl) {
      tapEl.classList.remove("is-tapping");
      void tapEl.offsetWidth;
      tapEl.classList.add("is-tapping");
    }

    if (restart) {
      cycleStart = performance.now();
      elapsedAtPause = 0;
    }
  }

  function tick(now) {
    rafId = null;
    if (!progressEl) return;

    const effectivelyPaused = !isPlaying || isHovered;
    const elapsed = effectivelyPaused
      ? elapsedAtPause
      : (now - cycleStart) + elapsedAtPause;

    const ratio = Math.min(1, Math.max(0, elapsed / INTERVAL));
    progressEl.style.width = (ratio * 100) + "%";
    progressEl.classList.toggle("is-active", ratio > 0.001);

    if (!effectivelyPaused && ratio >= 1) {
      // advance to next screen and restart cycle
      cycleStart = now;
      elapsedAtPause = 0;
      setActive(active + 1, { restart: false });
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(tick);
  }

  function setPlaying(state) {
    if (state === isPlaying) return;
    const now = performance.now();
    if (!state) {
      // pausing: capture elapsed
      if (!isHovered) elapsedAtPause = Math.min(INTERVAL, elapsedAtPause + (now - cycleStart));
    } else {
      // resuming: restart the cycle window
      cycleStart = now;
    }
    isPlaying = state;
    if (playBtn) {
      playBtn.classList.toggle("is-paused", !state);
      playBtn.setAttribute("aria-label", state ? "Pausar" : "Reproduzir");
    }
    if (hintEl) hintEl.classList.toggle("is-paused", !state);
    if (hintTextEl) hintTextEl.textContent = state ? "Auto · 5s" : "Pausado";
  }

  function setHovered(state) {
    if (state === isHovered) return;
    const now = performance.now();
    if (state) {
      // entering hover: pause and capture
      if (isPlaying) elapsedAtPause = Math.min(INTERVAL, elapsedAtPause + (now - cycleStart));
    } else {
      // leaving hover: resume
      cycleStart = now;
    }
    isHovered = state;
  }

  // === Wire up controls ===
  goButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(Number(btn.dataset.appGo || 0), { fromUser: true });
    });
  });
  if (prevBtn) prevBtn.addEventListener("click", () => setActive(active - 1, { fromUser: true }));
  if (nextBtn) nextBtn.addEventListener("click", () => setActive(active + 1, { fromUser: true }));
  if (playBtn) playBtn.addEventListener("click", () => setPlaying(!isPlaying));

  showcase.addEventListener("mouseenter", () => setHovered(true));
  showcase.addEventListener("mouseleave", () => setHovered(false));
  showcase.addEventListener("focusin", () => setHovered(true));
  showcase.addEventListener("focusout", (e) => {
    if (!showcase.contains(e.relatedTarget)) setHovered(false);
  });

  let touchStartX = null;
  showcase.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  showcase.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) setActive(active + (dx < 0 ? 1 : -1), { fromUser: true });
    touchStartX = null;
  });

  document.addEventListener("keydown", (e) => {
    if (!showcase.contains(document.activeElement) && !showcase.matches(":hover")) return;
    if (e.key === "ArrowRight") { setActive(active + 1, { fromUser: true }); }
    else if (e.key === "ArrowLeft") { setActive(active - 1, { fromUser: true }); }
    else if (e.key === " " && document.activeElement && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      setPlaying(!isPlaying);
    }
  });

  // Pause loop while tab is hidden, resume when visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      if (isPlaying && !isHovered) {
        elapsedAtPause = Math.min(INTERVAL, elapsedAtPause + (performance.now() - cycleStart));
      }
    } else {
      cycleStart = performance.now();
      startLoop();
    }
  });

  // Re-sync title/desc when language changes (after i18n applies)
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.setTimeout(() => {
        const t = thumbs[active];
        if (!t) return;
        const nt = t.querySelector("strong") ? t.querySelector("strong").innerHTML : "";
        const nd = t.querySelector("small") ? t.querySelector("small").innerHTML : "";
        if (titleEl) titleEl.innerHTML = nt;
        if (descEl) descEl.innerHTML = nd;
      }, 60);
    });
  });

  // Honor reduced motion: stop auto-advance, keep manual controls
  if (typeof prefersReducedMotion !== "undefined" && prefersReducedMotion.matches) {
    setPlaying(false);
  }

  // Initialize: HTML already has correct .is-active classes for index 0,
  // so just start the loop. Avoid setActive() on init to prevent a fade flash.
  cycleStart = performance.now();
  elapsedAtPause = 0;
  startLoop();
})();

// === Header scroll state + back-to-top reveal ===
const siteHeader = document.querySelector(".site-header");
const backHome = document.querySelector(".back-home");
let headerTicking = false;
function updateChrome() {
  headerTicking = false;
  const y = window.scrollY || window.pageYOffset || 0;
  if (siteHeader) siteHeader.classList.toggle("is-scrolled", y > 12);
  if (backHome) backHome.classList.toggle("is-visible", y > 480);
}
window.addEventListener(
  "scroll",
  () => {
    if (headerTicking) return;
    headerTicking = true;
    window.requestAnimationFrame(updateChrome);
  },
  { passive: true }
);
updateChrome();

const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookieAccept = document.querySelector("[data-cookie-accept]");
if (cookieBanner) {
  if (!localStorage.getItem("eav-cookies-ack")) {
    cookieBanner.hidden = false;
    window.requestAnimationFrame(() => cookieBanner.classList.add("is-visible"));
  }
  cookieAccept?.addEventListener("click", () => {
    localStorage.setItem("eav-cookies-ack", "1");
    cookieBanner.classList.remove("is-visible");
    window.setTimeout(() => (cookieBanner.hidden = true), 320);
  });
}

if (new URLSearchParams(window.location.search).get("subscribed") === "1") {
  const note = document.createElement("div");
  note.className = "subscribed-toast";
  note.setAttribute("role", "status");
  const lang = detectLang();
  const fallbackMsg = {
    pt: "Você está na lista! Vamos avisar assim que abrir.",
    en: "You're on the list! We'll let you know as soon as we open.",
    es: "¡Estás en la lista! Te avisaremos en cuanto abramos.",
  };
  note.innerHTML = `<i data-lucide="check-circle"></i> ${fallbackMsg[lang] || fallbackMsg.pt}`;
  document.body.appendChild(note);
  if (window.lucide) window.lucide.createIcons();
  window.setTimeout(() => note.classList.add("is-visible"), 80);
  window.setTimeout(() => {
    note.classList.remove("is-visible");
    window.setTimeout(() => note.remove(), 400);
  }, 4800);
}
