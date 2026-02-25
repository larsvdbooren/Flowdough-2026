gsap.registerPlugin(ScrollTrigger);

const root = document.querySelector(".projects_c-l-w");
const list = root && root.querySelector(".projects_c-l");
const rows = list ? list.querySelectorAll(".projects_link") : [];
const mediaContainer = document.querySelector(".media-container");

if (!root || !list || !mediaContainer) {
  console.warn("Hover-media setup: missing elements");
} else {
  // --- Helper: Highlight Active Row (Mobile Only Use) ---
  const highlightRow = (targetRow) => {
    list.classList.add("has-active");
    rows.forEach((r) => r.classList.remove("is-active"));
    targetRow.classList.add("is-active");
  };

  const clearHighlights = () => {
    list.classList.remove("has-active");
    rows.forEach((r) => r.classList.remove("is-active"));
  };

  // --- Shared Animation Function ---
  const updateSlide = (row) => {
    const imgEl = row.querySelector(".thumbnail-image");
    if (!imgEl) return;
    const url = imgEl.src;

    const div = document.createElement("div");
    const img = document.createElement("img");
    img.src = url;
    div.appendChild(img);
    mediaContainer.appendChild(div);

    gsap.set(div, { y: "-100%" });
    gsap.set(img, { y: "0%" });
    gsap.to([div, img], {
      y: 0,
      duration: 0.45,
      ease: "power3.out",
    });

    if (mediaContainer.children.length > 5) {
      mediaContainer.children[0].remove();
    }
  };

  let mm = gsap.matchMedia();

  // --- DESKTOP (Hover) ---
  // NO highlighting logic here
  mm.add("(min-width: 800px)", () => {
    gsap.set(mediaContainer, { yPercent: -50, xPercent: 0, autoAlpha: 0 });

    let lastCursorY = window.innerHeight / 2;
    const yTo = gsap.quickTo(mediaContainer, "y", {
      duration: 0.5,
      ease: "power4",
    });

    const moveFunc = (e) => {
      lastCursorY = e.clientY;
      if (mediaContainer.classList.contains("on")) yTo(lastCursorY);
    };
    window.addEventListener("mousemove", moveFunc);

    const enterList = () => {
      mediaContainer.classList.add("on");
      gsap.set(mediaContainer, { y: lastCursorY });
      gsap.to(mediaContainer, { autoAlpha: 1, duration: 0.3 });
    };

    const leaveList = () => {
      gsap.to(mediaContainer, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => {
          mediaContainer.classList.remove("on");
          mediaContainer.innerHTML = "";
        },
      });
    };

    list.addEventListener("mouseenter", enterList);
    list.addEventListener("mouseleave", leaveList);

    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        updateSlide(row);
        // highlightRow(row); <-- REMOVED for Desktop
      });
    });

    return () => {
      window.removeEventListener("mousemove", moveFunc);
      list.removeEventListener("mouseenter", enterList);
      list.removeEventListener("mouseleave", leaveList);
    };
  });

  // --- MOBILE (Scroll) ---
  // Highlighting logic INCLUDED here
  mm.add("(max-width: 799px)", () => {
    gsap.set(mediaContainer, {
      top: "50%",
      left: "auto",
      right: "1em",
      xPercent: -0,
      yPercent: -50,
      y: 0,
      autoAlpha: 0,
      bordrRadius: "1em",
    });

    // List Trigger
    ScrollTrigger.create({
      trigger: list,
      start: "top center",
      end: "bottom center",
      onEnter: () => gsap.to(mediaContainer, { autoAlpha: 1 }),
      onLeave: () => {
        gsap.to(mediaContainer, { autoAlpha: 0 });
        clearHighlights(); // Reset opacity
      },
      onEnterBack: () => gsap.to(mediaContainer, { autoAlpha: 1 }),
      onLeaveBack: () => {
        gsap.to(mediaContainer, { autoAlpha: 0 });
        clearHighlights(); // Reset opacity
      },
    });

    // Row Triggers
    rows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          updateSlide(row);
          highlightRow(row); // Active
        },
        onEnterBack: () => {
          updateSlide(row);
          highlightRow(row); // Active
        },
      });
    });
  });
}
