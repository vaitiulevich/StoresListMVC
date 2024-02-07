"use strict";
let stores = [];
let productsList = [];
let relProducts = [];
let optionsProductTable = {
  searchProduct: null,
  sortProductBy: null,
};

let detailsSelectedStore;
let urlSelectedStoreId;
let prevSelectedStore;

let storesList = document.querySelector(".stores-wrapper");
storesList.addEventListener("click", selectStore);

let searchStoresBtn = document.querySelector(".stores-list__search-btn-js");
searchStoresBtn.addEventListener("click", searchingStore);

let searchfieldStores = document.querySelector(".searching-store-js");
searchfieldStores.addEventListener("change", toggleReplaceBtn);

function getUrl(url) {
  return new Promise((succeed, fail) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/api" + url, true);
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 400) succeed(xhr.response);
      else fail(new Error(`Request failed: ${xhr.statusText}`));
    });
    xhr.addEventListener("error", () => fail(new Error("Network error")));
    xhr.send();
  });
}

getUrl("/Stores")
  .then((res) => {
    stores = JSON.parse(res);
    setListStores(stores);
  })
  .catch((err) => console.log(err));

function selectStore(e) {
  let nowSelectedStore = e.target.closest(".store-item");
  if (nowSelectedStore.classList[0] != "store-item") return;

  // let nowSelectedStoreId = nowSelectedStore.getAttribute("key");
  // let urlSelectedStore = new URL(
  //   "http://127.0.0.1:5500/stores-api/client/index.html"
  // );
  // let SelectedStoreParams = urlSelectedStore.searchParams;
  // SelectedStoreParams.set("id", nowSelectedStoreId);
  // urlSelectedStore.search = SelectedStoreParams.toString();
  // urlSelectedStoreId = urlSelectedStore.toString();

  // detailsSelectedStore = stores.find(
  //   (detStore) => detStore.id == nowSelectedStoreId
  // );

  getUrl("/Stores/" + nowSelectedStoreId)
    .then((res) => {
      setHighlightStore(nowSelectedStore);
      detailsSelectedStore = JSON.parse(res);
      setDetailsStore();
    })
    .catch((err) => console.log(err));
}

