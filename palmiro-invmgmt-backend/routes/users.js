const controller = require("../controllers/users");

const userRoutes = (router, API_PREFIX, authorize) => {
  router.post(API_PREFIX + "/users/add", controller.add);
  router.post(API_PREFIX + "/users/login", controller.login);
  router.get(API_PREFIX + "/me", authorize, controller.me);
};

module.exports = userRoutes;
