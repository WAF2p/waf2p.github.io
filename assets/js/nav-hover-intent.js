/**
 * GitHub-level smooth dropdowns (hover-intent + sticky hover buffer)
 * - Adds .is-open on .nav-item.has-children
 * - Delayed close to avoid flicker
 * - Keeps open when moving between trigger and dropdown
 * - Supports keyboard (focus) and touch/click toggle
 */
(function () {
  const NAV_SELECTOR = ".main-nav";
  const ITEM_SELECTOR = ".nav-item.has-children";
  const OPEN_CLASS = "is-open";

  // Tunables
  const OPEN_DELAY_MS = 60;
  const CLOSE_DELAY_MS = 280;
  const LEAVE_SLOP_PX = 8;

  function withinRectSlop(x, y, rect, slop) {
    return (
      x >= rect.left - slop &&
      x <= rect.right + slop &&
      y >= rect.top - slop &&
      y <= rect.bottom + slop
    );
  }

  function setupNav(nav) {
    const items = Array.from(nav.querySelectorAll(ITEM_SELECTOR));
    if (!items.length) return;

    let activeItem = null;
    let lastPointer = { x: 0, y: 0 };

    nav.addEventListener("pointermove", (e) => {
      lastPointer = { x: e.clientX, y: e.clientY };
    });

    function openItem(item) {
      if (activeItem && activeItem !== item) {
        activeItem.classList.remove(OPEN_CLASS);
      }
      item.classList.add(OPEN_CLASS);
      activeItem = item;
    }

    function closeItem(item, immediate = false) {
      if (!item) return;
      const doClose = () => {
        item.classList.remove(OPEN_CLASS);
        if (activeItem === item) activeItem = null;
      };
      if (immediate) doClose();
      else item.__closeTimer = window.setTimeout(doClose, CLOSE_DELAY_MS);
    }

    function clearTimers(item) {
      if (item.__openTimer) {
        window.clearTimeout(item.__openTimer);
        item.__openTimer = null;
      }
      if (item.__closeTimer) {
        window.clearTimeout(item.__closeTimer);
        item.__closeTimer = null;
      }
    }

    items.forEach((item) => {
      const trigger = item.querySelector(":scope > a.nav-link");
      const dropdown = item.querySelector(":scope > .dropdown");
      if (!trigger || !dropdown) return;

      item.addEventListener("pointerenter", () => {
        clearTimers(item);
        item.__openTimer = window.setTimeout(() => openItem(item), OPEN_DELAY_MS);
      });

      item.addEventListener("pointerleave", () => {
        clearTimers(item);

        const trigRect = trigger.getBoundingClientRect();
        const dropRect = dropdown.getBoundingClientRect();
        const { x, y } = lastPointer;

        // tolerate tiny gaps
        if (
          withinRectSlop(x, y, trigRect, LEAVE_SLOP_PX) ||
          withinRectSlop(x, y, dropRect, LEAVE_SLOP_PX)
        ) {
          item.__closeTimer = window.setTimeout(() => {
            const nx = lastPointer.x, ny = lastPointer.y;
            const t2 = trigger.getBoundingClientRect();
            const d2 = dropdown.getBoundingClientRect();
            if (
              withinRectSlop(nx, ny, t2, LEAVE_SLOP_PX) ||
              withinRectSlop(nx, ny, d2, LEAVE_SLOP_PX)
            ) return;
            item.classList.remove(OPEN_CLASS);
            if (activeItem === item) activeItem = null;
          }, CLOSE_DELAY_MS);
          return;
        }

        closeItem(item, false);
      });

      // keyboard
      item.addEventListener("focusin", () => {
        clearTimers(item);
        openItem(item);
      });
      item.addEventListener("focusout", () => {
        clearTimers(item);
        closeItem(item, false);
      });

      // touch/click toggle
      trigger.addEventListener("click", (e) => {
        if (!item.classList.contains(OPEN_CLASS)) {
          e.preventDefault();
          clearTimers(item);
          openItem(item);
        }
      });
    });

    // Escape closes
    nav.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && activeItem) {
        e.preventDefault();
        activeItem.classList.remove(OPEN_CLASS);
        const trigger = activeItem.querySelector(":scope > a.nav-link");
        activeItem = null;
        if (trigger) trigger.focus();
      }
    });

    // click outside closes
    document.addEventListener("pointerdown", (e) => {
      if (!activeItem) return;
      if (!nav.contains(e.target)) {
        closeItem(activeItem, true);
      }
    });
  }

  function boot() {
    const nav = document.querySelector(NAV_SELECTOR);
    if (nav) setupNav(nav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();