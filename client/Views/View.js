import Constants from "../Constants.js";

/**
 * @module View
 *
 * Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 */
function View() {
  /**
   * List of stores
   * @constant
   * @type {HTMLUListElement}
   */
  const storesListBlock = document.querySelector(".stores-wrapper");

  /**
   * List of stores
   * @constant
   * @type {HTMLLIElement}
   */
  let prevSelectedStore;

  /**
   * Set stores into stores list.
   *
   * @param {object} storesList the object with stores.
   *
   * @return {View} self object.
   *
   * @public
   */
  this.setStoresList = function (storesList) {
    // const storesListBlock = document.querySelector(".stores-wrapper");
    storesListBlock.innerHTML = "";
    if (storesList.length > 0) {
      storesList.map((store) => {
        const storeItem = document.createElement("li");
        storeItem.classList.add("store-item", "pointer", "container");
        storeItem.setAttribute("key", store.id);
        storeItem.innerHTML = `<div class="store-item-info">
                <h2 class="store-item__headline-store">${store.Name}</h2>
                <div>
                      <h3 class="store-item__floor-area">${store.FloorArea}</h3>
                      <p class="store-item__footnote">sq.m</p>
                </div>
            </div>
            <p class="store-item__address">${store.Address}</p>`;
        storesListBlock.append(storeItem);
      });
    } else {
      const storeItem = document.createElement("li");
      storeItem.innerHTML = `<div class="store-item__not-result container">
        <h2 class="store-item__headline-store">No suitable stores</h2>
    </div>`;
      storesListBlock.append(storeItem);
    }
    return this;
  };

  /**
   * Returns stores list block.
   *
   * @return {HTMLUListElement} the ul element.
   *
   * @public
   */
  this.getStoresListBlock = function () {
    return document.querySelector(".stores-wrapper");
  };

  /**
   * Returns Search Stores Button.
   *
   * @return {HTMLButtonElement} the button element.
   *
   * @public
   */
  this.getSearchStoresBtn = function () {
    return document.querySelector(".js-stores-list__search-btn");
  };

  /**
   * Returns Searchfield Store.
   *
   * @return {HTMLInputElement} the input element.
   *
   * @public
   */
  this.getSearchfieldStore = function () {
    return document.querySelector(".js-searching-store");
  };

  /**
   * Returns claer Searchild Store Button.
   *
   * @return {HTMLButtonElement} the button element.
   *
   * @public
   */
  this.getClearBtn = function () {
    return document.querySelector(".js-stores-list__reload-btn");
  };

  /**
   * Helper for toggle the reload button to clear button.
   *
   * @return {HTMLButtonElement} the clear button element.
   *
   * @public
   */
  this.toggleToClearBtn = function () {
    const reloadBtn = document.querySelector(".js-stores-list__reload-btn");
    const clearBtn = document.createElement("i");
    clearBtn.classList.add(
      "pointer",
      "fa-circle-xmark",
      "fa-regular",
      "search-input-icon",
      "js-stores-list__clear-btn"
    );
    reloadBtn.replaceWith(clearBtn);
    return clearBtn;
  };

  /**
   * Set Statistics Panel.
   *
   * @param {object} relProducts the object with products of selected store.
   *
   * @return {View} self object.
   *
   * @public
   */
  this.setStatisticsPanel = function (relProducts) {
    const productStatisticsBox = document.querySelector(
      ".product-statistics-wrapper"
    );
    productStatisticsBox.innerHTML = `
    <form class="statistics-panel">
      <div class="statistics-panel__status-item">
       <input type="radio" class="js-statistics-panel__input" name="selectStatus" id="ALL" value="ALL" checked />
        <label class="product-count-text" for="ALL">${relProducts.length} <span>All</span></label>
    </div>
    </form>`;
    return this;
    // const statisticPanel = document.querySelector(".statistics-panel");
    // statisticPanel.addEventListener("change", setProductStatusTable);
  };

  /**
   * Set table for products.
   *
   * @return {View} self object.
   *
   * @public
   */
  this.setProductTable = function () {
    const productTableBox = document.querySelector(".products-table-wrapper");
    productTableBox.innerHTML = `<table class="products-table">
    <thead class="product-table-header">
      <tr>
        <th colspan="5" class="product-table-title">Products</th>
        <th colspan="3">
        <form class="products-table__searchfield">
          <input class="search-product-table" type="text" placeholder="Search by product table"/>
        </form>
        </th>
      </tr>
      <tr class="table-col-headlines">
        <th id="Name" data-scale="DEF" class="table-col-headlines__title">
          <div class="table-col-headlines__wrapper">
            <span>Name</span>
          </div>
        </th>
        <th id="Price" data-scale="DEF" class="table-col-headlines__title">
          <div class="table-col-headlines__wrapper">
            <span>Price</span>
          </div>
        </th>
        <th id="Specs" data-scale="DEF" class="table-col-headlines__title">
          <div class="table-col-headlines__wrapper">
            <span>Specs</span>
          </div>
        </th>
        <th id="SupplierInfo" data-scale="DEF" class="table-col-headlines__title">
          <div class="table-col-headlines__wrapper">
            <span>SupplierInfo</span>
          </div>
        </th>
        <th id="MadeIn" data-scale="DEF" class="table-col-headlines__title">
          <div class="table-col-headlines__wrapper">
            <span>Country of origin</span>
          </div>
        </th>
        <th id="ProductionCompanyName" data-scale="DEF" class="table-col-headlines__title">
          <div class="table-col-headlines__wrapper">
            <span>Prod.company</span>
          </div>
        </th>
        <th id="Rating" data-scale="DEF" class="table-col-headlines__title" colspan="2">
          <div class="table-col-headlines__wrapper">
            <span>Rating</span>
          </div>
        </th>
      </tr>
    </thead>
    <tbody class="js-product-table-tbody">
    </tbody>
  </table>`;
    return this;
  };

  /**
   * Returns searchfield of products table.
   *
   * @return {HTMLInputElement} the input element.
   *
   * @public
   */
  this.getSearchfieldProduct = function () {
    return document.querySelector(".search-product-table");
  };

  /**
   * Returns Headlines of products table.
   *
   * @return {HTMLTableRowElement} the tr element.
   *
   * @public
   */
  this.getTableColHeadlines = function () {
    return document.querySelector(".table-col-headlines");
  };

  /**
   * Set table products rows.
   *
   * @param {object[]} array of products.
   *
   * @return {View} self object.
   *
   * @public
   */
  this.setTableProductRow = function (productsList) {
    const productTableBody = document.querySelector(".js-product-table-tbody");
    productTableBody.innerHTML = "";
    if (productsList.length > 0) {
      productsList.map((productItem, ind) => {
        let productRow = document.createElement("tr");
        productRow.classList.add("product-item");
        productRow.innerHTML = `<td class="name-col">
            <p class="product-item-name">${productItem.Name}</p>
            <p class="product-item-id">${productItem.id}</p>
          </td>
          <td class="price-col"><span>${productItem.Price}</span><span class="price-col-currency">USD</span></td>
          <td class="specs-col">
            <p class="specs-content">
            ${productItem.Specs}
            </p>
          </td>
          <td class="supplier-col">
            <p class="supplier-info">
            ${productItem.SupplierInfo}
            </p>
          </td>
          <td class="country-col">${productItem.MadeIn}</td>
          <td class="company-col">${productItem.ProductionCompanyName}</td>
          <td class="rating-col">
          </td>
          <td data-product="${productItem.id}" class="edit-col">
          <i data-product="${productItem.id}" class="fa-solid js-edit-product-btn fa-pencil pointer"></i>
          <i data-product="${productItem.id}" class="fa-regular fa-circle-xmark js-delete-product-btn pointer"></i>
          </td>`;
        productTableBody.append(productRow);
        this.setProductRating(productItem, ind);
      });
    } else {
      let productRow = document.createElement("tr");
      productRow.classList.add("product-item");
      productRow.innerHTML = `<td class="name-col">No suitable products</td>`;
      productTableBody.append(productRow);
    }
    return this;
  };

  /**
   * Returns delete products buttons.
   *
   * @return {HTMLButtonElement[]} the array of button element.
   *
   * @public
   */
  this.getDeleteProductBtns = function () {
    return document.querySelectorAll(".js-delete-product-btn");
  };

  /**
   * Returns edit products buttons.
   *
   * @return {HTMLButtonElement[]} the array of button element.
   *
   * @public
   */
  this.getEditProductBtns = function () {
    return document.querySelectorAll(".js-edit-product-btn");
  };

  /**
   * Set modal form.
   *
   * @param {string} title modal.
   * @param {object[]} array of content elements.
   * @param {string} the submit button text.
   *
   * @return {HTMLFormElement} the form element.
   *
   * @public
   */
  this.setModal = function (title, content, submitBtnText, onSubmit) {
    const modal = document.querySelector(".modal-box");

    const modalHeader = document.querySelector(".modal-header");
    modalHeader.innerHTML = `<span>${title}</span>`;

    const modalBodyForm = document.querySelector(".modal__form");
    modalBodyForm.innerHTML = "";
    content.forEach((item) => {
      modalBodyForm.append(item);
    });

    const modalFooter = document.createElement("div");
    modalFooter.classList.add("modal-footer");
    modalFooter.innerHTML = `<button class="madal__submit-btn" type="submit">${submitBtnText}</button>
    <input type="reset" value="Cancel" class="madal__cancel-btn" />`;
    modalBodyForm.append(modalFooter);

    const submitBtn = document.querySelector(".madal__submit-btn");
    submitBtn.addEventListener("click", onSubmit);

    modal.showModal();
    return document.querySelector(".modal__form");
  };

  /**
   * Returns modal box.
   *
   * @return {HTMLDialogElement} the dialog element.
   *
   * @public
   */
  this.getModal = function () {
    return document.querySelector(".modal-box");
  };

  /**
   * Returns modal form.
   *
   * @return {HTMLFormElement} the form element.
   *
   * @public
   */
  this.getModalForm = function () {
    return document.querySelector(".modal__form");
  };

  /**
   * Returns delete store button.
   *
   * @return {HTMLButtonElement} the button element.
   *
   * @public
   */
  this.getDeleteStoreBtn = function () {
    return document.querySelector(".delete-btn");
  };

  /**
   * Returns create store button.
   *
   * @return {HTMLButtonElement} the button element.
   *
   * @public
   */
  this.getCreateStoreBtn = function () {
    return document.querySelector(".js-create-store-btn");
  };

  /**
   * Returns delete product button.
   *
   * @return {HTMLButtonElement} the button element.
   *
   * @public
   */
  this.getCreateProductBtn = function () {
    return document.querySelector(".js-create-product-btn");
  };

  /**
   * Set sellect Input.
   *
   * @param {string} label.
   * @param {string} name of select element.
   * @param {Object} options the options.
   * @param {string|number} value the value of option element.
   *
   *
   * @return {HTMLDivElement} the div element.
   *
   * @public
   */
  this.setSelectInp = function (label, name, options, value) {
    const selectWrapper = document.createElement("div");
    const labelSelectStatus = document.createElement("label");
    labelSelectStatus.classList.add("modal-form__select-label");
    labelSelectStatus.innerText = label;
    selectWrapper.appendChild(labelSelectStatus);

    const selectStatusInp = document.createElement("select");
    selectStatusInp.setAttribute("name", name);
    selectStatusInp.setAttribute("value", value);
    selectStatusInp.classList.add("modal-form__select");

    const listStatuses = Object.values(options);
    listStatuses.forEach((status) => {
      const optionSelect = document.createElement("option");
      optionSelect.setAttribute("value", status.statusText);
      status.statusText === value &&
        optionSelect.setAttribute("selected", true);
      optionSelect.innerText = status.text;
      selectStatusInp.append(optionSelect);
    });
    selectWrapper.appendChild(selectStatusInp);
    return selectWrapper;
  };

  /**
   * Set input element.
   *
   * @param {string} label.
   * @param {string} name of select element.
   * @param {string} type the type input.
   * @param {string} placeholder the placeholder.
   * @param {string|number} value the value of option element.
   *
   * @return {HTMLDivElement} the div element.
   *
   * @public
   */
  this.setInputForm = function (label, name, type, placeholder, value = "") {
    const enterBoxFormModal = document.createElement("div");
    enterBoxFormModal.classList.add("modal__form-fields");
    enterBoxFormModal.innerHTML = `<label for="${name}">${label}</label>
  <input name="${name}" value="${value}" class="modal__form-fields-inp" type=${type} placeholder="${placeholder}" />`;
    return enterBoxFormModal;
  };

  /**
   * Set validation for input element.
   *
   * @param {object[]} errInpName the array of error fields.
   *
   * @returns {View} self object.
   *
   * @public
   */
  this.setValidationModalForm = (errInpName) => {
    const modalForm = this.getModalForm();
    modalForm.querySelectorAll(".modal__form-fields-inp").forEach((item) => {
      item.closest(".modal__form-fields").removeAttribute("data-validation");
    });
    errInpName.forEach((item) => {
      let inpErr = document.getElementsByName(item.name);
      inpErr[0]
        .closest(".modal__form-fields")
        .setAttribute("data-validation", item.textError);
    });
    return this;
  };

  /**
   * Returns modal cancel button.
   *
   * @returns {HTMLButtonElement} the button element.
   *
   * @public
   */
  this.getModalCancel = function () {
    return document.querySelector(".madal__cancel-btn");
  };

  /**
   * Set validation for input element.
   *
   * @param {object[]} statistics the array of statistics products.
   *
   * @returns {HTMLDivElement} the div element.
   *
   * @public
   */
  this.setStatisticsBtn = function (statistics) {
    const statisticPanel = document.querySelector(".statistics-panel");
    statistics.forEach((statusList, ind) => {
      const indStatus = Object.values(Constants.STATUSES)[ind];
      const statusItem = document.createElement("div");
      statusItem.classList.add("statistics-panel__status-item");
      statusItem.innerHTML = `
    <input type="radio" class="js-statistics-panel__input" name="selectStatus" id="${indStatus.statusText}" value="${indStatus.statusText}"/>
    <label for="${indStatus.statusText}" class="status-item">
      <div class="${indStatus.classBlock}">
        <i
          class="fa-solid ${indStatus.classIcon} fa-2xl"
        ></i>
      </div>
      <p class="status-item-text">${indStatus.text}</p>
      </label>
      <div class="status-item-amount">${statusList.length}</div>`;
      statisticPanel.append(statusItem);
    });
    return statisticPanel;
  };

  /**
   * Set not found page.
   *
   * @returns {View} self object.
   *
   * @public
   */
  this.setNotFoundPage = function () {
    const storeDetailsBox = document.querySelector(".store-details-box");
    storeDetailsBox.innerHTML = `<header class="status-selected-store-header">
        Not found
    </header>
    <div class="status-selected-store">
      <i class="fa-solid fa-store-slash store-icon"></i>
      <h3 class="status-selected-store-headline">
        404
      </h3>
      <p class="status-selected-store-text">
         No suitable store found
      </p>
    </div>`;
    return this;
  };

  /**
   * Set details store block.
   *
   * @param {object} detailsSelectedStore the details of selected store.
   *
   * @returns {View} self object.
   *
   * @public
   */
  this.setStoreDetails = function (detailsSelectedStore) {
    const storeDetailsBox = document.querySelector(".store-details-box");
    const body = document.querySelector("body");
    const detailsStoreBox = document.createElement("section");

    detailsStoreBox.classList.add("store-details-box");

    detailsStoreBox.innerHTML = `
    <h2 class="headline container">Store Details</h2>
    <header class="header container">
      <div class="store-details">
        <p><b>Email:</b>${detailsSelectedStore.Email}</p>
        <p><b>Established Date:</b>${detailsSelectedStore.Established}</p>
        <p><b>Phone Number:</b>${detailsSelectedStore.PhoneNumber}</p>
        <p><b>Floor Area:</b>${detailsSelectedStore.FloorArea}</p>
        <p><b>Address:</b>${detailsSelectedStore.Address}</p>
      </div>
      <div class="control-buttons">
        <button class="control-buttons__hide-btn">
        <i class="fa-solid fa-chevron-down control-buttons-icon"></i>
      </button>
      <button class="control-buttons__pin-btn">
        <i class="fa-solid fa-thumbtack control-buttons-icon"></i>
      </button>
      </div>
    </header>

    <div class="product-statistics-wrapper container"></div>

    <div class="products-table-wrapper container"></div>

    <footer class="footer">
      <button class="create-btn js-create-product-btn">Create</button>
      <button class="delete-btn">
        <i class="fa-regular fa-trash-can"></i> Delete
      </button>
    </footer>`;
    body.replaceChild(detailsStoreBox, storeDetailsBox);
    return this;
  };

  /**
   * Helper to set product raiting.
   *
   * @param {object} productItem the product details.
   * @param {number} ind the index of product row.
   *
   * @returns {View} self object.
   *
   * @private
   */
  this.setProductRating = function (productItem, ind) {
    const raitingProduct = document.querySelectorAll(".rating-col")[ind];
    const starGood = '<i class="fa-solid fa-star rating-col-good-mark"></i>';
    const starNone = '<i class="fa-solid fa-star rating-col-bad-mark"></i>';
    let listStar = "";
    listStar += `${starGood.repeat(productItem.Rating)}`;
    listStar += `${starNone.repeat(5 - productItem.Rating)}`;
    raitingProduct.innerHTML = listStar;
    return this;
  };

  /**
   * Set details store block.
   *
   * @param {number} selectStoreId the id of selected store.
   *
   * @returns {View} self object.
   *
   * @private
   */
  this.setHighlightStore = function (selectStoreId) {
    if (prevSelectedStore) {
      prevSelectedStore.classList.remove("stores-wrapper-selected");
    }
    storesListBlock.childNodes.forEach((store) => {
      if (store.getAttribute("key") === selectStoreId) {
        store.classList.add("stores-wrapper-selected");
        prevSelectedStore = store;
      }
    });
    return this;
  };
}

export default View;