function setProductTable() {
  let productTable = document.querySelector(".product-table-tbody-js");
  productTable.innerHTML = "";
  if (optionsProductTable) {
    if (optionsProductTable.searchProduct) {
      productsList = relProducts.filter(
        (product) =>
          product.SupplierInfo.toLowerCase().startsWith(
            optionsProductTable.searchProduct.toLowerCase()
          ) ||
          product.MadeIn.toLowerCase().startsWith(
            optionsProductTable.searchProduct.toLowerCase()
          ) ||
          product.ProductionCompanyName.toLowerCase().startsWith(
            optionsProductTable.searchProduct.toLowerCase()
          ) ||
          product.Name.toLowerCase().startsWith(
            optionsProductTable.searchProduct.toLowerCase()
          ) ||
          product.Price.toString().startsWith(optionsProductTable.searchProduct)
      );
    }

    if (optionsProductTable.sortProductBy) {
      if (optionsProductTable.sortProductBy.scale == 1) {
        productsList = productsList.sort((a, b) =>
          a[optionsProductTable.sortProductBy.name] >
          b[optionsProductTable.sortProductBy.name]
            ? 1
            : -1
        );
      }
      if (optionsProductTable.sortProductBy.scale == 0) {
        productsList = productsList.sort((a, b) =>
          a["id"] > b["id"] ? 1 : -1
        );
      }
      if (optionsProductTable.sortProductBy.scale == -1) {
        productsList = productsList.sort((a, b) =>
          a[optionsProductTable.sortProductBy.name] >
          b[optionsProductTable.sortProductBy.name]
            ? -1
            : 1
        );
      }
    }
  }

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
          <td>
            <i
              class="fa-solid fa-angle-right pointer"
            ></i>
          </td>`;
      productTable.append(productRow);
      let raitingProduct = document.querySelectorAll(".rating-col")[ind];
      for (let i = 1; i <= 5; i++) {
        let starRating = document.createElement("i");
        starRating.classList.add("fa-solid", "fa-star");
        if (i <= productItem.Rating) {
          starRating.classList.add("rating-col-good-mark");
          raitingProduct.append(starRating);
        } else {
          starRating.classList.add("rating-col-bad-mark");
          raitingProduct.append(starRating);
        }
      }
    });
  } else {
    let productRow = document.createElement("tr");
    productRow.innerHTML = `<td rowspan="8" class="name-col">
          <p>No matching products</p>
        </td>`;
    productTable.append(productRow);
  }
}

function setSortParamProductTable(e) {
  let tableHeadlinesList = document.querySelectorAll(
    ".table-col-headlines__title"
  );
  let scaleSelected = +e.target.closest(".table-col-headlines__title").dataset
    .scale;

  tableHeadlinesList.forEach((headline) => {
    if (headline.id != e.target.closest(".table-col-headlines__title").id) {
      headline.dataset.scale = 0;
    }
  });
  if (scaleSelected == 1) {
    scaleSelected = -1;
    e.target.closest(".table-col-headlines__title").dataset.scale = -1;
  } else {
    +scaleSelected;
    scaleSelected += 1;
    e.target.closest(".table-col-headlines__title").dataset.scale =
      scaleSelected;
  }
  optionsProductTable.sortProductBy = {
    name: e.target.closest(".table-col-headlines__title").id,
    scale: +scaleSelected,
  };
  setProductTable();
}

function filterProducts(status) {
  return relProducts.filter((product) => product.Status == status);
}

function setDetailsStore() {
  let url = new URL(urlSelectedStoreId);
  let urlParams = url.searchParams;
  let isStoreSelected = url.searchParams;

  let storeDetailsBox = document.querySelector(".store-details-box");
  let body = document.querySelector("body");
  let detailsStoreBox = document.createElement("section");

  if (isStoreSelected.has("id")) {
    let idSelectedStore = urlParams.get("id");
    getUrl("/Stores/" + idSelectedStore + "/exists")
      .then((isExist) => {
        if (JSON.parse(isExist).exists) {
          getUrl("/Stores/" + idSelectedStore + "/rel_Products")
            .then((res) => {
              relProducts = JSON.parse(res);
              productsList = relProducts;

              detailsStoreBox.classList.add("store-details-box");

              let countOkStatus = filterProducts("OK");
              let countStorageStatus = filterProducts("STORAGE");
              let countOutOfStatus = filterProducts("OUT_OF_STOCK");

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
            <div class="product-count">
              <p class="product-count-text">${relProducts.length} <span>All</span></p>
            </div>
            <div class="statistics-panel">
    
            <div class="statistics-panel__status-item">
              <div class="status-item">
              <div class="status-wraper-ok">
                <i
                  class="fa-solid fa-square-check fa-2xl"
                ></i>
              </div>
              <p class="status-item-text">Ok</p>
              </div>
              <div class="status-item-amount">${countOkStatus.length}</div>
            </div>
    
            <div class="statistics-panel__status-item">
              <div class="status-item">
                <div class="status-wraper-storage">
                  <i
                    class="fa-solid fa-triangle-exclamation fa-2xl"
                  ></i>
                </div>
                <p class="status-item-text">Storage</p>
              </div>
              <div class="status-item-amount">${countStorageStatus.length}</div>
            </div>
    
            <div class="statistics-panel__status-item">
              <div class="status-item">
                <div class="status-wraper-out-stock">
                  <i
                    class="fa-solid fa-circle-exclamation fa-2xl"
                  ></i>
                </div>
                <p class="status-item-text">Out of stock</p>
              </div>
              <div class="status-item-amount">${countOutOfStatus.length}</div>
            </div>
    
            </div>
          </div>
    
          <div class="products-table-wrapper container">
            <table class="products-table">
              <thead class="product-table-header">
                <tr>
                  <th colspan="5" class="product-table-title">Products</th>
                  <th colspan="3">
                  <form class="products-table__searchfield">
                  </form>
                  </th>
                </tr>
                <tr class="table-col-headlines">
                  <th id="Name" data-scale=0 class="table-col-headlines__title">
                    <div class="table-col-headlines__wrapper">
                      <span>Name</span>
                    </div>
                  </th>
                  <th id="Price" data-scale=0 class="table-col-headlines__title">
                    <div class="table-col-headlines__wrapper">
                      <span>Price</span>
                    </div>
                  </th>
                  <th id="Specs" data-scale=0 class="table-col-headlines__title">
                    <div class="table-col-headlines__wrapper">
                      <span>Specs</span>
                    </div>
                  </th>
                  <th id="SupplierInfo" data-scale=0 class="table-col-headlines__title">
                    <div class="table-col-headlines__wrapper">
                      <span>SupplierInfo</span>
                    </div>
                  </th>
                  <th id="MadeIn" data-scale=0 class="table-col-headlines__title">
                    <div class="table-col-headlines__wrapper">
                      <span>Country of origin</span>
                    </div>
                  </th>
                  <th id="ProductionCompanyName" data-scale=0 class="table-col-headlines__title">
                    <div class="table-col-headlines__wrapper">
                      <span>Prod.company</span>
                    </div>
                  </th>
                  <th id="Rating" data-scale=0 class="table-col-headlines__title" colspan="2">
                    <div class="table-col-headlines__wrapper">
                      <span>Rating</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="product-table-tbody-js">
              </tbody>
            </table>
          </div>
    
          <footer class="footer">
            <button class="create-btn">Create</button>
            <button class="delete-btn">
              <i class="fa-regular fa-trash-can"></i> Delete
            </button>
          </footer>`;
              body.replaceChild(detailsStoreBox, storeDetailsBox);

              let productsSearchfield = document.querySelector(
                ".products-table__searchfield"
              );
              let searchProductInput = document.createElement("input");
              searchProductInput.classList.add("search-product-table");
              searchProductInput.setAttribute("type", "text");
              searchProductInput.setAttribute(
                "placeholder",
                "Search by product table"
              );
              searchProductInput.addEventListener(
                "keyup",
                setSearchingParamProductTable
              );
              productsSearchfield.append(searchProductInput);

              let tableProductsSortHeadlins = document.querySelector(
                ".table-col-headlines"
              );
              tableProductsSortHeadlins.addEventListener(
                "click",
                setSortParamProductTable
              );

              setProductTable();
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
}

