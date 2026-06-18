import { describe, expect, it } from "vitest";
import {
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  ProductBuilderFormSchema,
} from "@/features/product/builder/schemas/builder.schemas";

describe("Product Builder Schemas", () => {
  describe("Step 1: Info & Specs Schema", () => {
    it("validates valid basic details", () => {
      const payload = {
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        sub_category_ids: ["019ec340-d004-7c36-a640-ebfcf52b11e8"],
        gender_target: "men",
        age_group: "adult",
      };

      const parsed = Step1Schema.parse(payload);
      expect(parsed.title).toBe("Classic Agbada Ensemble");
      expect(parsed.condition).toBe("new");
      expect(parsed.gender_target).toBe("men");
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

  describe("Step 2: Pricing, Sizing & Fabric Schema", () => {
    it("validates valid sizing parameters, fabric details, price and stock", () => {
      const payload = {
        price: "15000.00",
        old_price: "20000.00",
        stock_qty: 10,
        requires_measurement: true,
        is_customisable: false,
        measurement_guide: [
          {
            size_label: "XL",
            chest_cm: "120",
            waist_cm: "110",
          }
        ],
        fabric_type: "Damask",
        fabric_care_instructions: "dry_clean",
        fabric_is_organic: false,
        fabric_is_vegan: false,
        fabric_country_of_origin: "Nigeria",
      };

      const parsed = Step2Schema.parse(payload);
      expect(parsed.requires_measurement).toBe(true);
      expect(parsed.fabric_type).toBe("Damask");
      expect(parsed.price).toBe("15000.00");
    });

    it("fails when old_price is less than price", () => {
      const payload = {
        price: "15000.00",
        old_price: "12000.00",
        stock_qty: 10,
        requires_measurement: false,
        fabric_type: "",
      };

      const result = Step2Schema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Original price must be higher");
      }
    });
  });

  describe("Step 3: Media & Gallery Schema", () => {
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

      const parsed = Step3Schema.parse(payload);
      expect(parsed.cover_image_public_id).toBe("cloudinary_public_id_123");
      expect(parsed.gallery).toHaveLength(1);
    });
  });

  describe("Step 4: Shipping Schema", () => {
    it("validates shipping details", () => {
      const payload = {
        weight_kg: "1.5",
        shipping_amount: "2000.00",
        courier_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
      };

      const parsed = Step4Schema.parse(payload);
      expect(parsed.weight_kg).toBe("1.5");
      expect(parsed.shipping_amount).toBe("2000.00");
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
        meta_title: "Custom Agbada",
        meta_description: "Order your custom agbada now.",
      };

      const parsed = Step5Schema.parse(payload);
      expect(parsed.publish_intent).toBe("pending");
      expect(parsed.faqs).toHaveLength(2);
    });
  });

  describe("ProductBuilderFormSchema (Composite)", () => {
    it("validates complete form data successfully", () => {
      const payload = {
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        sub_category_ids: [],
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
        gallery: [],

        price: "15000.00",
        old_price: "20000.00",
        currency: "NGN",
        stock_qty: 10,
        max_stock: null,
        weight_kg: "",
        shipping_amount: "",
        courier_id: null,

        faqs: [],
        publish_intent: "pending",
        featured: false,
        hot_deal: false,
        meta_title: "",
        meta_description: "",
      };

      const result = ProductBuilderFormSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
