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
  modalButtonClose.ariaLabel = "Close popup";

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
    modalButtonReset.innerHTML = "Reset counter";

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
    closeModal(modal);
  } else {
    do {
      if (target === closeButton) {
        closeModal(modal);
        return;
      }
      target = target.parentNode;
    } while (target != null);
  }
};

const closeModal = (modal) => {
  modal.remove();
  window.removeEventListener("keydown", handleEscapeKeyPress, true);
};

const handleEscapeKeyPress = ({ key }) => {
  if (key === "Escape") {
    closeModal(document.querySelector('[role="dialog"]'));
  }
};

const handleOpen = (section, sectionId, noIncrement = false) => {
  // prevent to open multiple modals in the same time, and keep only the freshest
  const activeModals = document.querySelectorAll('[role="dialog"]');
  if (activeModals) activeModals.forEach((item) => closeModal(item));

  // increment counter
  if (!noIncrement) incrementCounter(getCounter(sectionId));

  // create modal
  const modal = createModal(section, getCounter(sectionId));

  // set focus to freshly created modal
  modal.focus();

  // add closing function
  modal.addEventListener("click", (e) => handleClose(e, modal));
  window.addEventListener("keydown", handleEscapeKeyPress, true);

  // add reset counter function
  modal.addEventListener("click", ({ target }) => {
    if (target === modal.querySelector('[data-name="resetButton"]')) {
      resetCounter(sectionId);
      closeModal(modal);
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
