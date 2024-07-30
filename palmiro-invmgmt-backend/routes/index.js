const { authorize } = require("../middleware");

const API_VERSION = "/v1";
const API_PREFIX = "/api" + API_VERSION;

function routes(router) {
  router.get("/ping", async (req, res) => {
    res.send("success");
  });

  require("./users")(router, API_PREFIX, authorize);
  require("./partcodes")(router, API_PREFIX, authorize);
  require("./brands")(router, API_PREFIX, authorize);
  require("./inventory")(router, API_PREFIX, authorize);
  require("./warehouses")(router, API_PREFIX, authorize);
  require("./orders")(router, API_PREFIX, authorize);
  require("./dashboard")(router, API_PREFIX, authorize);

  return router;
}

module.exports = routes;
