import { fetchWithAuth } from "./fetchAuth";
import { vendor } from "./mock";
import { axiosInstance } from "./axiosInstance";
import { VendorProp } from "@/types";

export const getVendor = async () => {
  try {
    const vendorData = await fetchWithAuth("/vendor/dashboard");
    return vendorData;
  } catch (error) {
    console.error(error);
    console.log(vendor);
    return null;
  }
};

export const getVendorOrders = async () => {
  try {
    const orders = await fetchWithAuth("/vendor/orders/");
    return orders;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSingleOrder = async (order_oid: string) => {
  try {
    const order = await fetchWithAuth(`/vendor/orders/${order_oid}`);
    return order;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const orderAcceptReject = async (
  order_oid: string,
  data: { notification_type: string }
) => {
  try {
    const res = await fetchWithAuth(`/vendor/orders/${order_oid}`, "get", data);
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Unprotected list of vendors
export const getAllProducts = async () => {
  try {
    const products = await fetchWithAuth("/vendor/products");
    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createNewProduct = async (formdata: object | FormData) => {
  try {
    const res = await fetchWithAuth("/vendor/product-create", "post", formdata);
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllVendors = async () => {
  try {
    const vendors = await axiosInstance("/vendors/");
    return (vendors.data as VendorProp[]) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
