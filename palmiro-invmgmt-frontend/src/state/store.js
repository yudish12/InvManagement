import { configureStore } from "@reduxjs/toolkit";

import login from "./login/slice";
import user from "./user/slice";
import commonAdd from "./common/add/slice";
import partCodeList from "./partcode/list/slice";
import brandsList from "./brands/list/slice";
import inventoryList from "./inventory/list/slice";
import warehousesList from "./warehouses/list/slice";
import ordersList from "./orders/list/slice";
import badInventoryList from "./inventory/bad/list/slice";
import dashboardInstockStats from "./dashboard/instock-stats/slice";
import dashboardCalcFinanceCost from "./dashboard/calculate-finance-cost/slice";
import deleteOrder from "./orders/delete/slice";

export default configureStore({
  reducer: {
    login,
    user,
    commonAdd,
    partCodeList,
    brandsList,
    inventoryList,
    warehousesList,
    ordersList,
    badInventoryList,
    dashboardInstockStats,
    dashboardCalcFinanceCost,
    deleteOrder,
  },
});
