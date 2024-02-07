"use strict";
const apiPrefix = "http://localhost:3000/api";

let optionsProductTable = {
  searchProduct: null,
  sortProductBy: {
    field: "id",
    scale: "ASC",
  },
  filterProductStatus: "ALL",
};

const statusScaleStates = ["DEF", "ASC", "DESC"];
const statuses = {
  Ok: {
    statusText: "OK",
    text: "Ok",
    classIcon: "fa-square-check",
    classBlock: "status-wraper-ok",
  },
  Storage: {
    statusText: "STORAGE",
    text: "Storage",
    classIcon: "fa-triangle-exclamation",
    classBlock: "status-wraper-storage",
  },
  OutOfStock: {
    statusText: "OUT_OF_STOCK",
    text: "Out of stock",
    classIcon: "fa-circle-exclamation",
    classBlock: "status-wraper-out-stock",
  },
};

let prevSelectedStore;
let detailsSelectedStore;

const storesList = document.querySelector(".stores-wrapper");
storesList.addEventListener("click", selectStore);

const searchStoresBtn = document.querySelector(".js-stores-list__search-btn");
searchStoresBtn.addEventListener("click", searchingStore);

const searchfieldStores = document.querySelector(".js-searching-store");
searchfieldStores.addEventListener("change", toggleReloadeBtn);

const createStoreBtn = document.querySelector(".js-create-store-btn");
const modal = document.querySelector(".modal-box");
const modalForm = document.querySelector(".modal__form");
createStoreBtn.addEventListener("click", createStoreModal);

//queries fn
function fetchData(url) {
  return new Promise((succeed, fail) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiPrefix + url, true);
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 400)
        succeed(JSON.parse(xhr.response));
      else fail(new Error(`Request failed: ${xhr.statusText}`));
    });
    xhr.addEventListener("error", () => fail(new Error("Network error")));
    xhr.send();
  });
}

function postData(url, data) {
  return new Promise((succeed, fail) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiPrefix + url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 400) succeed(xhr.response);
      else fail(new Error(`Request failed: ${xhr.statusText}`));
    });
    xhr.addEventListener("error", () => fail(new Error("Network error")));
    xhr.send(data);
  });
}

function deleteData(url) {
  return new Promise((succeed, fail) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", apiPrefix + url);
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 400) succeed(xhr.response);
      else fail(new Error(`Request failed: ${xhr.statusText}`));
    });
    xhr.addEventListener("error", () => fail(new Error("Network error")));
    xhr.send();
  });
}

//init
fetchData("/Stores")
  .then((res) => {
    setListStores(res);
    setDetailsStore();
  })
  .catch((err) => console.log(err));

//setListStore
function setListStores(searchingList) {
  storesList.innerHTML = "";
  if (searchingList.length > 0) {
    searchingList.map((store) => {
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
      storesList.append(storeItem);
    });
    setHighlightStore();
  } else {
    const storeItem = document.createElement("li");
    storeItem.innerHTML = `<div class="store-item__not-result container">
              <h2 class="store-item__headline-store">No suitable stores</h2>
          </div>`;
    storesList.append(storeItem);
  }
}

function setHighlightStore() {
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  if (urlParams.has("id")) {
    if (prevSelectedStore) {
      prevSelectedStore.classList.remove("stores-wrapper-selected");
    }
    storesList.childNodes.forEach((store) => {
      if (store.getAttribute("key") === urlParams.get("id")) {
        store.classList.add("stores-wrapper-selected");
        prevSelectedStore = store;
      }
    });
  }
}

//setDetailsStore
function setDetailsStore() {
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;

  if (!urlParams.has("id")) {
    return;
  }

  fetchData("/Stores/" + urlParams.get("id") + "/exists")
    .then((isExist) => {
      if (!isExist.exists) {
        setNotFoundPage();
        return;
      }
    })
    .catch((err) => console.log(err));

  fetchData("/Stores/" + urlParams.get("id"))
    .then((res) => {
      detailsSelectedStore = res;
      setDetailsStoreBlock();
    })
    .then(() => {
      fetchData("/Stores/" + urlParams.get("id") + "/rel_Products").then(
        (res) => {
          setProductStatistics(res);
          getDataStatistics();
          setProductTable();
          setSerchfieldTable();
          getDataProductTableRow();
        }
      );
    })
    .catch((err) => console.log(err));
}

