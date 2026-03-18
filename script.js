const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initPageReady();
  initAutoRevealAttributes();
  initRevealAnimations();
  initTimelineFocus();
  initSectionAwareness();
  initGentleParallax();
  initModal({
    modalSelector: ".surprise-modal",
    dialogSelector: ".surprise-dialog",
    openSelector: "[data-open-surprise]",
    closeSelector: "[data-close-surprise]"
  });
  initModal({
    modalSelector: ".rsvp-modal",
    dialogSelector: ".rsvp-dialog",
    openSelector: "[data-open-rsvp]",
    closeSelector: "[data-close-rsvp]",
    onOpen: (modal) => {
      modal.classList.remove("is-bursting");
      window.requestAnimationFrame(() => {
        modal.classList.add("is-bursting");
      });
    }
  });
});

function initPageReady() {
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
}

function initAutoRevealAttributes() {
  const staggerGroups = [
    {
      selector: ".roster-pill",
      effect: "soft-pop",
      step: 40
    },
    {
      selector: ".hero-badges .badge",
      effect: "soft-pop",
      step: 70
    },
    {
      selector: ".details-board .detail-card",
      effect: "fade-up",
      step: 110
    },
    {
      selector: ".patch-card",
      effect: "soft-pop",
      step: 90
    },
    {
      selector: ".rule-card",
      effect: "blur-right",
      step: 110
    },
    {
      selector: ".story-card",
      effect: "blur-left",
      step: 100
    },
    {
      selector: ".timeline-item",
      effect: "fade-up",
      step: 120
    }
  ];

  staggerGroups.forEach(({ selector, effect, step }) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      if (!item.dataset.reveal) {
        item.dataset.reveal = effect;
      }

      if (!item.dataset.revealDelay) {
        item.dataset.revealDelay = String(index * step);
      }
    });
  });
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  revealItems.forEach((item) => {
    const delay = item.dataset.revealDelay;
    if (delay) {
      item.style.setProperty("--reveal-delay", `${delay}ms`);
    }
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initTimelineFocus() {
  const items = document.querySelectorAll(".timeline-item");
  const track = document.querySelector(".timeline-track");

  if (!items.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items[0]?.classList.add("is-active");
    track?.style.setProperty("--timeline-progress", "0.2");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        items.forEach((item) => item.classList.remove("is-active"));
        entry.target.classList.add("is-active");
        const index = Array.from(items).indexOf(entry.target);
        if (index >= 0) {
          const progress = (index + 1) / items.length;
          track?.style.setProperty("--timeline-progress", progress.toFixed(3));
        }
      });
    },
    {
      threshold: 0.5
    }
  );

  items.forEach((item) => observer.observe(item));
}

function initSectionAwareness() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".site-nav a[href^='#']");

  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) {
    return;
  }

  const linkMap = new Map(
    Array.from(navLinks).map((link) => [link.getAttribute("href")?.slice(1), link])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => link.classList.remove("is-active"));
        const activeLink = linkMap.get(entry.target.id);
        activeLink?.classList.add("is-active");
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-18% 0px -42% 0px"
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initGentleParallax() {
  if (prefersReducedMotion) {
    return;
  }

  const parallaxItems = document.querySelectorAll("[data-parallax]");
  const floatingDecor = document.querySelectorAll(".sky-glow, .festive");
  const shimmerHeadings = document.querySelectorAll(".section-heading h2, .hero h1, .cta-panel h2");

  if (!parallaxItems.length && !floatingDecor.length && !shimmerHeadings.length) {
    return;
  }

  let rafId = null;

  const update = () => {
    const scrollY = window.scrollY;

    parallaxItems.forEach((item) => {
      item.style.transform = `translate3d(0, ${scrollY * 0.035}px, 0)`;
    });

    floatingDecor.forEach((item, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const x = scrollY * 0.01 * direction;
      const y = scrollY * 0.012 * (index + 1) * 0.35;
      item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    shimmerHeadings.forEach((item, index) => {
      const drift = Math.sin((scrollY + index * 90) * 0.003) * 3;
      item.style.transform = `translate3d(0, ${drift}px, 0)`;
    });

    rafId = null;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function initModal({
  modalSelector,
  dialogSelector,
  openSelector,
  closeSelector,
  onOpen
}) {
  const modal = document.querySelector(modalSelector);
  const dialog = modal?.querySelector(dialogSelector);
  const openButtons = document.querySelectorAll(openSelector);
  const closeButtons = document.querySelectorAll(closeSelector);

  if (!modal || !dialog || !openButtons.length) {
    return;
  }

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    dialog.querySelector(".modal-close")?.focus();
    onOpen?.(modal, dialog);
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.classList.remove("is-bursting");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}
