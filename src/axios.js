// axios
import axios from "axios";
import router from "@/router";
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
      router.push("/");
    }
    return error;
  }
);

export default request;
