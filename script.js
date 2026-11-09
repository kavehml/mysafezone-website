const steps = Array.from(document.querySelectorAll(".process-step"));
const detail = document.querySelector(".process-detail");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const showStep = (step, index) => {
  steps.forEach((item) => {
    const isCurrent = item === step;
    item.classList.toggle("is-active", isCurrent);
    item.setAttribute("aria-selected", String(isCurrent));
    item.tabIndex = isCurrent ? 0 : -1;
  });

  detail.classList.add("is-changing");

  window.setTimeout(() => {
    detail.querySelector(".detail-kicker").textContent = `Step ${index + 1}`;
    detail.querySelector("h3").textContent = step.dataset.title;
    detail.querySelector(":scope > p").textContent = step.dataset.copy;

    const detailLink = detail.querySelector(":scope > a");
    detailLink.href = step.dataset.link;
    detailLink.innerHTML = `${step.dataset.linkLabel} <span aria-hidden="true">→</span>`;
    detail.classList.remove("is-changing");
  }, prefersReducedMotion.matches ? 0 : 130);
};

steps.forEach((step, index) => {
  step.tabIndex = index === 0 ? 0 : -1;
  step.addEventListener("click", () => showStep(step, index));

  step.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + steps.length) % steps.length;
    steps[nextIndex].focus();
    showStep(steps[nextIndex], nextIndex);
  });
});

if (!prefersReducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-motion-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll("[data-dialog]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const dialog = document.getElementById(trigger.dataset.dialog);
    if (dialog && !dialog.open) dialog.showModal();
  });
});

document.querySelectorAll(".info-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (outside) dialog.close();
  });
});
