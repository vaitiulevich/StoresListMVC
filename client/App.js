import Constants from "../Constants.js";

/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
 * @constructor
 */
function Model() {
  /**
   * Common method which "promisifies" the XHR calls.
   *
   * @param {string} url the URL address to fetch.
   * @param {string} request method.
   * @param {object} data to send to the server.
   *
   * @return {Promise} the promise object will be resolved once XHR gets loaded/failed.
   *
   * @public
   */
  this.requestData = function (url, method = "GET", data = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, Constants.API_PREFIX + url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 400) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(`Request failed: ${xhr.statusText}`));
        }
      });
      const errorText = new Error("Network error");
      xhr.addEventListener("error", () => {
        setModal("Error", errorText, "Ok", setErrorMessage);
      });
      data ? xhr.send(JSON.stringify(data)) : xhr.send();
    });
  };

  /**
   * Method to fetch data about the selected store.
   *
   * @return {Promise} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._fetchStoreDetails = function () {
    const urlParams = Constants.CURRENT_URL.searchParams;
    return this.requestData("/Stores/" + urlParams.get("id"), "GET");
  };

  /**
   * Method to fetch data of all products from the selected store.
   *
   * @return {Promise} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._fetchStoreProducts = function () {
    const urlParams = Constants.CURRENT_URL.searchParams;
    return this.requestData(
      `/Stores/${urlParams.get("id")}/rel_Products`,
      "GET"
    );
  };

  /**
   * Method to fetch data of all products statistics from the selected store.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._fetchStoreStatistics = function () {
    const urlParams = Constants.CURRENT_URL.searchParams;
    return Promise.all([
      this.requestData(
        `/Stores/${urlParams.get("id")}/rel_Products/?filter[where][Status]=` +
          Constants.STATUSES.Ok.statusText
      ),
      this.requestData(
        `/Stores/${urlParams.get("id")}/rel_Products/?filter[where][Status]=` +
          Constants.STATUSES.Storage.statusText
      ),
      this.requestData(
        `/Stores/${urlParams.get("id")}/rel_Products/?filter[where][Status]=` +
          Constants.STATUSES.OutOfStock.statusText
      ),
    ]);
  };

  /**
   * Method to get filtered data by options of all products from the selected store.
   *
   * @param {object} optionsProductTable the options product object.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._fetchSortProduct = function (optionsProductTable) {
    const urlParams = Constants.CURRENT_URL.searchParams;
    let paramsProductUrl = `/?`;
    if (
      optionsProductTable.filterProductStatus !==
      Constants.FILTER_PRODUCT_STATUS_ALL
    ) {
      paramsProductUrl += `filter[where][Status]=${optionsProductTable.filterProductStatus}&`;
    }
    if (optionsProductTable.sortProductBy) {
      paramsProductUrl += `filter[order]=${optionsProductTable.sortProductBy.field}%20${optionsProductTable.sortProductBy.scale}&`;
    }
    if (optionsProductTable.searchProduct) {
      // paramsProductUrl += setUrlSearchingProduct();
      let searchingProduct = optionsProductTable.searchProduct.trim();
      if (isNaN(searchingProduct)) {
        const regSearchStr = new RegExp(searchingProduct, "ig");
        paramsProductUrl += `filter[where][or][0][Name][regexp]=${regSearchStr}&filter[where][or][1][MadeIn][regexp]=${regSearchStr}&filter[where][or][2][ProductionCompanyName][regexp]=${regSearchStr}&filter[where][or][3][Specs][regexp]=${regSearchStr}&filter[where][or][5][SupplierInfo][regexp]=${regSearchStr}&`;
      } else {
        paramsProductUrl += `filter[where][or][0][Price][eq]=${searchingProduct}&
filter[where][or][1][Rating][eq]=${searchingProduct}&
filter[where][or][2][id][eq]=${searchingProduct}&`;
      }
    }
    return this.requestData(
      `/Stores/${urlParams.get("id")}/rel_Products` + paramsProductUrl,
      "GET"
    );
  };

  /**
   * Method to delete selected product.
   *
   * @param {string|number} deleteProductId the Product Id to delete.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._deleteProduct = function (deleteProductId) {
    const urlParams = Constants.CURRENT_URL.searchParams;
    return this.requestData(
      `/Stores/${urlParams.get("id")}/rel_Products/${deleteProductId}`,
      "DELETE"
    ).then((res) => console.log(res));
  };

  /**
   * Method to create new Store.
   *
   * @param {object} storeDetails the store details for new store.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._createStore = function (storeDetails) {
    return this.requestData("/Stores/", "POST", storeDetails);
  };

  /**
   * Method to create new Product.
   *
   * @param {string|number} storeId the store id.
   * @param {object} productDetails the store details for new Product.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._createProduct = function (storeId, productDetails) {
    return this.requestData(
      `/Stores/${storeId}/rel_Products`,
      "POST",
      productDetails
    );
  };

  /**
   * Method to fetch Product details.
   *
   * @param {string|number} productId the product id.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._fetchProductDetails = function (productId) {
    const urlParams = Constants.CURRENT_URL.searchParams;
    return this.requestData(
      `/Stores/${urlParams.get("id")}/rel_Products/${productId}`,
      "GET"
    );
  };

  /**
   * Method to edit Product details.
   *
   * @param {string|number} storeId the store id.
   * @param {string|number} productId the product id.
   * @param {object} productDetails the store details.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._editProduct = function (storeId, productId, productDetails) {
    return this.requestData(
      `/Stores/${storeId}/rel_Products/${productId}`,
      "PUT",
      productDetails
    );
  };

  /**
   * Method to delete selected store.
   *
   * @param {string|number} deleteStoreId the store id to delete.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this._deleteStore = function (deleteStoreId) {
    console.log(deleteStoreId);
    this.requestData(`/Stores/${deleteStoreId}`, "DELETE").then(() => {
      Constants.CURRENT_URL.searchParams.delete("id");
      const newUrl = Constants.CURRENT_URL.toString();
      history.replaceState(null, null, newUrl);
    });
  };

  /**
   * Method to fetch serched store.
   *
   * @param {string} paramsStoreUrl the params to serch store.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this.fetchSearchStores = function (paramsStoreUrl) {
    console.log(paramsStoreUrl);
    return this.requestData("/Stores" + paramsStoreUrl, "GET").then(function (
      storesFoundList
    ) {
      return storesFoundList;
    });
  };

  /**
   * Method to fetch stores list.
   *
   * @return {Promise.all} the promise object will be resolved once XHR gets loaded.
   *
   * @public
   */
  this.fetchStoresList = function () {
    return this.requestData("/Stores", "GET").then(function (storesList) {
      return storesList;
    });
  };
}

