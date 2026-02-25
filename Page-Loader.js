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
