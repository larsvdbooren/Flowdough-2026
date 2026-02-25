// Page Load
// Optional: Always reset scroll to top on page load
window.scrollTo(0, 0);

// Prevent scrolling during page load
document.body.style.overflow = "hidden";
if (window.lenis) {
  window.lenis.destroy();
}

// Initialize lenis but don't start it yet
const lenis = new Lenis();
window.lenis = lenis;

// Selectors
const items = document.querySelectorAll(".page-load_img-item");
const logoWrap = document.querySelector(".page-load_logo-w");
const revealElements = document.querySelectorAll("[page-load-element]");

// Prepare initial transforms/opacity
gsap.set(".page-load-w", { opacity: 1 });
gsap.set(items, { scale: 0, opacity: 1 }); // Show loader, hide items
gsap.set(revealElements, { opacity: 0, y: "-1em" });
gsap.set(".page-load_btn-w", { opacity: 0 });
gsap.set(logoWrap, { opacity: 0, gap: "30em" });

// Random rotation logic (unchanged)
const startRotations = [];
const endRotations = [];
const imgRotations = [];
const minDifference = 5;
let lastRotation = gsap.utils.random(-15, 15);
let newRotation;

items.forEach(() => {
  startRotations.push(lastRotation);
  do {
    newRotation = gsap.utils.random(-15, 15);
  } while (Math.abs(newRotation - lastRotation) < minDifference);
  endRotations.push(newRotation);
  imgRotations.push(gsap.utils.random(-8, 8));
  lastRotation = newRotation;
});

// Timings
const baseDelay = 0.25;
const baseDuration = 0.5;
const lastIndex = items.length - 1;
const finalStartTime = baseDelay * lastIndex;
const logoStartTime = finalStartTime + baseDuration - 0.5;

// Animate loader items in
items.forEach((item, i) => {
  const innerImg = item.querySelector(".pageload_img");
  if (!innerImg) return;

  // Set innerImg start state
  gsap.set(innerImg, { scale: 1, rotation: imgRotations[i] });

  const tl = gsap.timeline({
    delay: baseDelay * i,
    defaults: { duration: baseDuration, ease: "flowEase" },
  });
  tl.to(item, { scale: 1, rotation: endRotations[i] }, 0);
  tl.to(innerImg, { scale: 1.1, rotation: 0 }, 0);
  tl.to(".page-load_btn-w", { opacity: 1 }, 0);
});

// Animate logo & reveal
if (logoWrap) {
  gsap.to(logoWrap, {
    opacity: 1,
    gap: "15em",
    duration: 0.8,
    ease: "flowEase",
    delay: logoStartTime,
    onComplete: () => {
      const tl = gsap.timeline({ defaults: { ease: "flowEase" } });
      tl.to(logoWrap, { gap: "0.25em", duration: 0.6 }, 0);
      tl.to(
        ".page-load_svg.is-flow",
        {
          width: "17.05124em",
          marginLeft: "0em",
          duration: 0.6,
        },
        0,
      );
      tl.to(
        ".page-load_svg.is-dough",
        { width: "23.50163em", duration: 0.8 },
        "<",
      );
      tl.to(items, { scale: 1.3, duration: 0.6 }, 0);
      tl.to(
        revealElements,
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
        "-=0.2",
      );

      // Final cleanup
      items.forEach((item) => {
        const img = item.querySelector(".pageload_img");
        if (img) img.draggable = false;
        item.style.willChange = "transform";
        item.style.transformStyle = "preserve-3d";
      });

      // Enable Draggable with optimized settings
      Draggable.create(".page-load_img-item", {
        type: "x,y",
        edgeResistance: 0.65,
        inertia: true,
        bounds: window,
        // Set will-change for better performance
        onPress() {
          const target = this.target;
          target.style.willChange = "transform";
          if (window.showCursor) window.showCursor("grab");
        },
        onDrag() {
          const e = this.pointerEvent || this.event;
          if (e && window.updateCursorPosition) {
            window.updateCursorPosition(e.clientX, e.clientY);
          }
        },
        onRelease() {
          const target = this.target;
          if (window.showCursor) window.showCursor("hover");
          // Remove will-change after animation
          setTimeout(() => {
            target.style.willChange = "auto";
          }, 100);
        },
      });

      // Remove loading state & enable scroll
      document.body.classList.remove("page-loading");
      document.body.style.overflow = "";

      // Re-enable scrolling with Lenis
      if (window.lenis) {
        // Re-initialize Lenis scroll
        window.lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
          window.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      }
    },
  });
}

