const controller = require("../controllers/orders");

const routes = (router, API_PREFIX, authorize) => {
  router.post(API_PREFIX + "/orders/add/purchase", authorize, controller.addPurchase);
  router.post(API_PREFIX + "/orders/edit/purchase", authorize, controller.editPurchase);
  router.post(API_PREFIX + "/orders/add/sale", authorize, controller.addSale);
  router.get(API_PREFIX + "/orders/list", authorize, controller.list);
  router.get(API_PREFIX + "/orders/delete/:orderId", authorize, controller.delete);
};

module.exports = routes;
