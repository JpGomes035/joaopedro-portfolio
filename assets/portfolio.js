"use strict";

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#nav-links");
function closeMenu() {
  menu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}
menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});
const imageDialog = document.querySelector("#image-dialog");
document.querySelectorAll("[data-lightbox]").forEach((button) =>
  button.addEventListener("click", () => {
    const title = button.dataset.title;
    document.querySelector("#image-dialog-title").textContent = title;
    document.querySelector("#dialog-image").src = button.dataset.lightbox;
    document.querySelector("#dialog-image").alt = title;
    imageDialog.showModal();
  }),
);
document
  .querySelector(".close-dialog")
  .addEventListener("click", () => imageDialog.close());
imageDialog.addEventListener("click", (event) => {
  if (event.target === imageDialog) {
    const bounds = imageDialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      imageDialog.close();
  }
});
document.querySelector("#year").textContent = new Date().getFullYear();
