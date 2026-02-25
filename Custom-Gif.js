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
