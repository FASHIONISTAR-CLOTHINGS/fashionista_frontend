"use server";
import { fetchWithAuth } from "@/lib/api/fetchAuth";
import {
  BasicInformationSchema,
  CategorySchema,
  GallerySchema,
  PricesSchema,
  SizesSchema,
  SpecificationSchema,
} from "@/features/product/builder/schemas";
import { redirect } from "next/navigation";








export const BasicInformationAction = async (formdata: FormData) => {
  const data = Object.fromEntries(formdata.entries());
  const validated = BasicInformationSchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  redirect("/vendor/products?step=prices");
};
export const PricesAction = async (formdata: FormData) => {
  const data = Object.fromEntries(formdata.entries());
  const validated = PricesSchema.safeParse(data);
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  redirect("/vendor/products?step=category");
};
export const CategoryAction = async (formdata: FormData) => {
  const data = Object.fromEntries(formdata.entries());
  const validated = CategorySchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  redirect("/vendor/products?step=gallery");
};
export const GalleryAction = async (formdata: FormData) => {
  const data = Object.fromEntries(formdata.entries());
  const validated = GallerySchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  redirect("/vendor/products?step=specification");
};
export const SpecificationAction = async (prev: unknown, formdata: FormData) => {
  void prev;
  const data = Object.fromEntries(formdata.entries());

  const specData = { specification: data };
  const validated = SpecificationSchema.safeParse(specData);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  redirect("/vendor/products?step=sizes");
};
export const SizesAction = async (prev: unknown, formdata: FormData) => {
  void prev;
  const newData = {
    sizes: {
      size: formdata.get("size"),
      price: formdata.get("size_price"),
    },
  };
  console.log(newData);
  const validated = SizesSchema.safeParse(newData);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }
  redirect("/vendor/products?step=color");
};

export const newProduct = async (formdata: FormData | object) => {
  void formdata;
};

export const deleteProduct = async (vendor_id: string, product_id: string) => {
  try {
    const res = await fetchWithAuth(
      `/vendor/product-delete/${vendor_id}/${product_id}`,
      "delete",
    );
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};

export const editProduct = async () => {
  return undefined;
};