//details store
function setDetailsStoreBlock() {
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

<div class="product-statistics-wrapper container">
</div>

<div class="products-table-wrapper container">
</div>

<footer class="footer">
<button class="create-btn js-create-product-btn">Create</button>
<button class="delete-btn">
  <i class="fa-regular fa-trash-can"></i> Delete
</button>
</footer>`;
  body.replaceChild(detailsStoreBox, storeDetailsBox);
  const createProductBtn = document.querySelector(".js-create-product-btn");
  createProductBtn.addEventListener("click", createProductModal);
  const deleteStoreBtn = document.querySelector(".delete-btn");
  deleteStoreBtn.addEventListener("click", deleteStore);
}

function createProductModal() {
  const modalFormWrap = document.createElement("dev");
  modalFormWrap.classList.add(".modal__form-wrapper");
  modalFormWrap.appendChild(setInputForm("Name", "Name", "text", "Enter name"));
  modalFormWrap.appendChild(
    setInputForm("Price", "Price", "number", "Enter price")
  );
  modalFormWrap.appendChild(
    setInputForm("Specs", "Specs", "text", "Enter specs")
  );
  modalFormWrap.appendChild(
    setInputForm("Rating", "Rating", "number", "Enter rating 1..5")
  );
  modalFormWrap.appendChild(
    setInputForm("Suplier info", "SuplierInfo", "text", "Enter uplier info")
  );
  modalFormWrap.appendChild(
    setInputForm("Made in", "MadeIn", "text", "Enter origin country")
  );
  modalFormWrap.appendChild(
    setInputForm(
      "Product company name",
      "ProductCompanyName",
      "text",
      "Enter manufacturer name"
    )
  );

  const labelSelectStatus = document.createElement("label");
  labelSelectStatus.classList.add("modal-form__select-label");
  labelSelectStatus.innerText = "Status";
  modalFormWrap.appendChild(labelSelectStatus);
  const selectStatusInp = document.createElement("select");
  selectStatusInp.setAttribute("name", "Status");
  selectStatusInp.classList.add("modal-form__select");
  const listStatuses = Object.values(statuses);
  listStatuses.forEach((status) => {
    const optionSelect = document.createElement("option");
    optionSelect.setAttribute("value", status.statusText);
    optionSelect.innerText = status.text;
    selectStatusInp.append(optionSelect);
  });
  modalFormWrap.appendChild(selectStatusInp);
  modalFormWrap.appendChild(selectStatusInp);
  setModal("Create new product", modalFormWrap, createProduct);
}

function deleteStore() {
  let confirmModal = confirm("Are you sure you want to delete this store?");
  if (!confirmModal) {
    return;
  }
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  deleteData(`/Stores/${urlParams.get("id")}`)
    .then(() => {
      currentUrl.searchParams.delete("id");
      const newUrl = currentUrl.toString();
      history.replaceState(null, null, newUrl);
    })
    .catch((err) => console.log(err));
}

//product statistics
function setProductStatistics(relProducts) {
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
  const statisticPanel = document.querySelector(".statistics-panel");
  statisticPanel.addEventListener("change", setProductStatusTable);
}

function setProductStatusTable(e) {
  optionsProductTable.filterProductStatus = e.target.closest(
    ".js-statistics-panel__input"
  ).value;
  getDataProductTableRow();
}

function getDataStatistics() {
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  Promise.all([
    fetchData(
      `/Stores/${urlParams.get("id")}/rel_Products/?filter[where][Status]=` +
        statuses.Ok.statusText
    ),
    fetchData(
      `/Stores/${urlParams.get("id")}/rel_Products/?filter[where][Status]=` +
        statuses.Storage.statusText
    ),
    fetchData(
      `/Stores/${urlParams.get("id")}/rel_Products/?filter[where][Status]=` +
        statuses.OutOfStock.statusText
    ),
  ]).then((res) => {
    setStatisticsBtn(res);
  });
}

function setStatisticsBtn(statistics) {
  const statisticPanel = document.querySelector(".statistics-panel");
  statistics.forEach((statusList, ind) => {
    const indStatus = Object.values(statuses)[ind];
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
}

//product table
function setProductTable() {
  const productTableBox = document.querySelector(".products-table-wrapper");
  productTableBox.innerHTML = `<table class="products-table">
  <thead class="product-table-header">
    <tr>
      <th colspan="5" class="product-table-title">Products</th>
      <th colspan="3">
      <form class="products-table__searchfield">
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
  const tableHeadlines = document.querySelector(".table-col-headlines");
  tableHeadlines.addEventListener("click", setSortHeadlines);
}

