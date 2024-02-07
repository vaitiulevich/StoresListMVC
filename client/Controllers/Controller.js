import View from "../Views/View.js";
import Model from "../Models/Model.js";
import Constants from "../Constants.js";
/**
 * @module Controller
 *
 * Orchestrates the model and view objects. A "glue" between them.
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
    view.getCreateStoreBtn().addEventListener("click", this._onCreateStore);

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
    view.setModal(
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
        view.setInputForm("Established date", "Established", "date", "MMM d,y"),
        view.setInputForm(
          "Floor area",
          "FloorArea",
          "text",
          "Enter floor area (in sq.m)"
        ),
      ],
      "Create",
      this._onCreateStoreSubmit
    );
    view.getModalCancel().addEventListener("click", this._onCanselModal);
  };

  /**
   * Submit modal crete store button.
   *
   * @listens click
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onCreateStoreSubmit = (e) => {
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
      +formData.get("Rating") < 1 ||
      +formData.get("Rating") > 5
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
    view.setModal(
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
        view.setInputForm("Made in", "MadeIn", "text", "Enter origin country"),
        view.setInputForm(
          "Product company name",
          "ProductCompanyName",
          "text",
          "Enter manufacturer name"
        ),
        view.setSelectInp("Status", "Status", Constants.STATUSES),
      ],
      "Create",
      this._onCreateProductSubmit
    );
    view.getModalCancel().addEventListener("click", this._onCanselModal);
  };

  /**
   * Submit modal crete product button.
   *
   * @listens click
   *
   * @param {Event} e the DOM event object.
   *
   * @private
   */
  this._onCreateProductSubmit = (e) => {
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
    view.setModal(
      "Delete",
      ["Are you sure you want to delete this product?"],
      "Delete",
      function (e) {
        e.preventDefault();
        model._deleteProduct(deleteProductId);
      }
    );
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
    model._fetchProductDetails(productId).then((productDetails) => {
      view.setModal(
        "Edit",
        [
          view.setInputForm(
            "Name",
            "Name",
            "text",
            "Enter name",
            productDetails.Name
          ),
          view.setInputForm(
            "Price",
            "Price",
            "number",
            "Enter price",
            productDetails.Price
          ),
          view.setInputForm(
            "Specs",
            "Specs",
            "text",
            "Enter specs",
            productDetails.Specs
          ),
          view.setInputForm(
            "Rating",
            "Rating",
            "number",
            "Enter rating 1..5",
            productDetails.Rating
          ),
          view.setInputForm(
            "Suplier info",
            "SuplierInfo",
            "text",
            "Enter uplier info",
            productDetails.SupplierInfo
          ),
          view.setInputForm(
            "Made in",
            "MadeIn",
            "text",
            "Enter origin country",
            productDetails.MadeIn
          ),
          view.setInputForm(
            "Product company name",
            "ProductCompanyName",
            "text",
            "Enter manufacturer name",
            productDetails.ProductionCompanyName
          ),
          view.setSelectInp(
            "Status",
            "Status",
            Constants.STATUSES,
            productDetails.Status
          ),
        ],
        "Edit",
        (e) => {
          e.preventDefault();
          this._onEditProductPress(productId);
        }
      );
      view.getModalCancel().addEventListener("click", this._onCanselModal);
    });
  };

  /**
   * Submit modal edit product button.
   *
   * @listens click
   *
   * @param {number} productId the id of product to edit.
   *
   * @private
   */
  this._onEditProductPress = (productId) => {
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
    view.setModal(
      "Delete",
      ["Are you sure you want to delete this store?"],
      "Delete",
      function (e) {
        e.preventDefault();
        model._deleteStore(urlParams.get("id"));
      }
    );
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

  /**
   * Load stores list
   *
   * @private
   */
  this._onLoadStoresList = function () {
    model.fetchStoresList().then((storesList) => {
      view.setStoresList(storesList);
      this._onSelectHighlightStore();
    });
  };
}

new Controller(new View(), new Model()).init();
