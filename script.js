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

document.querySelector(".waitlist")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const original = button.innerHTML;
  button.innerHTML = 'Recebido <i data-lucide="check" aria-hidden="true"></i>';
  button.disabled = true;
  if (window.lucide) {
    window.lucide.createIcons();
  }

  window.setTimeout(() => {
    button.innerHTML = original;
    button.disabled = false;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, 2600);
});