function setSortHeadlines(e) {
  const selectedHeadline = e.target.closest(".table-col-headlines__title");
  const selectedHeadlineTitle = selectedHeadline.getAttribute("id");
  const headlinesTitles = document.querySelectorAll(
    ".table-col-headlines__title"
  );
  let currentSortState;
  const indexSelectedState = statusScaleStates.indexOf(
    selectedHeadline.dataset.scale
  );
  headlinesTitles.forEach((item) => {
    if (item.getAttribute("id") !== selectedHeadlineTitle) {
      item.dataset.scale = "DEF";
    }
  });

  if (indexSelectedState === statusScaleStates.length - 1) {
    currentSortState = "DEF";
  } else {
    currentSortState = statusScaleStates[indexSelectedState + 1];
  }
  selectedHeadline.dataset.scale = currentSortState;

  optionsProductTable.sortProductBy = {
    field: currentSortState === "DEF" ? "id" : selectedHeadlineTitle,
    scale: currentSortState === "DEF" ? "ASC" : currentSortState,
  };

  getDataProductTableRow();
}

//product table options
//searching
function setSerchfieldTable() {
  let productsSearchfield = document.querySelector(
    ".products-table__searchfield"
  );
  let searchProductInput = document.createElement("input");
  searchProductInput.classList.add("search-product-table");
  searchProductInput.setAttribute("type", "text");
  searchProductInput.setAttribute("placeholder", "Search by product table");
  searchProductInput.addEventListener("keyup", setSearchingParamProductTable);
  productsSearchfield.append(searchProductInput);
}

function setSearchingParamProductTable(e) {
  optionsProductTable.searchProduct = e.target.value;
  getDataProductTableRow();
}

//setRow
function getDataProductTableRow() {
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  let paramsProductUrl = `/?`;
  if (optionsProductTable.filterProductStatus !== "ALL") {
    paramsProductUrl += `filter[where][Status]=${optionsProductTable.filterProductStatus}&`;
  }
  if (optionsProductTable.sortProductBy) {
    paramsProductUrl += `filter[order]=${optionsProductTable.sortProductBy.field}%20${optionsProductTable.sortProductBy.scale}&`;
  }
  if (optionsProductTable.searchProduct) {
    let searchingProduct = optionsProductTable.searchProduct.trim();
    if (isNaN(searchingProduct)) {
      if (
        optionsProductTable.searchProduct.length > 2 ||
        optionsProductTable.searchProduct.length === 0
      ) {
        const regSearchStr = new RegExp(searchingProduct, "ig");
        paramsProductUrl += `filter[where][or][0][Name][regexp]=${regSearchStr}&filter[where][or][1][MadeIn][regexp]=${regSearchStr}&filter[where][or][2][ProductionCompanyName][regexp]=${regSearchStr}&filter[where][or][3][Specs][regexp]=${regSearchStr}&filter[where][or][5][SupplierInfo][regexp]=${regSearchStr}&`;
      }
    } else {
      +searchingProduct;
      paramsProductUrl += `filter[where][or][0][Price][eq]=${searchingProduct}&
filter[where][or][1][Rating][eq]=${searchingProduct}&
filter[where][or][2][id][eq]=${searchingProduct}&`;
    }
  }

  fetchData(`/Stores/${urlParams.get("id")}/rel_Products` + paramsProductUrl)
    .then((res) => {
      setProductTableRow(res);
    })
    .catch((err) => console.log(err));
}

