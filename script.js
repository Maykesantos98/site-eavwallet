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
