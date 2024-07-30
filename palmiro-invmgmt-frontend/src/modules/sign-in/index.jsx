import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import axios from "axios";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";

import { getLoginError, getLoginSuccess, isRequestingLogin } from "@state/login/selectors";
import { login, loginError, loginInit, loginSuccess } from "@state/login/slice";
import { defaultFormErrorHandler, generateFormError } from "@utils/form-error-helper";
import API from "@utils/api";
import { userReceive } from "@state/user/slice";
import { setUserToken } from "@utils/token";

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://palmiro.com/">
        Palmiro Technologies
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignIn() {
  const dispatch = useDispatch();
  const initialState = {
    username: "",
    password: "",
  };
  const [formData, setFormData] = React.useState(initialState);
  const { username, password } = formData;
  const requesting = useSelector(isRequestingLogin);
  const success = useSelector(getLoginSuccess);
  const error = useSelector(getLoginError);

  const onChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginInit());
    const isValid = isFormValid();
    if (!isValid) {
      return;
    }
    dispatch(login());
    try {
      const response = await API.post("/users/login", formData);
      setUserToken(response.data.output.token);
      axios.defaults.headers.common["authtoken"] = response.data.output.token;
      dispatch(userReceive(response.data.output));
    } catch (err) {
      dispatch(loginError(defaultFormErrorHandler(err)));
    }
  };

  const isFormValid = () => {
    if (!username || !username.trim()) {
      dispatch(loginError(generateFormError("USERNAME_REQUIRED", "username", "Username is required field")));
      return false;
    }

    if (!password || !password.trim()) {
      dispatch(loginError(generateFormError("PASSWORD_REQUIRED", "password", "password is required field")));
      return false;
    }
    return true;
  };

  useEffect(() => {
    return () => {
      dispatch(loginInit());
    };
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoFocus
            value={username}
            onChange={onChange}
            error={error?.field === "username"}
            helperText={error?.field === "username" && error?.message}
            disabled={requesting}
            autoComplete="username"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
            error={error?.field === "password"}
            helperText={error?.field === "password" && error?.message}
            disabled={requesting}
          />
          {error?.code === "FORM_ERROR" && (
            <Alert sx={{ mt: 3 }} severity="error">
              {error?.message ? error.message : "Something went wrong"}
            </Alert>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={requesting}>
            Sign In
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