// Cursor function (unchanged, but moved inside DOMContentLoaded for safety)
initDynamicCustomTextCursor();

// Your initDynamicCustomTextCursor function here...
function initDynamicCustomTextCursor() {
  let cursorItem = document.querySelector(".cursor");
  let cursorParagraph = cursorItem.querySelector("p");
  let targets = document.querySelectorAll("[data-cursor]");
  let xOffset = 6;
  let yOffset = 10;
  let cursorIsOnRight = false;
  let currentTarget = null;
  let lastText = "";
  window.updateCursorPosition = (x, y) => {
    xTo(x);
    yTo(y - window.scrollY); // Maintain scroll awareness
  };

  // Position cursor relative to actual cursor position on page load
  gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

  // Use GSAP quick.to for a more performative tween on the cursor
  let xTo = gsap.quickTo(cursorItem, "x", {
    duration: 0.25,
    ease: "power2.out",
  });
  let yTo = gsap.quickTo(cursorItem, "y", {
    duration: 0.25,
    ease: "power2.out",
  });

  // Function to get the width of the cursor element including a buffer
  const getCursorEdgeThreshold = () => {
    return cursorItem.offsetWidth + 16; // Cursor width + 16px margin
  };

  // On mousemove, call the quickTo functions to the actual cursor position
  window.addEventListener("mousemove", (e) => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scrollY = window.scrollY;
    let cursorX = e.clientX;
    let cursorY = e.clientY + scrollY; // Adjust cursorY to account for scroll

    // Default offsets
    let xPercent = xOffset;
    let yPercent = yOffset;

    // Adjust X offset dynamically based on cursor width
    let cursorEdgeThreshold = getCursorEdgeThreshold();
    if (cursorX > windowWidth - cursorEdgeThreshold) {
      cursorIsOnRight = true;
      xPercent = -100;
    } else {
      cursorIsOnRight = false;
    }

    // Adjust Y offset if in the bottom 10% of the current viewport
    if (cursorY > scrollY + windowHeight * 0.9) {
      yPercent = -120;
    }

    if (currentTarget) {
      let newText = currentTarget.getAttribute("data-cursor");
      if (newText !== lastText) {
        // Only update if the text is different
        cursorParagraph.innerHTML = newText;
        lastText = newText;

        // Recalculate edge awareness whenever the text changes
        cursorEdgeThreshold = getCursorEdgeThreshold();
      }
    }

    gsap.to(cursorItem, {
      xPercent: xPercent,
      yPercent: yPercent,
      duration: 0.5,
      ease: "power.1",
    });
    xTo(cursorX);
    yTo(cursorY - scrollY);
  });

  // Add a mouse enter listener for each link that has a data-cursor attribute
  targets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      currentTarget = target; // Set the current target

      let newText = target.getAttribute("data-cursor");

      // Update only if the text changes
      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;

        // Recalculate edge awareness whenever the text changes
        let cursorEdgeThreshold = getCursorEdgeThreshold();
      }
    });
  });
}

initDynamicCustomTextCursor();

// Custom-Gif
const triggers = document.querySelectorAll("[custom-gif]");

triggers.forEach((trigger) => {
  const gifName = trigger.getAttribute("custom-gif");

  if (!gifName) return; // skip if no gif name

  const selector = `.about-img.${CSS.escape(gifName)}`;

  trigger.addEventListener("mouseenter", () => {
    const targetImg = document.querySelector(selector);
    if (targetImg) {
      gsap.to(targetImg, { y: "0%", duration: 0.5, ease: "flowEase" });
    }
  });

  trigger.addEventListener("mouseleave", () => {
    const targetImg = document.querySelector(selector);
    if (targetImg) {
      gsap.to(targetImg, { y: "100%", duration: 0.5, ease: "flowEase" });
    }
  });
});

// Global
/////////////////////////////////////////////////////////////* Footer animation */
let wheel = 0;
let total = 0;
let xTo;

document.fonts.ready.then(() => {
  const content = document.querySelector(".marquee-container");
  const half = document.querySelector(".phrase").clientWidth;

  const wrap = gsap.utils.wrap(-half, 0);
  xTo = gsap.quickTo(content, "x", {
    duration: 0.5,
    ease: "power3", // Non-linear
    modifiers: {
      x: gsap.utils.unitize(wrap),
    },
  });

  gsap.ticker.add(tick);
});

