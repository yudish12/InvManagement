const controller = require("../controllers/warehouses");

const routes = (router, API_PREFIX, authorize) => {
  router.get(API_PREFIX + "/warehouses/list", authorize, controller.list);
  router.post(API_PREFIX + "/warehouses/add", authorize, controller.add);
};

module.exports = routes;
