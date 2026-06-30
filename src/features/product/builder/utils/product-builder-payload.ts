import type { CreateProductInput } from "../../types/product.types";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";

type ProductBuilderWritePayload = CreateProductInput & {
  cover_image_public_id?: string;
  cover_image_url?: string | null;
  cover_image_sku?: string;
  cover_image_color_name?: string;
  cover_image_color_hex?: string;
  cover_image_size_id?: string | null;
  gallery?: ProductBuilderFormValues["gallery"];
  weight_kg?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  dimensions_cm?: Record<string, unknown> | null;
  is_fragile?: boolean;
  requires_signature?: boolean;
  processing_days?: number;
  faqs?: ProductBuilderFormValues["faqs"];
  publish_intent?: ProductBuilderFormValues["publish_intent"];
};

function emptyToNull(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

export function buildProductWritePayload(
  values: ProductBuilderFormValues,
  idempotencyKey?: string | null,
): ProductBuilderWritePayload {
  const payload: ProductBuilderWritePayload = {
    title: values.title,
    description: values.description,
    price: values.price,
    old_price: emptyToNull(values.old_price),
    currency: values.currency || "NGN",
    stock_qty: Number(values.stock_qty || 0),
    category_ids: values.category_ids,
    requires_measurement: Boolean(values.requires_measurement),
    is_customisable: Boolean(values.is_customisable),
    cash_payment_mode: values.cash_payment_mode,
    is_pre_order: Boolean(values.is_pre_order),
    pre_order_date: values.is_pre_order ? emptyToNull(values.pre_order_date) : null,
    condition: values.condition,
    age_group: values.age_group || "",
    gender_target: values.gender_target || "",
    featured: Boolean(values.featured),
    hot_deal: Boolean(values.hot_deal),
    status: values.publish_intent === "pending" ? "pending" : "draft",
    publish_intent: values.publish_intent,
    cover_image_public_id: values.cover_image_public_id,
    cover_image_url: values.cover_image_url ?? null,
    cover_image_sku: values.cover_image_sku || "",
    cover_image_color_name: values.cover_image_color_name || "",
    cover_image_color_hex: values.cover_image_color_hex || "",
    cover_image_size_id: values.cover_image_size_id ?? null,
    gallery: values.gallery ?? [],
    fabric: values.fabric_type
      ? {
          fabric_type: values.fabric_type,
          care_instructions: values.fabric_care_instructions,
          is_organic: Boolean(values.fabric_is_organic),
          is_vegan: Boolean(values.fabric_is_vegan),
          country_of_origin: values.fabric_country_of_origin || "",
        }
      : null,
    weight_kg: values.weight_kg || "",
    length_cm: Number(values.length_cm || 0),
    width_cm: Number(values.width_cm || 0),
    height_cm: Number(values.height_cm || 0),
    dimensions_cm: values.dimensions_cm ?? null,
    is_fragile: Boolean(values.is_fragile),
    requires_signature: Boolean(values.requires_signature),
    processing_days: Number(values.processing_days || 1),
    courier_id: values.courier_id ?? null,
    faqs: values.faqs ?? [],
  };

  if (idempotencyKey) {
    payload.idempotency_key = idempotencyKey;
  }

  return payload;
}