/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
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
  this.setModal = function (title, content, submitBtnText) {
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
   * Fill the data into product form.
   *
   * @param {Object} productDetails the product data object.
   *
   * @returns {setModal} setModal object.
   */
  this.fillProductForm = function (productDetails) {
    return this.setModal(
      "Edit",
      [
        this.setInputForm(
          "Name",
          "Name",
          "text",
          "Enter name",
          productDetails.Name
        ),
        this.setInputForm(
          "Price",
          "Price",
          "number",
          "Enter price",
          productDetails.Price
        ),
        this.setInputForm(
          "Specs",
          "Specs",
          "text",
          "Enter specs",
          productDetails.Specs
        ),
        this.setInputForm(
          "Rating",
          "Rating",
          "number",
          "Enter rating 1..5",
          productDetails.Rating
        ),
        this.setInputForm(
          "Suplier info",
          "SuplierInfo",
          "text",
          "Enter uplier info",
          productDetails.SupplierInfo
        ),
        this.setInputForm(
          "Made in",
          "MadeIn",
          "text",
          "Enter origin country",
          productDetails.MadeIn
        ),
        this.setInputForm(
          "Product company name",
          "ProductCompanyName",
          "text",
          "Enter manufacturer name",
          productDetails.ProductionCompanyName
        ),
        this.setSelectInp(
          "Status",
          "Status",
          Constants.STATUSES,
          productDetails.Status
        ),
      ],
      "Edit"
    );
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
    console.log(value);
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
      console.log(inpErr);
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

/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 *
 * @param {View} view view instance.
 * @param {Model} model model instance.
 *
 * @constructor
 */
function Controller(view, model) {
  /**
   * Initialize controller.
   *
   * @public
   */
  this.init = function () {
    this.View = view;
    this.Model = model;

    this.optionsProductTable = {
      searchProduct: null,
      sortProductBy: {
        field: "id",
        scale: "ASC",
      },
      filterProductStatus: "ALL",
    };
    const storesList = view.getStoresListBlock();

    const urlParams = Constants.CURRENT_URL.searchParams;

    if (urlParams.has("id")) {
      this._setCurrentStore();
    }

    storesList.addEventListener("click", this._selectStore);

    const searchStoresBtn = view.getSearchStoresBtn();
    searchStoresBtn.addEventListener("click", this._onSearchStore);

    const searchfieldStores = view.getSearchfieldStore();
    searchfieldStores.addEventListener("change", this._onToggleReloadeBtn);

    this._onLoadStoresList();
  };

  /**
   * Load current store details event handler.
   *
   * @private
   */
  this._setCurrentStore = () => {
    model
      ._fetchStoreDetails()
      .then((storeDetails) => {
        if (!storeDetails) {
          return;
        }
        view.setStoreDetails(storeDetails);
      })
      .then(() => {
        view.getDeleteStoreBtn().addEventListener("click", (e) => {
          e.preventDefault();
          this._onDeleteStore();
        });
        view.getCreateStoreBtn().addEventListener("click", this._onCreateStore);
        view
          .getCreateProductBtn()
          .addEventListener("click", this._onCreateProduct);
        model._fetchStoreProducts().then((relProducts) => {
          view.setStatisticsPanel(relProducts);
          view.setProductTable();
          view
            .getSearchfieldProduct()
            .addEventListener("keyup", this._onSearchProduct);
          view
            .getTableColHeadlines()
            .addEventListener("click", this._onSortColumn);
          model._fetchStoreStatistics().then((storeStatistics) => {
            view
              .setStatisticsBtn(storeStatistics)
              .addEventListener("change", this._onChangeFilter);
          });
          this._onTableProductRow(relProducts);
        });
      })
      .catch(() => {
        view.setNotFoundPage();
      });
  };

  /**
   * Helper to load table products rows.
   *
   * @param {object[]} listProducts the array of products objects.
   *
   * @private
   */
  this._onTableProductRow = (listProducts) => {
    view.setTableProductRow(listProducts);
    view.getDeleteProductBtns().forEach((item) => {
      item.addEventListener("click", this._onDeleteProductBtns);
    });
    view.getEditProductBtns().forEach((item) => {
      item.addEventListener("click", this._onEditProductBtns);
    });
  };

  /**
   * Select store button click event handler.
   *
   * @listens click
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._selectStore = (e) => {
    const nowSelectedStore = e.target.closest(".store-item");
    if (nowSelectedStore.classList[0] != "store-item") {
      return;
    }
    const nowSelectedStoreId = nowSelectedStore.getAttribute("key");
    Constants.CURRENT_URL.searchParams.set("id", nowSelectedStoreId);
    const newUrl = Constants.CURRENT_URL.toString();
    history.replaceState(null, null, newUrl);
    this._setCurrentStore();
    this._onSelectHighlightStore();
  };

  /**
   * Helper to highlight selected store.
   *
   * @private
   */
  this._onSelectHighlightStore = function () {
    const urlParams = Constants.CURRENT_URL.searchParams;
    if (urlParams.has("id")) {
      view.setHighlightStore(urlParams.get("id"));
    }
  };

  /**
   * Helper to set urls on search store.
   *
   * @listens click
   *
   * @private
   */
  this._onSearchStore = function () {
    const searchingStoreText = view.getSearchfieldStore().value.trim();
    const urlParams = Constants.CURRENT_URL.searchParams;
    let paramsStoreUrl = "/?";
    if (searchingStoreText.length > 0) {
      if (isNaN(searchingStoreText)) {
        const regSearchStr = new RegExp(searchingStoreText, "ig");
        paramsStoreUrl += `filter[where][or][0][Name][regexp]=${regSearchStr}&filter[where][or][1][Address][regexp]=${regSearchStr}&`;
      } else {
        paramsStoreUrl += `filter[where][or][0][FloorArea][eq]=${searchingStoreText}&filter[where][or][1][id][eq]=${searchingStoreText}&`;
      }
    }
    model.fetchSearchStores(paramsStoreUrl).then(function (storesFoundList) {
      view.setStoresList(storesFoundList);
      view.setHighlightStore(urlParams.get("id"));
    });
  };

  /**
   * Helper to toggle reload button
   *
   * @listens change
   *
   * @private
   */
  this._onToggleReloadeBtn = () => {
    view.toggleToClearBtn().addEventListener("click", this._onClearSearcfield);
  };

  /**
   * Cancel modal click button
   *
   * @listens click
   *
   * @private
   */
  this._onCanselModal = () => {
    view.getModal().close();
  };

  /**
   * Create store click button and set modal create store
   *
   * @listens click
   *
   * @private
   */
  this._onCreateStore = () => {
    view
      .setModal(
        "Create Store",
        [
          view.setInputForm("Name", "Name", "text", "Enter name"),
          view.setInputForm("Email", "Email", "email", "Enter email"),
          view.setInputForm(
            "Phone Number",
            "PhoneNumber",
            "tel",
            "Enter phone number"
          ),
          view.setInputForm("Address", "Address", "text", "Enter address"),
          view.setInputForm(
            "Established date",
            "Established",
            "date",
            "MMM d,y"
          ),
          view.setInputForm(
            "Floor area",
            "FloorArea",
            "text",
            "Enter floor area (in sq.m)"
          ),
        ],
        "Create"
      )
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const modalForm = view.getModalForm();
        const formData = new FormData(modalForm);
        let validErr = this.validateStoreForm(formData);
        if (validErr.length > 0) {
          view.setValidationModalForm(validErr);
        } else {
          let storeDetails = {
            Name: formData.get("Name"),
            Email: formData.get("Email"),
            PhoneNumber: formData.get("PhoneNumber"),
            Address: formData.get("Address"),
            Established: new Date(formData.get("Established")).toISOString(),
            FloorArea: +formData.get("FloorArea"),
          };
          model._createStore(storeDetails);
        }
      });
    view.getModalCancel().addEventListener("click", this._onCanselModal);
  };

  /**
   * Helper to validate store form
   *
   * @param {FormData} formData the object of valeus form.
   *
   * @private
   */
  this.validateStoreForm = (formData) => {
    const regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const regPhone =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    let validErr = [];
    if (!formData.get("Name")) {
      validErr.push({
        name: "Name",
        textError: "The Name field cannot be empty",
      });
    }
    if (!regEmail.test(formData.get("Email"))) {
      validErr.push({
        name: "Email",
        textError: "The Email field was entered incorrectly",
      });
    }
    if (!regPhone.test(formData.get("PhoneNumber"))) {
      validErr.push({
        name: "PhoneNumber",
        textError: "The Phone number field was entered incorrectly",
      });
    }
    if (!formData.get("Address")) {
      validErr.push({
        name: "Address",
        textError: "The Address field cannot be empty",
      });
    }
    if (!formData.get("Established")) {
      validErr.push({
        name: "Established",
        textError: "The Established field cannot be empty",
      });
    }
    if (!formData.get("FloorArea") || isNaN(formData.get("FloorArea"))) {
      validErr.push({
        name: "FloorArea",
        textError: "The FloorArea field was entered incorrectly",
      });
    }
    return validErr;
  };

  /**
   * Helper to validate product form
   *
   * @param {FormData} formData the object of valeus form.
   *
   * @private
   */
  this.validateProductForm = (formData) => {
    let validErr = [];
    if (!formData.get("Name")) {
      validErr.push({
        name: "Name",
        textError: "The Name field cannot be empty",
      });
    }
    if (!formData.get("Price") || isNaN(formData.get("Price"))) {
      validErr.push({
        name: "Price",
        textError: "The Price field was entered incorrectly",
      });
    }
    if (!formData.get("Specs")) {
      validErr.push({
        name: "Specs",
        textError: "The Specs field cannot be empty",
      });
    }
    if (
      !formData.get("Rating") ||
      isNaN(+formData.get("Rating")) ||
      +formData.get("Rating") <= 1 ||
      +formData.get("Rating") >= 5
    ) {
      validErr.push({
        name: "Rating",
        textError: "The Rating field was entered incorrectly",
      });
    }
    if (!formData.get("SuplierInfo")) {
      validErr.push({
        name: "SuplierInfo",
        textError: "The SuplierInfo field cannot be empty",
      });
    }
    if (!formData.get("MadeIn")) {
      validErr.push({
        name: "MadeIn",
        textError: "The MadeIn field cannot be empty",
      });
    }
    if (!formData.get("ProductCompanyName")) {
      validErr.push({
        name: "ProductCompanyName",
        textError: "The ProductCompanyName field cannot be empty",
      });
    }
    return validErr;
  };

  /**
   * Set create product click button
   *
   * @listens click
   *
   * @private
   */
  this._onCreateProduct = () => {
    view
      .setModal(
        "Create Product",
        [
          view.setInputForm("Name", "Name", "text", "Enter name"),
          view.setInputForm("Price", "Price", "number", "Enter price"),
          view.setInputForm("Specs", "Specs", "text", "Enter specs"),
          view.setInputForm("Rating", "Rating", "number", "Enter rating 1..5"),
          view.setInputForm(
            "Suplier info",
            "SuplierInfo",
            "text",
            "Enter uplier info"
          ),
          view.setInputForm(
            "Made in",
            "MadeIn",
            "text",
            "Enter origin country"
          ),
          view.setInputForm(
            "Product company name",
            "ProductCompanyName",
            "text",
            "Enter manufacturer name"
          ),
          view.setSelectInp("Status", "Status", Constants.STATUSES),
        ],
        "Create"
      )
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const urlParams = Constants.CURRENT_URL.searchParams;
        const modalForm = view.getModalForm();

        const formData = new FormData(modalForm);

        let validErr = this.validateProductForm(formData);
        if (validErr.length > 0) {
          view.setValidationModalForm(validErr);
        } else {
          let productDetails = {
            Name: formData.get("Name"),
            Price: +formData.get("Price"),
            Specs: formData.get("Specs"),
            Rating: +formData.get("Rating"),
            SupplierInfo: formData.get("SuplierInfo"),
            MadeIn: formData.get("MadeIn"),
            ProductionCompanyName: formData.get("ProductCompanyName"),
            Status: formData.get("Status"),
          };
          model
            ._createProduct(urlParams.get("id"), productDetails)
            .catch((err) => console.log(err));
        }
      });
    view.getModalCancel().addEventListener("click", this._onCanselModal);
  };

  /**
   * Select filter button event handler.
   *
   * @listens change
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onChangeFilter = (e) => {
    this.optionsProductTable.filterProductStatus = e.target.value;
    model._fetchSortProduct(this.optionsProductTable).then((res) => {
      this._onTableProductRow(res);
    });
  };

  /**
   * Click delete product button event handler.
   *
   * @listens click
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onDeleteProductBtns = (e) => {
    const deleteProductId = e.target.dataset.product;
    view
      .setModal(
        "Delete",
        ["Are you sure you want to delete this product?"],
        "Delete"
      )
      .addEventListener("submit", function (e) {
        e.preventDefault();
        model._deleteProduct(deleteProductId);
      });
    view.getModalCancel().addEventListener("click", this._onCanselModal);
  };

  /**
   * Click edit product button event handler.
   *
   * @listens click
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onEditProductBtns = (e) => {
    const productId = e.target.dataset.product;
    model._fetchProductDetails(productId).then((res) => {
      view.fillProductForm(res).addEventListener("submit", function (e) {
        e.preventDefault();
        const urlParams = Constants.CURRENT_URL.searchParams;
        const modalForm = view.getModalForm();

        const formData = new FormData(modalForm);

        let validErr = this.validateProductForm(formData);
        if (validErr.length > 0) {
          view.setValidationModalForm(validErr);
        } else {
          let productDetails = {
            Name: formData.get("Name"),
            Price: +formData.get("Price"),
            Specs: formData.get("Specs"),
            Rating: +formData.get("Rating"),
            SupplierInfo: formData.get("SuplierInfo"),
            MadeIn: formData.get("MadeIn"),
            ProductionCompanyName: formData.get("ProductCompanyName"),
            Status: formData.get("Status"),
          };
          model
            ._editProduct(urlParams.get("id"), productId, productDetails)
            .catch((err) => console.log(err));
        }
      });
      view.getModalCancel().addEventListener("click", this._onCanselModal);
    });
    // });
  };

  /**
   * Set delete store click button
   *
   * @listens click
   *
   * @private
   */
  this._onDeleteStore = () => {
    const urlParams = Constants.CURRENT_URL.searchParams;
    view
      .setModal(
        "Delete",
        ["Are you sure you want to delete this store?"],
        "Delete"
      )
      .addEventListener("submit", function (e) {
        e.preventDefault();
        model._deleteStore(urlParams.get("id"));
      });
    view.getModalCancel().addEventListener("click", this._onCanselModal);
  };

  /**
   * Clear serchfield store
   *
   * @listens click
   *
   * @private
   */
  this._onClearSearcfield = () => {
    model.fetchStoresList().then((storesList) => {
      view.setStoresList(storesList);
      this._onSelectHighlightStore();
    });
    view.getSearchfieldStore().value = "";
  };

  /**
   * Enter serch text product event handler.
   *
   * @listens keyup
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onSearchProduct = (e) => {
    this.optionsProductTable.searchProduct = e.target.value;
    model._fetchSortProduct(this.optionsProductTable).then((res) => {
      this._onTableProductRow(res);
    });
  };

  /**
   * Select column sort event handler.
   *
   * @listens click
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onSortColumn = (e) => {
    const selectedHeadline = e.target.closest(".table-col-headlines__title");
    const selectedHeadlineTitle = selectedHeadline.getAttribute("id");
    let currentSortState;
    const indexSelectedState = Constants.STATUS_SCALE_STATES.indexOf(
      selectedHeadline.dataset.scale
    );
    const headlinesTitles = view
      .getTableColHeadlines()
      .querySelectorAll(".table-col-headlines__title");
    headlinesTitles.forEach((item) => {
      if (item.getAttribute("id") !== selectedHeadlineTitle) {
        item.dataset.scale = "DEF";
      }
    });

    currentSortState =
      indexSelectedState === Constants.STATUS_SCALE_STATES.length - 1
        ? "DEF"
        : Constants.STATUS_SCALE_STATES[indexSelectedState + 1];

    selectedHeadline.dataset.scale = currentSortState;

    this.optionsProductTable.sortProductBy = {
      field: currentSortState === "DEF" ? "id" : selectedHeadlineTitle,
      scale: currentSortState === "DEF" ? "ASC" : currentSortState,
    };
    model._fetchSortProduct(this.optionsProductTable).then((res) => {
      this._onTableProductRow(res);
    });
  };

  this._onLoadStoresList = function () {
    model.fetchStoresList().then((storesList) => {
      view.setStoresList(storesList);
      this._onSelectHighlightStore();
    });
  };
}

new Controller(new View(), new Model()).init();
