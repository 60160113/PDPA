// axios
import axios from "axios";
import { authHeader } from "@/helpers/auth-header";

const request = axios.create({
  headers: authHeader()
});

request.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem("user");
      location.reload();
    }
    return error;
  }
);

export default request;
