"use strict";

// all section occuring in html
const sections = document.querySelectorAll("section.section-with-image");

const createModal = (section, counter) => {
  // aside.modal
  const modal = document.createElement("aside");
  modal.classList.value = "modal";
  modal.setAttribute("role", "dialog");

  // aside.modal > section.header.modal__content
  const modalSection = document.createElement("section");
  modalSection.classList.value = "header modal__content";

  // aside.modal > section.header.modal__content > button.modal__close
  const modalButtonClose = document.createElement("button");
  modalButtonClose.classList.value = "modal__close";
  modalButtonClose.dataset.name = "closeButton";
  modalButtonClose.ariaLabel = "Zamknij popup";

  // aside.modal > section.header.modal__content > button.modal__close > span.modal__close__icon
  const modalCloseIcon = document.createElement("span");
  modalCloseIcon.classList.value = "modal__close__icon";

  // aside.modal > section.header.modal__content > h3.modal__title
  const modalTitle = document.createElement("h3");
  modalTitle.classList.value = "modal__title";
  modalTitle.innerText = "Alert";

  // aside.modal > section.header.modal__content > p
  const modalInformation = document.createElement("p");
  modalInformation.innerHTML = `You have clicked <strong>${counter.value} times</strong> to related button.`;

  // append icon to close button
  modalButtonClose.appendChild(modalCloseIcon);

  // appending elements to modal
  modalSection.appendChild(modalButtonClose);
  modalSection.appendChild(modalTitle);
  modalSection.appendChild(modalInformation);

  if (counter.value > 5) {
    //aside.modal > section.header.modal__content > button.button[data-name="resetCounter"]
    const modalButtonReset = document.createElement("button");
    modalButtonReset.classList.value = "button";
    modalButtonReset.dataset.name = "resetButton";
    modalButtonReset.innerHTML = "Resetuj licznik";

    modalSection.appendChild(modalButtonReset);
  }

  // append modal to section
  modal.appendChild(modalSection);
  section.appendChild(modal);

  return modal;
};

const getCounter = (sectionId) => {
  if (localStorage.getItem(sectionId)) {
    return { id: sectionId, value: parseInt(localStorage.getItem(sectionId)) };
  } else {
    return { id: sectionId, value: 0 };
  }
};

const incrementCounter = ({ id, value }) => {
  localStorage.setItem(id, value + 1);
};

const resetCounter = (id) => {
  localStorage.setItem(id, 0);
};

const handleClose = ({ target }, modal) => {
  const closeButton = modal.querySelector('[data-name="closeButton"]');

  if (target === modal || target === closeButton) {
    modal.remove();
  } else {
    do {
      if (target === closeButton) {
        modal.remove();
        return;
      }
      target = target.parentNode;
    } while (target != null);
  }
};

const handleOpen = (section, sectionId, noIncrement = false) => {
  // increment counter
  if (!noIncrement) incrementCounter(getCounter(sectionId));

  // create modal
  const modal = createModal(section, getCounter(sectionId));

  // set focus to freshly created modal
  modal.focus();

  // add closing function
  modal.addEventListener("click", (e) => handleClose(e, modal));

  // add reset counter function
  modal.addEventListener("click", ({ target }) => {
    if (target === modal.querySelector('[data-name="resetButton"]')) {
      resetCounter(sectionId);
      modal.remove();
      handleOpen(section, sectionId, true);
    }
  });
};

// For each section-with-image module ...
sections.forEach((section, i) => {
  // add unique id,
  const sectionId = `swi${i}`;
  section.dataset.name = sectionId;

  // and add opening funciton
  const openButton = section.querySelector('[data-name="openButton"]');
  openButton.addEventListener("click", () => {
    handleOpen(section, sectionId);
  });
});
