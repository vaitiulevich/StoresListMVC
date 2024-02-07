import Constants from "../Constants.js";

/**
 * @module Model
 *
 * Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
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

export default Model;
