const Constants = {
  API_PREFIX: "http://localhost:3000/api",
  STATUS_SCALE_STATES: ["DEF", "ASC", "DESC"],
  STATUSES: {
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
  },
  FILTER_PRODUCT_STATUS_ALL: "ALL",
  CURRENT_URL: new URL(window.location.href),
};

export default Constants;
