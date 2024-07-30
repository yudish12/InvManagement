import axios from "axios";
import config from "../config";
// const API_URL = "http://localhost:5001/api/v1";

const get = (path) => {
  return axios.get(config.API_URI + path);
};

const post = (path, body) => {
  return axios.post(config.API_URI + path, body);
};

export default {
  get,
  post,
};
