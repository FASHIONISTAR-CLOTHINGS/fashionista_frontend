import { describe, expect, it } from "vitest";
import {
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  ProductBuilderFormSchema,
  BUILDER_STEPS,
} from "@/features/product/builder/schemas/builder.schemas";
import { buildProductWritePayload } from "@/features/product/builder/utils/product-builder-payload";

describe("Product Builder Schemas", () => {
  describe("Step 1: Info & Specs Schema", () => {
    it("validates valid basic details", () => {
      const payload = {
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        gender_target: "men",
        age_group: "adult",
      };

      const parsed = Step1Schema.parse(payload);
      expect(parsed.title).toBe("Classic Agbada Ensemble");
      expect(parsed.condition).toBe("new");
      expect(parsed.gender_target).toBe("men");
      expect("sub_category_ids" in parsed).toBe(false);
    });

    it("fails when title is too short", () => {
      const payload = {
        title: "Agb",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
      };

      const result = Step1Schema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 5 characters");
      }
    });
  });

  describe("Step 2: Media & Mapping Schema", () => {
    it("validates cover image and gallery uploads", () => {
      const payload = {
        cover_image_public_id: "cloudinary_public_id_123",
        cover_image_url: "https://res.cloudinary.com/test/image/upload/v1234/test.jpg",
        gallery: [
          {
            public_id: "gallery_id_1",
            secure_url: "https://res.cloudinary.com/test/image/upload/v1234/gallery1.jpg",
            media_type: "image",
            ordering: 0,
          }
        ]
      };

      const parsed = Step2Schema.parse(payload);
      expect(parsed.cover_image_public_id).toBe("cloudinary_public_id_123");
      expect(parsed.gallery).toHaveLength(1);
    });

    it("keeps media mapping color-only at Step 2", () => {
      const payload = {
        cover_image_public_id: "cloudinary_public_id_123",
        cover_image_url: "https://res.cloudinary.com/test/image/upload/v1234/test.jpg",
        cover_image_color_name: "Bottle Green",
        cover_image_color_hex: "#006A4E",
        cover_image_size_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
        gallery: [
          {
            public_id: "gallery_id_1",
            secure_url: "https://res.cloudinary.com/test/image/upload/v1234/gallery1.jpg",
            media_type: "image",
            ordering: 0,
            color_name: "Gold",
            color_hex: "#FDA600",
            size_id: "019ec340-d004-7c36-a640-ebfcf52b11e8",
          },
        ],
      };

      const parsed = Step2Schema.parse(payload);
      expect("cover_image_size_id" in parsed).toBe(false);
      expect("size_id" in parsed.gallery[0]).toBe(false);
    });

    it("fails without a cover image", () => {
      const payload = {
        cover_image_public_id: "",
        cover_image_url: "https://res.cloudinary.com/test/image/upload/v1234/test.jpg",
        gallery: [],
      };

      const result = Step2Schema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cover image is required");
      }
    });
  });

  describe("Step 3: Pricing, Sizing & Fabric Schema", () => {
    it("validates valid sizing parameters, fabric details, price and stock", () => {
      const payload = {
        price: "15000.00",
        old_price: "20000.00",
        stock_qty: 10,
        cover_image_size_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
        requires_measurement: true,
        is_customisable: false,
        fabric_type: "Damask",
        fabric_care_instructions: "dry_clean",
        fabric_is_organic: false,
        fabric_is_vegan: false,
        fabric_country_of_origin: "Nigeria",
      };

      const parsed = Step3Schema.parse(payload);
      expect(parsed.requires_measurement).toBe(true);
      expect(parsed.fabric_type).toBe("Damask");
      expect(parsed.price).toBe("15000.00");
      expect(parsed.cover_image_size_id).toBe("019ec340-cfc0-7383-b75e-350d09e7b807");
    });

    it("fails when old_price is less than price", () => {
      const payload = {
        price: "15000.00",
        old_price: "12000.00",
        stock_qty: 10,
        requires_measurement: false,
        fabric_type: "",
      };

      const result = Step3Schema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Original price must be higher");
      }
    });

    it("requires pre-order availability date to be at least 3 days away", () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 1);
      const payload = {
        price: "15000.00",
        old_price: "",
        stock_qty: 10,
        is_pre_order: true,
        pre_order_date: soon.toISOString().slice(0, 10),
        requires_measurement: false,
        fabric_type: "",
      };

      const result = Step3Schema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 days");
      }
    });
  });

  describe("Step 4: Shipping Schema", () => {
    it("validates shipping details", () => {
      const payload = {
        weight_kg: "1.5",
        length_cm: 10,
        width_cm: 20,
        height_cm: 5,
        processing_days: 3,
        courier_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
      };

      const parsed = Step4Schema.parse(payload);
      expect(parsed.weight_kg).toBe("1.5");
      expect("shipping_amount" in parsed).toBe(false);
      expect("free_shipping_threshold" in parsed).toBe(false);
    });
  });

  describe("Step 5: FAQs & Publish Schema", () => {
    it("validates FAQs and publishing flags", () => {
      const payload = {
        faqs: [
          { question: "Question 1", answer: "Answer 1 detailed response" },
          { question: "Question 2", answer: "Answer 2 detailed response" }
        ],
        publish_intent: "pending",
        featured: false,
        hot_deal: true,
      };

      const parsed = Step5Schema.parse(payload);
      expect(parsed.publish_intent).toBe("pending");
      expect(parsed.faqs).toHaveLength(2);
      expect("meta_title" in parsed).toBe(false);
    });
  });

  describe("ProductBuilderFormSchema (Composite)", () => {
    it("validates complete form data successfully", () => {
      const payload = {
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        tag_ids: [],
        specifications: [],
        gender_target: "",
        age_group: "",
        
        requires_measurement: false,
        is_customisable: false,
        measurement_template: null,
        measurement_guide: [],
        fabric_type: "",
        fabric_composition: [],
        fabric_care_instructions: "machine_wash",
        fabric_care_notes: "",
        fabric_is_organic: false,
        fabric_is_vegan: false,
        fabric_country_of_origin: "",

        cover_image_public_id: "cloudinary_id",
        cover_image_url: "https://res.cloudinary.com/test/test.jpg",
        cover_image_size_id: null,
        gallery: [],

        price: "15000.00",
        old_price: "20000.00",
        currency: "NGN",
        stock_qty: 10,
        weight_kg: "",
        courier_id: null,

        faqs: [],
        publish_intent: "pending",
        featured: false,
        hot_deal: false,
      };

      const result = ProductBuilderFormSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("builds a sanitized backend payload without removed vendor-builder fields", () => {
      const payload = ProductBuilderFormSchema.parse({
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        gender_target: "men",
        age_group: "adult",
        cover_image_public_id: "cloudinary_id",
        cover_image_url: "https://res.cloudinary.com/test/test.jpg",
        cover_image_color_name: "Bottle Green",
        cover_image_color_hex: "#006A4E",
        cover_image_size_id: "019ec340-d004-7c36-a640-ebfcf52b11e8",
        gallery: [],
        price: "15000.00",
        old_price: "20000.00",
        currency: "NGN",
        stock_qty: 10,
        cash_payment_mode: "disabled",
        requires_measurement: false,
        is_customisable: false,
        fabric_type: "",
        fabric_care_instructions: "machine_wash",
        fabric_is_organic: false,
        fabric_is_vegan: false,
        fabric_country_of_origin: "",
        weight_kg: "1.5",
        length_cm: 10,
        width_cm: 20,
        height_cm: 5,
        processing_days: 3,
        courier_id: null,
        faqs: [],
        publish_intent: "pending",
        featured: false,
        hot_deal: false,
      });

      const mapped = buildProductWritePayload(payload, "019ec340-cfc0-7383-b75e-350d09e7b807");
      expect(mapped).not.toHaveProperty("sub_category_ids");
      expect(mapped).not.toHaveProperty("max_stock");
      expect(mapped).not.toHaveProperty("shipping_amount");
      expect(mapped).not.toHaveProperty("free_shipping_threshold");
      expect(mapped).not.toHaveProperty("meta_title");
      expect(mapped).not.toHaveProperty("meta_description");
      expect(mapped.cover_image_size_id).toBe("019ec340-d004-7c36-a640-ebfcf52b11e8");
      expect(mapped.idempotency_key).toBe("019ec340-cfc0-7383-b75e-350d09e7b807");
    });
  });

  describe("Builder step metadata", () => {
    it("keeps Step 2 as media and Step 3 as pricing", () => {
      expect(BUILDER_STEPS[1]).toMatchObject({
        step: 2,
        label: "Media & Mapping",
      });
      expect(BUILDER_STEPS[2]).toMatchObject({
        step: 3,
        label: "Pricing & Measurements",
      });
    });
  });
});
