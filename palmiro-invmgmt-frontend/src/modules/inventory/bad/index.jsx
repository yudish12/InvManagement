import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

import { withLayout } from "@layout/layout";
import AppBarTitle from "@components/app-bar-title";
import Title from "@components/title";
import BadInventoryAddButton from "./add-btn";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import { getListBadInventoryError, getListBadInventorySuccess, isRequestingListBadInventory } from "@state/inventory/bad/list/selectors";
import { listBadInventory, listBadInventoryError, listBadInventorySuccess } from "@state/inventory/bad/list/slice";
import DocumentHead from "@components/document-head";
import ReturnInventoryButton from "../return-inventory-button";
import InventoryRevertStatusToOutwardButton from "../revert-status-to-outward-btn";
import InventoryStatusChangeButton from "../inventory-status-change-btn";
import { inventoryStatusOptions } from "..";

function BadInventory() {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingListBadInventory);
  const rows = useSelector(getListBadInventorySuccess);
  const error = useSelector(getListBadInventoryError);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    dispatch(listBadInventory());
    try {
      const response = await api.get("/inventory/bad/list");
      dispatch(listBadInventorySuccess(response.data.output));
    } catch (err) {
      dispatch(listBadInventoryError(defaultFormErrorHandler(err)));
    }
  };

  const showRowActionButton = (row) => {
    const { status } = row;
    if (status === "outward") {
      return <ReturnInventoryButton serialNumber={row.serial_number} refreshList={init} />;
    }
    if (["return-pending", "return-intransit", "returned"].includes(status)) {
      return (
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <InventoryRevertStatusToOutwardButton serialNumber={row.serial_number} refreshList={init} />
          <InventoryStatusChangeButton serialNumber={row.serial_number} refreshList={init} status={row.status} />
        </Box>
      );
    }
    return false;
  };

  return (
    <>
      <DocumentHead title="Bad Inventory" />
      <AppBarTitle title="Bad Inventory" />
      <BadInventoryAddButton refreshList={init} />
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Title>Bad Inventory</Title>
          {requesting && <Loading />}
          {error?.code === "FORM_ERROR" && (
            <Alert sx={{ mt: 3 }} severity="error">
              {error?.message ? error.message : "Something went wrong"}
            </Alert>
          )}
          {Array.isArray(rows) && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Actions</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Part Code</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Purchase Order Inv Number</TableCell>
                    <TableCell>Sales Order Inv Number</TableCell>
                    <TableCell>Returned from Inv Number</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowKey) => (
                    <TableRow key={`${rowKey}`}>
                      <TableCell>{showRowActionButton(row)}</TableCell>
                      <TableCell>{row.serial_number}</TableCell>
                      <TableCell>{row.condition_reason}</TableCell>
                      <TableCell>{row.warehouse?.label}</TableCell>
                      <TableCell>{row.partcode?.code}</TableCell>
                      <TableCell>{row.brand?.label}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{inventoryStatusOptions[row.status] || "-"}</TableCell>
                      <TableCell>{row.purchase_order?.invoice_number || "-"}</TableCell>
                      <TableCell>{row.sale_order?.invoice_number || "-"}</TableCell>
                      <TableCell>{row.sale_order_returned?.invoice_number || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {!rows || rows.length < 1 ? (
                    <TableRow>
                      <TableCell colSpan={5}>No records found</TableCell>
                    </TableRow>
                  ) : (
                    false
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
    </>
  );
}

export default withLayout(BadInventory);
