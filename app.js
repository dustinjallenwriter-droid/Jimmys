// Hamburger Menu Toggle (available globally)
function toggleMenu() {
  const x = document.getElementById("myLinks");
  if (x) {
    x.style.display = x.style.display === "block" ? "none" : "block";
  }
}
window.toggleMenu = toggleMenu;

document.addEventListener("DOMContentLoaded", () => {
  // ---- DRAGGABLE, FOOTER-AWARE, RAIL-CONFINED BACK TO TOP BUTTON ----
  const myBtn = document.getElementById("myBtn");
  const dragBar = document.getElementById("drag-indicator");
  const dragTrack = document.getElementById("drag-track");
  const dragLine = document.querySelector(".drag-line");
  let isDragging = false;
  let startX = 0;
  let btnStartLeft = 0;

  // --- Helper: Bounds of the drag rail, in viewport coordinates ---
  function getRailBounds() {
    const lineRect = dragLine.getBoundingClientRect();
    return { left: lineRect.left, width: lineRect.width };
  }

  // --- Clamp the button to the confines of the rail ---
  function clampToRail(leftPx) {
    const { left, width } = getRailBounds();
    const min = left;
    const max = left + width - myBtn.offsetWidth;
    return Math.max(min, Math.min(leftPx, max));
  }

  // --- Restore position if saved (and clamp to the rail) ---
  const savedLeft = localStorage.getItem("myBtnLeft");
  if (savedLeft !== null && myBtn && dragLine) {
    myBtn.style.right = "auto";
    let clamped = clampToRail(parseInt(savedLeft, 10));
    myBtn.style.left = clamped + "px";
  }

  // --- Drag Events ---
  function dragStart(e) {
    isDragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    btnStartLeft = myBtn.getBoundingClientRect().left;
    myBtn.style.right = "auto";
    myBtn.style.cursor = "grabbing";
    if (dragBar) dragBar.classList.add('visible');
    document.body.style.userSelect = "none";
  }
  function dragMove(e) {
    if (!isDragging) return;
    const currX = e.touches ? e.touches[0].clientX : e.clientX;
    let newLeft = btnStartLeft + (currX - startX);
    newLeft = clampToRail(newLeft);
    myBtn.style.left = newLeft + "px";
    e.preventDefault();
  }
  function dragEnd() {
    if (isDragging) {
      localStorage.setItem("myBtnLeft", parseInt(myBtn.style.left, 10));
      if (dragBar) dragBar.classList.remove('visible');
    }
    isDragging = false;
    myBtn.style.cursor = "grab";
    document.body.style.userSelect = "";
  }

  if (myBtn && dragLine) {
    // Touch and mouse events
    myBtn.addEventListener("touchstart", dragStart, { passive: false });
    window.addEventListener("touchmove", dragMove, { passive: false });
    window.addEventListener("touchend", dragEnd, { passive: true });
    myBtn.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", dragEnd);

    // Show drag bar for new users if no savedLeft
    if (!savedLeft && dragBar) {
      dragBar.classList.add('visible');
      setTimeout(() => { dragBar.classList.remove('visible'); }, 2200);
    }
    // Clamp to rail after resize (responsive)
    window.addEventListener("resize", () => {
      let curLeft = parseInt(myBtn.style.left, 10);
      if (isNaN(curLeft)) curLeft = getRailBounds().left;
      myBtn.style.left = clampToRail(curLeft) + "px";
    });
  }

  // ---- Always show button & drag track (for all devices) ----
  function updateButtonVisibility() {
    if (myBtn) myBtn.style.display = "block";
    if (dragTrack) dragTrack.style.display = "flex";
  }
  window.addEventListener("scroll", updateButtonVisibility);
  window.addEventListener("resize", updateButtonVisibility);
  updateButtonVisibility();

  // ---- Keep dragTrack and button above the footer ----
  function adjustBtnAndRail() {
    const footer = document.querySelector('footer');
    if (!footer || !dragTrack || !myBtn) return;

    const windowHeight = window.innerHeight;
    const footerRect = footer.getBoundingClientRect();
    const buffer = 10; // px between the rail/button and the footer

    if (footerRect.top < windowHeight) {
      // Footer is in viewport, move the UI up to just above it
      const pushUp = windowHeight - footerRect.top + buffer;
      dragTrack.style.bottom = `${pushUp}px`;
      myBtn.style.bottom = `${pushUp}px`;
    } else {
      dragTrack.style.bottom = '30px';
      myBtn.style.bottom = '30px';
    }
  }
  window.addEventListener("scroll", adjustBtnAndRail);
  window.addEventListener("resize", adjustBtnAndRail);
  document.addEventListener("DOMContentLoaded", adjustBtnAndRail);

  // ---- On click: scroll to top smoothly ----
  if (myBtn) {
    myBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---- Smooth Scroll to Center of Element ----
  function scrollToCenter(id) {
    const element = document.getElementById(id);
    if (element) {
      const offset = element.getBoundingClientRect().top + window.scrollY;
      const center = offset - window.innerHeight / 2 + element.offsetHeight / 2;
      window.scrollTo({ top: center, behavior: "smooth" });
    }
  }
  window.scrollToCenter = scrollToCenter;

  // ---- CTA Tile Hover/Tap Logic ----
  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  if (isMobile) {
    const mobileTiles = document.querySelectorAll(".tile");
    mobileTiles.forEach((tile) => {
      tile.addEventListener("click", function () {
        const cta = this.querySelector(".cta-text");
        const isVisible = cta && cta.style.display === "block";
        document.querySelectorAll(".cta-text").forEach(el => { el.style.display = "none"; });
        if (cta) {
          if (!isVisible) {
            cta.style.display = "block";
          } else {
            const link = this.dataset.link;
            if (link) window.location.href = link;
          }
        }
      });
    });
  } else {
    const desktopTiles = document.querySelectorAll(".tile");
    desktopTiles.forEach(tile => {
      tile.addEventListener("mouseenter", function () {
        const cta = this.querySelector(".cta-text");
        if (cta) cta.style.display = "block";
      });
      tile.addEventListener("mouseleave", function () {
        const cta = this.querySelector(".cta-text");
        if (cta) cta.style.display = "none";
      });
      tile.addEventListener("click", function (e) {
        const link = this.dataset.link;
        const isAnchor = e.target.closest("a");
        if (!isAnchor && link) window.location.href = link;
      });
    });
  }

  // ---- HORIZONTAL DRAG SCROLL LOGIC (for .scroll-strip) ----
  const scrollStrip = document.querySelector(".scroll-strip");
  if (scrollStrip) {
    let isDown = false;
    let startX;
    let scrollLeft;
    scrollStrip.addEventListener("mousedown", (e) => {
      isDown = true;
      scrollStrip.classList.add("dragging");
      startX = e.pageX - scrollStrip.offsetLeft;
      scrollLeft = scrollStrip.scrollLeft;
    });
    scrollStrip.addEventListener("mouseleave", () => {
      isDown = false;
      scrollStrip.classList.remove("dragging");
    });
    scrollStrip.addEventListener("mouseup", () => {
      isDown = false;
      scrollStrip.classList.remove("dragging");
    });
    scrollStrip.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollStrip.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollStrip.scrollLeft = scrollLeft - walk;
    });
  }
});