let isWheeling;
window.addEventListener(
  "wheel",
  (e) => {
    wheel = e.deltaY;

    window.clearTimeout(isWheeling); // setTimeout is cancelled
    isWheeling = setTimeout(() => {
      wheel = 0; // Force a reset of the wheel value if we dont enter the event after 66ms
    }, 20);
  },
  { passive: true },
);

function tick(time, dt) {
  total -= wheel + dt / 20;
  xTo(total);
}

/////////////////////////////////////////////////////////////* Staggering Button */
function initButtonCharacterStagger() {
  const offsetIncrement = 0.01; // seconds
  const buttons = document.querySelectorAll("[data-button-animate-chars]");

  buttons.forEach((button) => {
    const text = button.textContent;
    button.innerHTML = "";

    const characters = [...text];
    const indices = characters.map((_, i) => i);

    // Shuffle the indices array using Fisher-Yates
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    characters.forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;

      const delayIndex = indices[i]; // Randomized order
      span.style.transitionDelay = `${delayIndex * offsetIncrement}s`;

      if (char === " ") {
        span.style.whiteSpace = "pre";
      }

      button.appendChild(span);
    });
  });
}

// Initialize Button Character Stagger Animation
initButtonCharacterStagger();

/////////////////////////////////////////////////////////////* Dynamic month and year for availability */
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

const nextMonthText = `${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;

const target = document.querySelector(".next-month-text");
if (target) {
  target.textContent = nextMonthText;
}

// Project list
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

// Testimonials
const container = document.querySelector(".testimonial_c-l-w .testimonial_c-w");
const containerW = container.clientWidth;

const cards = document.querySelectorAll(".testimonial_c-item");
const cardsLength = cards.length;

const cardContent = document.querySelectorAll(
  ".testimonial_c-item .testimonial_content",
);

let currentPortion = 0; // No portion hovered at the start

cards.forEach((card) => {
  gsap.set(card, {
    xPercent: (Math.random() - 0.5) * 10,
    yPercent: (Math.random() - 0.5) * 10,
    rotation: (Math.random() - 0.5) * 20,
  });
});

container.addEventListener("mousemove", (e) => {
  // Cursor position relative to the left edge of the container
  const mouseX = e.clientX - container.getBoundingClientRect().left;
  // Cursor’s horizontal percentage within the container
  const percentage = mouseX / containerW;
  // Round the value up to get a valid index
  const activePortion = Math.ceil(percentage * cardsLength);

  // If a new portion is hovered
  if (
    currentPortion !== activePortion &&
    activePortion > 0 &&
    activePortion <= cardsLength
  ) {
    // If a portion was already hovered, reset it
    // -1 to target the correct index in the card set
    if (currentPortion !== 0) {
      resetPortion(currentPortion - 1);
    }

    // Update the index of the new portion
    currentPortion = activePortion;
    // -1 to target the correct index in the card set
    newPortion(currentPortion - 1);
  }
});

container.addEventListener("mouseleave", () => {
  // -1 to target the correct index in the card set
  resetPortion(currentPortion - 1);
  // No portion is hovered anymore
  currentPortion = 0;

  // Recenter all direct child elements of the cards
  gsap.to(cardContent, {
    xPercent: 0,
    ease: "elastic.out(1, 0.75)",
    duration: 0.8,
  });
});

function resetPortion(index) {
  if (!cards[index]) return; // exit if index is invalid

  gsap.to(cards[index], {
    xPercent: (Math.random() - 0.5) * 10,
    yPercent: (Math.random() - 0.5) * 10,
    rotation: (Math.random() - 0.5) * 20,
    scale: 1,
    duration: 0.8,
    ease: "elastic.out(1, 0.75)",
  });
}

function newPortion(i) {
  gsap.to(cards[i], {
    // Reset transformation attributes
    xPercent: 0,
    yPercent: 0,
    rotation: 0,
    duration: 0.8,
    scale: 1.1,
    ease: "elastic.out(1, 0.75)", // Elastic movement at the end (out)
  });

  // For each card's child element
  cardContent.forEach((cardContent, index) => {
    // If it's not the active card
    if (index !== i) {
      gsap.to(cardContent, {
        // When index - i < 0, push left
        // When index - i > 0, push right
        // The further (index - i) moves from 0 in both ways, the smaller the displacement
        xPercent: 65 / (index - i),
        ease: "elastic.out(1, 0.75)",
        duration: 0.8,
      });
      // If it is the active card
    } else {
      // Center its child
      gsap.to(cardContent, {
        xPercent: 0,
        ease: "elastic.out(1, 0.75)",
        duration: 0.8,
      });
    }
  });
}
