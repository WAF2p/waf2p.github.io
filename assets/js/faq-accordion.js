// FAQ accordion: only one open at a time (classic accordion behavior)
(function () {
  function boot() {
    const items = Array.from(document.querySelectorAll(".faq-accordion .faq-item"));
    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();