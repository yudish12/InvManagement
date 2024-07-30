const controller = require("../controllers/dashboard");

const routes = (router, API_PREFIX, authorize) => {
  router.get(API_PREFIX + "/dashboard/instock-stats", authorize, controller.instockStats);
  router.post(API_PREFIX + "/dashboard/instock-stats-single", authorize, controller.instockStatsSingle);
  router.get(API_PREFIX + "/dashboard/calculate-finance-cost", authorize, controller.calculateFinanceCost);
};

module.exports = routes;
