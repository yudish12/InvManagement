const controller = require("../controllers/brands");

const routes = (router, API_PREFIX, authorize) => {
  router.post(API_PREFIX + "/brands/add", authorize, controller.add);
  router.get(API_PREFIX + "/brands/list", authorize, controller.list);
};

module.exports = routes;
