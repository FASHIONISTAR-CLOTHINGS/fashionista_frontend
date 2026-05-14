import axios from "axios";
import { getSyncApiBaseUrl } from "@/core/config/api-roots";

export const axiosInstance = axios.create({
  baseURL: getSyncApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
