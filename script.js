const steps = Array.from(document.querySelectorAll(".process-step"));
const detail = document.querySelector(".process-detail");

steps.forEach((step, index) => {
  step.addEventListener("click", () => {
    steps.forEach((item) => {
      const isCurrent = item === step;
      item.classList.toggle("is-active", isCurrent);
      item.setAttribute("aria-selected", String(isCurrent));
    });

    detail.querySelector(".detail-kicker").textContent = `Step ${index + 1}`;
    detail.querySelector("h3").textContent = step.dataset.title;
    detail.querySelector(":scope > p").textContent = step.dataset.copy;

    const detailLink = detail.querySelector(":scope > a");
    detailLink.href = step.dataset.link;
    detailLink.innerHTML = `${step.dataset.linkLabel} <span aria-hidden="true">→</span>`;
  });
});

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
