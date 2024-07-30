import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import LaptopIcon from "@mui/icons-material/Laptop";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { Link } from "react-router-dom";
import { logoutUser } from "@utils/token";
import store from "@state/store";

export const MainListItems = () => {
  const username = store.getState().user?.data?.username;

  return (
    <React.Fragment>
      <ListItemButton LinkComponent={Link} to="/">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      {["admin"].includes(username) && (
        <>
          <ListItemButton LinkComponent={Link} to="/orders">
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItemButton>
          <ListItemButton LinkComponent={Link} to="/partcodes">
            <ListItemIcon>
              <SettingsSuggestIcon />
            </ListItemIcon>
            <ListItemText primary="Part Codes" />
          </ListItemButton>
          <ListItemButton LinkComponent={Link} to="/inventory">
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Inventory" />
          </ListItemButton>
          <ListItemButton LinkComponent={Link} to="/inventory/bad">
            <ListItemIcon>
              <DoNotDisturbOnIcon />
            </ListItemIcon>
            <ListItemText primary="Bad Inventory" />
          </ListItemButton>
          <ListItemButton LinkComponent={Link} to="/brands">
            <ListItemIcon>
              <LaptopIcon />
            </ListItemIcon>
            <ListItemText primary="Brands" />
          </ListItemButton>
          <ListItemButton LinkComponent={Link} to="/warehouses">
            <ListItemIcon>
              <WarehouseIcon />
            </ListItemIcon>
            <ListItemText primary="Warehouses" />
          </ListItemButton>
        </>
      )}
    </React.Fragment>
  );
};

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Saved reports
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItemButton>
  </React.Fragment>
);

const onClickLogout = () => {
  logoutUser();
};

export const logoutItem = (
  <ListItemButton onClick={onClickLogout}>
    <ListItemIcon>
      <LogoutIcon />
    </ListItemIcon>
    <ListItemText primary="Logout" />
  </ListItemButton>
);