function setProductTableRow(productsList) {
  const productTableBody = document.querySelector(".js-product-table-tbody");
  productTableBody.innerHTML = "";
  productsList.map((productItem, ind) => {
    let productRow = document.createElement("tr");
    productRow.classList.add("product-item");
    productRow.addEventListener("click", deleteProduct);
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
        <td>
        <i data-product="${productItem.id}" class="fa-regular fa-circle-xmark js-delete-product-btn pointer"></i>
        </td>`;
    productTableBody.append(productRow);
    setProductRating(productItem, ind);
  });
}

function setProductRating(productItem, ind) {
  const raitingProduct = document.querySelectorAll(".rating-col")[ind];
  for (let i = 1; i <= 5; i++) {
    const starRating = document.createElement("i");
    starRating.classList.add("fa-solid", "fa-star");
    i <= productItem.Rating
      ? starRating.classList.add("rating-col-good-mark")
      : starRating.classList.add("rating-col-bad-mark");
    raitingProduct.append(starRating);
  }
}

function deleteProduct(e) {
  let confirmModal = confirm("Are you sure you want to delete this product?");
  if (!confirmModal) {
    return;
  }
  const deleteBtn = e.target.closest(".js-delete-product-btn");
  const deleteProductId = deleteBtn.dataset.product;
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  if (!deleteBtn) {
    return;
  }
  deleteData(
    `/Stores/${urlParams.get("id")}/rel_Products/${deleteProductId}`
  ).catch((err) => console.log(err));
}

//store
function selectStore(e) {
  const nowSelectedStore = e.target.closest(".store-item");
  if (nowSelectedStore.classList[0] != "store-item") {
    return;
  }
  const nowSelectedStoreId = nowSelectedStore.getAttribute("key");

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("id", nowSelectedStoreId);
  const newUrl = currentUrl.toString();
  history.replaceState(null, null, newUrl);

  setHighlightStore();
  resetFiltrationProducts();
  setDetailsStore();
}

function createStore(e) {
  e.preventDefault();
  const formData = new FormData(modalForm);
  let storeDetails = {
    Name: formData.get("Name"),
    Email: formData.get("Email"),
    PhoneNumber: formData.get("PhoneNumber"),
    Address: formData.get("Address"),
    Established: new Date(formData.get("Established")).toISOString(),
    FloorArea: +formData.get("FloorArea"),
  };
  postData("/Stores/", JSON.stringify(storeDetails)).catch((err) =>
    console.log(err)
  );
}

function searchingStore() {
  const searchingStoreText = document
    .querySelector(".js-searching-store")
    .value.trim();
  let paramsStoreUrl = "/?";
  if (searchingStoreText.length > 0) {
    if (isNaN(searchingStoreText)) {
      const regSearchStr = new RegExp(searchingStoreText, "ig");
      paramsStoreUrl += `filter[where][or][0][Name][regexp]=${regSearchStr}&
filter[where][or][1][Address][regexp]=${regSearchStr}&`;
    } else {
      paramsStoreUrl += `filter[where][or][0][FloorArea][eq]=${searchingStoreText}&
filter[where][or][1][id][eq]=${searchingStoreText}&`;
    }
  }
  fetchData(`/Stores` + paramsStoreUrl).catch((err) => console.log(err));
}

function toggleReloadeBtn() {
  const reloadBtn = document.querySelector(".js-stores-list__reload-btn");
  const clearBtn = document.createElement("i");
  clearBtn.classList.add(
    "pointer",
    "fa-circle-xmark",
    "fa-regular",
    "search-input-icon",
    "js-stores-list__clear-btn"
  );
  clearBtn.addEventListener("click", сlearSearcfield);
  reloadBtn.replaceWith(clearBtn);
}

function сlearSearcfield() {
  searchfieldStores.value = "";
  searchingStore();
  const clearBtn = document.querySelector(".js-stores-list__clear-btn");
  const reloadBtn = document.createElement("i");
  reloadBtn.classList.add(
    "pointer",
    "fa-arrows-rotate",
    "fa-solid",
    "search-input-icon",
    "js-stores-list__reload-btn"
  );
  clearBtn.replaceWith(reloadBtn);
}

function createStoreModal() {
  const modalFormWrap = document.createElement("dev");
  modalFormWrap.classList.add(".modal__form-wrapper");
  modalFormWrap.appendChild(setInputForm("Name", "Name", "text", "Enter name"));
  modalFormWrap.appendChild(
    setInputForm("Email", "Email", "email", "Enter email")
  );
  modalFormWrap.appendChild(
    setInputForm("Phone Number", "PhoneNumber", "tel", "Enter phone number")
  );
  modalFormWrap.appendChild(
    setInputForm("Address", "Address", "text", "Enter address")
  );
  modalFormWrap.appendChild(
    setInputForm("Established date", "Established", "date", "MMM d,y")
  );
  modalFormWrap.appendChild(
    setInputForm(
      "Floor area",
      "FloorArea",
      "text",
      "Enter floor area (in sq.m)"
    )
  );
  setModal("Create new store", modalFormWrap, createStore);
}

function createProduct(e) {
  e.preventDefault();
  const currentUrl = new URL(window.location.href);
  const urlParams = currentUrl.searchParams;
  const formData = new FormData(modalForm);
  let storeDetails = {
    Name: formData.get("Name"),
    Price: +formData.get("Price"),
    Specs: formData.get("Specs"),
    Rating: +formData.get("Rating"),
    SupplierInfo: formData.get("SuplierInfo"),
    MadeIn: formData.get("MadeIn"),
    ProductionCompanyName: formData.get("ProductCompanyName"),
    Status: formData.get("Status"),
  };
  postData(
    `/Stores/${urlParams.get("id")}/rel_Products`,
    JSON.stringify(storeDetails)
  ).catch((err) => console.log(err));
}

//general functions
function setInputForm(label, name, type, placeholder) {
  const enterBoxFormModal = document.createElement("div");
  enterBoxFormModal.classList.add("modal__form-fields");
  enterBoxFormModal.innerHTML = `<label for="${name}">${label}</label>
  <input name="${name}" class="modal__form-fields-inp" type=${type} placeholder="${placeholder}" />`;
  return enterBoxFormModal;
}

function setModal(title, content, onCreate) {
  const modalHeader = document.querySelector(".modal-header");
  modalHeader.innerHTML = `<span>${title}</span>`;

  const modalBodyForm = document.querySelector(".modal__form");
  modalBodyForm.innerHTML = "";
  modalBodyForm.append(content);

  const modalFooter = document.createElement("div");
  modalFooter.classList.add("modal-footer");
  modalFooter.innerHTML = `<button class="madal__submit-btn" type="submit">Submit</button>
  <input type="reset" value="Cansel" class="madal__cansel-btn" />`;
  modalBodyForm.append(modalFooter);

  const canselBtn = document.querySelector(".madal__cansel-btn");
  canselBtn.addEventListener("click", setModalClose);
  modal.showModal();
  modalForm.addEventListener("submit", onCreate);
}

function setModalClose() {
  modal.close();
}

function resetFiltrationProducts() {
  optionsProductTable = {
    searchProduct: null,
    sortProductBy: {
      field: "id",
      scale: "ASC",
    },
    filterProductStatus: "ALL",
  };
}

function setNotFoundPage() {
  const storeDetailsBox = document.querySelector(".store-details-box");
  const body = document.querySelector("body");
  const detailsStoreBox = document.createElement("section");

  detailsStoreBox.classList.add("not-found");

  detailsStoreBox.innerHTML = `<header class="status-selected-store-header">
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
  body.replaceChild(detailsStoreBox, storeDetailsBox);
}
