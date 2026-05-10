import { cookies } from "next/headers";
import axios from "axios";
import axiosInstance from "./axiosInstance";

export const fetchWithAuth = async (
  url: string,
  method: "get" | "post" | "put" | "delete" | "patch" = "get",
  data: null | object | FormData = null,
  content = "application/json",
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  try {
    const response = await axiosInstance({
      url,
      method,
      withCredentials: true,
      headers: {
        "Content-type": content,
        Authorization: `Bearer ${accessToken}`,
      },
      data,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        const refreshResponse = await axiosInstance.post("/auth/refresh", {
          refresh: refreshToken,
        });
        const newAccessToken = refreshResponse.data.access;
        try {
          const retryResponse = await axiosInstance({
            method,
            url,
            headers: { Authorization: `Bearer ${newAccessToken}` },
            data,
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error("Retry error:", retryError);
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        throw refreshError;
      }
    }
    throw error;
  }
};

export default fetchWithAuth;
