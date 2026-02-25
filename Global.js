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
