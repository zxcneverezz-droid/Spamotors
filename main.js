/* ============================================================
   SPA MOTORS — main.js
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "spa-motors-theme";

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const transitionEl = document.getElementById("themeTransition");

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, animate) {
    if (animate && transitionEl) {
      const rect = toggleBtn.getBoundingClientRect();
      transitionEl.style.setProperty("--tx", (rect.left + rect.width / 2) + "px");
      transitionEl.style.setProperty("--ty", (rect.top + rect.height / 2) + "px");
      transitionEl.classList.add("active");
      setTimeout(() => transitionEl.classList.remove("active"), 500);
    }
    root.setAttribute("data-theme", theme);
    if (toggleBtn) {
      toggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
      toggleBtn.setAttribute("aria-label", theme === "dark" ? "Переключиться на светлую тему" : "Переключиться на тёмную тему");
    }
  }

  function initTheme() {
    let theme = localStorage.getItem(STORAGE_KEY);
    if (!theme) theme = getSystemTheme();
    applyTheme(theme, false);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next, true);
    localStorage.setItem(STORAGE_KEY, next);
  }

  if (toggleBtn) toggleBtn.addEventListener("click", toggleTheme);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light", true);
    }
  });

  initTheme();

  /* ---------- Header scroll ---------- */
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src) {
    if (lightbox && lightboxImg) {
      lightboxImg.src = src;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", "Открыть фотографию");
    const img = item.querySelector("img");
    const src = img ? img.src : "";
    const open = () => src && openLightbox(src);
    item.addEventListener("click", open);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) closeLightbox();
  });

  /* ---------- Service "learn more" -> booking ---------- */
  document.querySelectorAll(".service-cta").forEach((btn) => {
    btn.addEventListener("click", () => {
      const service = btn.getAttribute("data-service");
      const select = document.getElementById("serviceSelect");
      if (select && service) select.value = service;
      const booking = document.getElementById("booking");
      if (booking) booking.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Form validation ---------- */
  const form = document.getElementById("bookingForm");
  const successEl = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      const requiredFields = [
        { id: "name", msg: "Укажите ваше имя" },
        { id: "phone", msg: "Укажите номер телефона" },
      ];

      requiredFields.forEach(({ id }) => {
        const group = document.getElementById(id + "Group");
        const input = document.getElementById(id);
        if (group && input) {
          const val = input.value.trim();
          if (!val) {
            group.classList.add("error");
            valid = false;
          } else {
            group.classList.remove("error");
          }
        }
      });

      const phoneInput = document.getElementById("phone");
      const phoneGroup = document.getElementById("phoneGroup");
      if (phoneInput && phoneGroup && phoneInput.value.trim()) {
        const digits = phoneInput.value.replace(/\D/g, "");
        if (digits.length < 10) {
          phoneGroup.classList.add("error");
          valid = false;
        }
      }

      if (!valid) return;

      /* Integration point for backend:
         fetch("/api/booking", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             name: document.getElementById("name").value,
             phone: document.getElementById("phone").value,
             car: document.getElementById("car").value,
             service: document.getElementById("serviceSelect").value,
             datetime: document.getElementById("datetime").value,
           }),
         })
      */

      if (successEl) {
        successEl.classList.add("show");
        successEl.textContent = "Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.";
      }
      form.reset();
      setTimeout(() => {
        if (successEl) successEl.classList.remove("show");
      }, 5000);
    });

    form.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("input", () => {
        const group = el.closest(".form-group");
        if (group) group.classList.remove("error");
      });
    });
  }

  /* ---------- Active nav highlight ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav a");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  });
})();