"use server";

import { z } from "zod";
import { fetchWithAuth } from "../utils/fetchAuth";
const schema = z.object({});

export const getAllCollections = async () => {
  try {
    const res = await fetchWithAuth("/collections/");
    console.log(res);
    return res || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const newCollection = async (formdata: FormData) => {
  const data = Object.fromEntries(formdata.entries());
  const validated = schema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  try {
    const res = await fetchWithAuth("/collections/", "post", formdata);
    console.log(res);
    return { success: true, data: res };
  } catch (error) {
    console.log(error);
    return { errors: { server: ["Failed to create collection"] } };
  }
};
