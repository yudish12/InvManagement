const controller = require("../controllers/partcodes");

const partCodeRoutes = (router, API_PREFIX, authorize) => {
  router.post(API_PREFIX + "/partcodes/add", authorize, controller.add);
  router.get(API_PREFIX + "/partcodes/list", authorize, controller.list);
};

module.exports = partCodeRoutes;
