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
