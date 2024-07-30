const controller = require("../controllers/inventory");

const routes = (router, API_PREFIX, authorize) => {
  router.get(API_PREFIX + "/inventory/list", authorize, controller.list);
  router.post(API_PREFIX + "/inventory/bad/add", authorize, controller.addBadInventory);
  router.get(API_PREFIX + "/inventory/bad/list", authorize, controller.badList);
  router.post(API_PREFIX + "/inventory/status/change", authorize, controller.changeInventoryStatus);
};

module.exports = routes;
