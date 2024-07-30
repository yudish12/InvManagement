import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";

import Title from "@components/title";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import {
  getDashboardInstockStatsError,
  getDashboardInstockStatsSuccess,
  isRequestingDashboardInstockStats,
} from "@state/dashboard/instock-stats/selectors";
import { dashboardInstockStats, dashboardInstockStatsError, dashboardInstockStatsSuccess } from "@state/dashboard/instock-stats/slice";

function DashboardInstockStats() {
  const [infoDialogData, setInfoDialogData] = useState({
    requesting: false,
    error: null,
    open: false,
    items: null,
  });
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingDashboardInstockStats);
  const stats = useSelector(getDashboardInstockStatsSuccess);
  const error = useSelector(getDashboardInstockStatsError);
  const [formData, setFormData] = useState({
    brand: null,
    model: null,
    desc: null,
    brandOptions: [],
    modelOptions: [],
    descOptions: [],
    partcodes: [],
    rows: null,
  });

  const { brand, model, desc, brandOptions, modelOptions, descOptions, partcodes, rows } = formData;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (Array.isArray(stats) && stats.length > 0) {
      const _rows = stats.filter((stat) => {
        if (brand && stat.brand?.label !== brand) {
          return false;
        }
        if (model && stat.partcode?.model !== model) {
          return false;
        }
        if (desc && stat.partcode?.desc !== desc) {
          return false;
        }
        return true;
      });
      const _brandOptions = [
        ...new Set(
          partcodes
            .filter((p) => {
              if (desc && p.desc !== desc) {
                return false;
              }
              if (model && p.model !== model) {
                return false;
              }
              return true;
            })
            .map((p) => p.brand)
        ),
      ];
      const _modelOptions = [
        ...new Set(
          partcodes
            .filter((p) => {
              if (brand && p.brand !== brand) {
                return false;
              }
              if (desc && p.desc !== desc) {
                return false;
              }
              return true;
            })
            .map((p) => p.model)
        ),
      ];
      const _descOptions = [
        ...new Set(
          partcodes
            .filter((p) => {
              if (brand && p.brand !== brand) {
                return false;
              }
              if (model && p.model !== model) {
                return false;
              }
              return true;
            })
            .map((p) => p.desc)
        ),
      ];

      setFormData((formData) => ({
        ...formData,
        brandOptions: _brandOptions,
        modelOptions: _modelOptions,
        descOptions: _descOptions,
        rows: _rows,
      }));
    }
  }, [brand, model, desc]);

  useEffect(() => {
    if (Array.isArray(stats) && stats.length > 0) {
      setFormItem("rows", stats);
      const _brandOptions = [];
      const _modelOptions = [];
      const _descOptions = [];
      const _partcodes = [];
      for (let i = 0; i < stats.length; i++) {
        if (stats[i].brand?.label && !_brandOptions.includes(stats[i].brand?.label)) {
          _brandOptions.push(stats[i].brand.label);
        }
        if (stats[i].partcode?.model && !_modelOptions.includes(stats[i].partcode?.model)) {
          _modelOptions.push(stats[i].partcode.model);
        }
        if (stats[i].partcode?.desc && !_descOptions.includes(stats[i].partcode?.desc)) {
          _descOptions.push(stats[i].partcode.desc);
        }
        _partcodes.push({
          brand: stats[i].brand.label,
          model: stats[i].partcode.model,
          desc: stats[i].partcode.desc,
        });
      }
      setFormData((formData) => ({
        ...formData,
        brandOptions: _brandOptions,
        modelOptions: _modelOptions,
        descOptions: _descOptions,
        partcodes: _partcodes,
      }));
    }
  }, [stats]);

  const init = async () => {
    dispatch(dashboardInstockStats());
    try {
      const response = await api.get("/dashboard/instock-stats");
      dispatch(dashboardInstockStatsSuccess(response.data.output));
    } catch (err) {
      dispatch(dashboardInstockStatsError(defaultFormErrorHandler(err)));
    }
  };

  const setFormItem = (itemName, itemValue) =>
    setFormData((formData) => ({
      ...formData,
      [itemName]: itemValue,
    }));

  const showStockInfo = (part_code, brand) => async (e) => {
    // Fetch data and show dialog
    try {
      setInfoDialogData((data) => ({ ...data, open: true, requesting: true }));
      const response = await api.post("/dashboard/instock-stats-single", { part_code, brand });
      setInfoDialogData((data) => ({ ...data, items: response.data.output, requesting: false, error: null }));
    } catch (err) {
      setInfoDialogData((data) => ({ ...data, items: null, requesting: false, error: defaultFormErrorHandler(err) }));
    }
  };

  const handleClose = () => {
    setInfoDialogData((data) => ({ ...data, open: false }));
  };

  const onChangeBrand = (value) => {
    setFormData((formData) => ({
      ...formData,
      brand: value,
      model: null,
      desc: null,
    }));
  };

  const onChangeModel = (value) => {
    let _brand = brand;
    if (value) {
      _brand = partcodes.find((e) => e.model === value).brand;
    }
    setFormData((formData) => ({
      ...formData,
      brand: _brand,
      model: value,
      desc: null,
    }));
  };

  const onChangeDesc = (value) => {
    let _brand = brand;
    let _model = model;
    if (value) {
      const obj = partcodes.find((e) => e.desc === value);
      _brand = obj.brand;
      _model = obj.model;
    }
    setFormData((formData) => ({
      ...formData,
      brand: _brand,
      model: _model,
      desc: value,
    }));
  };

  return (
    <>
      <Grid item xs={12}>
        <Title>Instock Stats</Title>
        {Array.isArray(stats) && stats.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="secondary">
              Filters
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", gap: "16px", mt: 2 }}>
              <Autocomplete
                value={brand}
                onChange={(event, newValue) => onChangeBrand(newValue)}
                id="brand-filter"
                options={brandOptions}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Filter By Brand" />}
              />
              <Autocomplete
                value={model}
                onChange={(event, newValue) => onChangeModel(newValue)}
                id="model-filter"
                options={modelOptions}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Filter By Model" />}
              />
              <Autocomplete
                value={desc}
                onChange={(event, newValue) => onChangeDesc(newValue)}
                id="desc-filter"
                options={descOptions}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Filter By Description" />}
              />
            </Box>
          </Paper>
        )}
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
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
                    <TableCell>Info</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Part code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Average Price</TableCell>
                    <TableCell>Finance Cost Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, k) => (
                    <TableRow key={k}>
                      <TableCell>
                        <Tooltip title="Check more information">
                          <IconButton onClick={showStockInfo(row.partcode._id, row.brand._id)}>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{row.brand?.label}</TableCell>
                      <TableCell>{row.partcode?.model}</TableCell>
                      <TableCell>{row.partcode?.code}</TableCell>
                      <TableCell>{row.partcode?.desc}</TableCell>
                      <TableCell>{row.count}</TableCell>
                      <TableCell>{parseFloat(String(row.averagePrice)).toFixed(2)}</TableCell>
                      <TableCell>{parseFloat(String(row.averageFinanceCostPrice)).toFixed(2)}</TableCell>
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
      <Dialog open={infoDialogData.open} onClose={handleClose} maxWidth="xl">
        <DialogTitle>Product Quantity Information</DialogTitle>
        {infoDialogData.requesting ? (
          <CircularProgress color="primary" size={20} />
        ) : (
          <>
            <DialogContent>
              <DialogContentText>Below are the details of the quantity available across different warehouses</DialogContentText>
              {Array.isArray(infoDialogData.items) && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Warehouse</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Part code</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Average Price</TableCell>
                        <TableCell>Finance Cost Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {infoDialogData.items.map((row, k) => (
                        <TableRow key={k}>
                          <TableCell>{row.warehouse.label}</TableCell>
                          <TableCell>{row.brand?.label}</TableCell>
                          <TableCell>{row.partcode?.model}</TableCell>
                          <TableCell>{row.partcode?.code}</TableCell>
                          <TableCell>{row.partcode?.desc}</TableCell>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>{parseFloat(String(row.averagePrice)).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(String(row.averageFinanceCostPrice)).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {!infoDialogData.items || infoDialogData.items.length < 1 ? (
                        <TableRow>
                          <TableCell colSpan={8}>No records found</TableCell>
                        </TableRow>
                      ) : (
                        false
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default DashboardInstockStats;
