const isEditable = (element) =>
  element.tagName === "INPUT" ||
  element.tagName === "TEXTAREA" ||
  element.isContentEditable;

document.addEventListener("keydown", (event) => {
  if (
    isEditable(event.target) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return;
  }

  const routes = { h: "/", b: "/blog", o: "/open-source" };
  if (routes[event.key]) {
    event.preventDefault();
    window.location.href = routes[event.key];
  }
});

const path = window.location.pathname;
document.querySelectorAll("[data-nav]").forEach((link) => {
  const href = link.getAttribute("href");
  if (
    (href === "/" && path === "/") ||
    (href !== "/" && (path === href || path.startsWith(`${href}/`)))
  ) {
    link.classList.add("active-nav");
    link.setAttribute("aria-current", "page");
  }
});

let currentItemIndex = -1;
const navigableItems = document.querySelectorAll(
  ".blog-post a, .project-item a",
);
const resetNavigableItems = () => {
  navigableItems.forEach((item) => item.classList.remove("keyboard-active"));
  currentItemIndex = -1;
};

if (navigableItems.length > 0) {
  document.addEventListener("keydown", (event) => {
    if (isEditable(event.target)) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      navigableItems.forEach((item) =>
        item.classList.remove("keyboard-active"),
      );
      const direction = event.key === "ArrowUp" ? -1 : 1;
      currentItemIndex =
        (currentItemIndex + direction + navigableItems.length) %
        navigableItems.length;
      const item = navigableItems[currentItemIndex];
      item.classList.add("keyboard-active");
      item.focus();
      item.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (
      event.key === "Enter" &&
      currentItemIndex >= 0 &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      navigableItems[currentItemIndex].click();
    }
  });
  document.addEventListener("click", resetNavigableItems);
}

const crtOverlay = document.getElementById("crt-overlay");
const crtToggle = document.getElementById("crt-toggle");
const crtStatus = document.getElementById("crt-status");
const setCrt = (enabled) => {
  crtOverlay.hidden = !enabled;
  crtStatus.textContent = enabled ? "[on]" : "[off]";
  crtStatus.style.color = enabled
    ? "var(--color-terminal-accent)"
    : "var(--color-terminal-fg)";
  crtToggle.setAttribute("aria-pressed", String(enabled));
};

setCrt(localStorage.getItem("crt-enabled") !== "false");
crtToggle.addEventListener("click", () => {
  const enabled = crtToggle.getAttribute("aria-pressed") !== "true";
  setCrt(enabled);
  localStorage.setItem("crt-enabled", String(enabled));
});