function setHighlightStore(nowSelectedStore) {
  if (prevSelectedStore) {
    prevSelectedStore.classList.remove("stores-wrapper-selected");
  }
  prevSelectedStore = nowSelectedStore;
  prevSelectedStore.classList.add("stores-wrapper-selected");
}

function searchingStore() {
  let searchingStoreText = document
    .querySelector(".searching-store-js")
    .value.trim();
  console.log(searchingStoreText);
  console.log(stores);
  let searchingListStore = [];
  if (searchingStoreText.length == 0) {
    setListStores(stores);
  } else {
    console.log(stores);
    searchingListStore = stores.filter(
      (store) =>
        store.Name.toLowerCase().startsWith(searchingStoreText.toLowerCase()) ||
        store.Address.toLowerCase().startsWith(
          searchingStoreText.toLowerCase()
        ) ||
        store.FloorArea.toString().startsWith(searchingStoreText)
    );
    console.log(searchingListStore);
    setListStores(searchingListStore);
  }
}

function toggleReplaceBtn() {
  let reloadBtn = document.querySelector(".stores-list__reload-btn-js");
  let clearBtn = document.createElement("i");
  clearBtn.classList.add(
    "pointer",
    "fa-circle-xmark",
    "fa-regular",
    "search-input-icon",
    "stores-list__clear-btn-js"
  );
  clearBtn.addEventListener("click", сlearSearcfield);
  reloadBtn.replaceWith(clearBtn);
}

function сlearSearcfield() {
  searchfieldStores.value = "";
  setListStores(stores);
  let clearBtn = document.querySelector(".stores-list__clear-btn-js");
  let reloadBtn = document.createElement("i");
  reloadBtn.classList.add(
    "pointer",
    "fa-arrows-rotate",
    "fa-solid",
    "search-input-icon",
    "stores-list__reload-btn-js"
  );
  clearBtn.replaceWith(reloadBtn);
}

function setSearchingParamProductTable(e) {
  let searchingProductText = e.target.value.trim();
  if (searchingProductText.length == 0) {
    productsList = detailsSelectedStore.rel_Products;
    optionsProductTable.searchProduct = null;
    setProductTable();
  } else {
    optionsProductTable.searchProduct = searchingProductText;
    setProductTable();
  }
}

function setListStores(searchingList) {
  storesList.innerHTML = "";
  if (searchingList.length > 0) {
    searchingList.map((store) => {
      let storeItem = document.createElement("li");
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
  } else {
    let storeItem = document.createElement("li");
    storeItem.innerHTML = `<div class="store-item__not-result container">
            <h2 class="store-item__headline-store">No suitable stores</h2>
        </div>`;
    storesList.append(storeItem);
  }
}
