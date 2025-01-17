"use strict";

import Ajv from "ajv";
const ajv = new Ajv();

// get all section.section-with-image
const sections = document.querySelectorAll("section.section-with-image");
const main = document.querySelector("main");

// api endpoint url
const endpoint = "https://jsonplaceholder.typicode.com/users";

const dataIsValid = (data) => {
  if (!Array.isArray(data)) return false;

  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      address: {
        type: "object",
        properties: {
          street: { type: "string" },
          suite: { type: "string" },
          city: { type: "string" },
        },
        required: ["street", "suite", "city"],
      },
      phone: { type: "string" },
      company: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
    },
    required: ["name", "email", "address", "phone", "company"],
    additionalProperties: true,
  };
  const validate = ajv.compile(schema);
  const resultOfValidationEachItem = data.map((item) => validate(item));

  if (resultOfValidationEachItem.some((item) => item === false)) return false;
  return true;
};

// crete modal element and return it
const createModal = async (counter, sectionId) => {
  const modal = document.createElement("aside");
  modal.classList.value = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", `${sectionId}-title`);
  modal.setAttribute("aria-describedby", `${sectionId}-describe`);
  modal.setAttribute("aria-modal", "true");

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
  modalCloseIcon.setAttribute("aria-hidden", "true");

  // aside.modal > section.header.modal__content > h3.modal__title
  const modalTitle = document.createElement("h2");
  modalTitle.classList.value = "modal__title";
  modalTitle.innerText = "Alert";
  modalTitle.setAttribute("id", `${sectionId}-title`);

  // aside.modal > section.header.modal__content > p
  const modalInformation = document.createElement("p");
  modalInformation.innerHTML = `You have clicked <strong>${counter.value} times</strong> to related button.`;
  modalInformation.setAttribute("id", `${sectionId}-describe`);

  // append icon to close button
  modalButtonClose.appendChild(modalCloseIcon);

  // appending elements to modal
  modalSection.appendChild(modalButtonClose);
  modalSection.appendChild(modalTitle);
  modalSection.appendChild(modalInformation);

  if (counter.value > 5) {
    //aside.modal > section.header.modal__content > button.button[data-name="resetCounter"]
    const modalButtonReset = document.createElement("button");
    modalButtonReset.classList.value = "button button--red";
    modalButtonReset.dataset.name = "resetButton";
    modalButtonReset.innerHTML = "Reset counter";

    modalSection.appendChild(modalButtonReset);
  }

  const loader = createLoader();
  document.body.appendChild(loader);

  try {
    const data = await getData(endpoint);

    if (!dataIsValid(data)) throw Error("Recieved data is invalid");

    const tableWithData = createTable(data);
    modalSection.appendChild(tableWithData);
  } catch (error) {
    const tableError = document.createElement("p");
    tableError.classList.add("error");
    tableError.innerText = `data loading error`;
    console.log(error);
    modalSection.appendChild(tableError);
  }

  document.body.removeChild(loader);
  modal.appendChild(modalSection);

  return modal;
};

const handleCloseModal = ({ target }, modal) => {
  const closeButton = modal.querySelector('[data-name="closeButton"]');
  if (closeButton.contains(target) || target === modal) {
    removeModal(modal);
  }
};

const handleEscapeKeyPress = ({ key }) => {
  if (key === "Escape") {
    removeModal(document.querySelector('[role="dialog"]'));
  }
};

const removeModal = (modal) => {
  modal.remove();
  window.removeEventListener("keydown", handleEscapeKeyPress);
  main.removeAttribute("inert");
  document.body.classList.remove("overflow-hidden");
};

const getCounter = (id) => {
  if (localStorage.getItem(id)) {
    return { id: id, value: parseInt(localStorage.getItem(id)) };
  } else {
    return { id: id, value: 0 };
  }
};

const incrementCounter = ({ id, value }) => {
  localStorage.setItem(id, value + 1);
};

const resetCounter = (id) => {
  localStorage.setItem(id, 0);
};

const openModal = async (section, sectionId, increment = true) => {
  // remove active modals
  const activeModals = document.querySelectorAll('[role="dialog"]');
  if (activeModals) activeModals.forEach((item) => removeModal(item));

  // increment coounter if it is necessary
  if (increment) incrementCounter(getCounter(sectionId));

  // create modal, append it to section and set focus to modal
  const modal = await createModal(getCounter(sectionId), sectionId);
  document.body.appendChild(modal);
  modal.querySelector("button").focus();

  // add handle close modal by clicking
  modal.addEventListener("click", (event) => handleCloseModal(event, modal));
  // add handle close modal by escape key press
  window.addEventListener("keydown", handleEscapeKeyPress);

  // add actions after click resetButton in modal
  modal.addEventListener("click", ({ target }) => {
    const resetButton = modal.querySelector('[data-name="resetButton"]');
    if (target === resetButton) {
      resetCounter(sectionId);
      removeModal(modal);
      openModal(section, sectionId, false);
    }
  });

  // trap focus in opened modal
  main.setAttribute("inert", "true");
  document.body.classList.add("overflow-hidden");
};

const initModals = (sections) => {
  // for each section
  sections.forEach((section, i) => {
    // add unique sectionId
    const sectionId = `swi${i}`;
    section.dataset.name = sectionId;

    // add click handle function to opener button which open modal
    const openButton = section.querySelector('[data-name="openButton"]');
    openButton.addEventListener("click", () => openModal(section, sectionId));
  });
};

const createTable = (data) => {
  const tableWrapper = document.createElement("div");
  tableWrapper.classList.value = "modal__table-wrapper";
  const table = document.createElement("table");
  const heading = document.createElement("tr");
  const headingHTML =
    "<td>imie i nazwisko</td><td>email</td><td>adres</td><td>telefon</td><td>nazwa firmy</td>";
  heading.innerHTML = headingHTML;
  table.appendChild(heading);

  const createRow = (item) => {
    const tr = document.createElement("tr");

    const data = [
      item.name,
      item.email,
      item.address.city +
        ", " +
        item.address.street +
        ", " +
        item.address.suite,
      item.phone,
      item.company.name,
    ];

    data.forEach((i) => {
      const td = document.createElement("td");
      td.innerText = i;
      tr.appendChild(td);
    });

    return tr;
  };

  data.forEach((item) => {
    table.appendChild(createRow(item));
  });

  tableWrapper.appendChild(table);

  return tableWrapper;
};

const getData = async (url) => {
  return fetch(url).then((response) => response.json());
  // .catch((error) => error);
};

const createLoader = () => {
  const loader = document.createElement("div");
  loader.classList.value = "loader";
  loader.setAttribute("aria-hidden", "true");

  const spinner = document.createElement("span");
  spinner.classList.value = "loader__spinner";
  spinner.innerText = "ładowanie danych";

  loader.appendChild(spinner);

  return loader;
};

initModals(sections);
