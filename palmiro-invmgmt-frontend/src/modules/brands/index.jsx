import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
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
import BrandAddButton from "./add-btn";
import { getListBrandsError, getListBrandsSuccess, isRequestingListBrands } from "@state/brands/list/selectors";
import { listBrands, listBrandsError, listBrandsSuccess } from "@state/brands/list/slice";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import DocumentHead from "@components/document-head";

function Brands() {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingListBrands);
  const rows = useSelector(getListBrandsSuccess);
  const error = useSelector(getListBrandsError);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    dispatch(listBrands());
    try {
      const response = await api.get("/brands/list");
      dispatch(listBrandsSuccess(response.data.output));
    } catch (err) {
      dispatch(listBrandsError(defaultFormErrorHandler(err)));
    }
  };

  return (
    <>
      <DocumentHead title="Brands" />
      <AppBarTitle title="Brands" />
      <BrandAddButton refreshList={init} />
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Title>Brands</Title>
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
                    <TableCell>Sr. No</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, k) => (
                    <TableRow key={k}>
                      <TableCell>{k + 1}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell>{format(parseISO(row.created_at), "PPpp")}</TableCell>
                      <TableCell>{format(parseISO(row.updated_at), "PPpp")}</TableCell>
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

export default withLayout(Brands);
