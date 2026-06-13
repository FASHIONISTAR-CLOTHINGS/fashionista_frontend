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
    it("validates valid basic details and specifications", () => {
      const payload = {
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        sub_category_ids: ["019ec340-d004-7c36-a640-ebfcf52b11e8"],
        tag_ids: [],
        specifications: [
          { title: "Material", content: "Senegalese Cotton" },
          { title: "Embroidery Style", content: "Chain stitch" }
        ],
      };

      const parsed = Step1Schema.parse(payload);
      expect(parsed.title).toBe("Classic Agbada Ensemble");
      expect(parsed.condition).toBe("new");
      expect(parsed.specifications).toHaveLength(2);
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

  describe("Step 2: Sizing & Fabric Schema", () => {
    it("validates valid sizing parameters and fabric details", () => {
      const payload = {
        size_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        color_ids: ["019ec340-d004-7c36-a640-ebfcf52b11e8"],
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
        fabric_composition: [
          { material: "Silk", percentage: 60 },
          { material: "Cotton", percentage: 40 }
        ],
        fabric_care_instructions: "dry_clean",
        fabric_care_notes: "Gentle dry clean only",
      };

      const parsed = Step2Schema.parse(payload);
      expect(parsed.requires_measurement).toBe(true);
      expect(parsed.fabric_type).toBe("Damask");
      expect(parsed.fabric_composition).toHaveLength(2);
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

  describe("Step 4: Pricing & SKUs Schema", () => {
    it("validates pricing and variants", () => {
      const payload = {
        price: "15000.00",
        old_price: "20000.00",
        currency: "NGN",
        stock_qty: 10,
        weight_kg: "1.5",
        variants: [
          {
            size_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
            color_id: "019ec340-d004-7c36-a640-ebfcf52b11e8",
            price_override: "16000.00",
            stock_qty: 5,
            sku: "VAR-XL-BLUE-001",
            is_active: true,
            is_default: true,
            notes: "Classic cut",
          }
        ]
      };

      const parsed = Step4Schema.parse(payload);
      expect(parsed.price).toBe("15000.00");
      expect(parsed.variants[0].sku).toBe("VAR-XL-BLUE-001");
    });

    it("fails when old_price is less than price", () => {
      const payload = {
        price: "15000.00",
        old_price: "12000.00",
        currency: "NGN",
        stock_qty: 10,
        variants: []
      };

      const result = Step4Schema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("higher than the current price");
      }
    });
  });

  describe("Step 5: FAQs & Publish Schema", () => {
    it("validates FAQs and publishing flags", () => {
      const payload = {
        faqs: [
          { question: "Is this dry clean only?", answer: "Yes, we recommend dry cleaning for fabric longevity." }
        ],
        publish_intent: "pending",
        featured: false,
        hot_deal: true,
        meta_title: "Custom Agbada",
        meta_description: "Order your custom agbada now.",
      };

      const parsed = Step5Schema.parse(payload);
      expect(parsed.publish_intent).toBe("pending");
      expect(parsed.faqs).toHaveLength(1);
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
        
        size_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        color_ids: ["019ec340-d004-7c36-a640-ebfcf52b11e8"],
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
        variants: [
          {
            size_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
            color_id: "019ec340-d004-7c36-a640-ebfcf52b11e8",
            price_override: "",
            stock_qty: 5,
            sku: "",
            is_active: true,
            is_default: false,
            notes: "",
          }
        ],

        faqs: [],
        publish_intent: "pending",
        featured: false,
        hot_deal: false,
        digital: false,
        meta_title: "",
        meta_description: "",
        age_group: "",
        gender_target: "",
      };

      const result = ProductBuilderFormSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("fails when total variant stock exceeds main product stock", () => {
      const payload = {
        title: "Classic Agbada Ensemble",
        description: "A premium hand-made three-piece agbada for weddings and formal events.",
        condition: "new",
        category_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        sub_category_ids: [],
        tag_ids: [],
        specifications: [],
        
        size_ids: ["019ec340-cfc0-7383-b75e-350d09e7b807"],
        color_ids: ["019ec340-d004-7c36-a640-ebfcf52b11e8"],
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
        old_price: "",
        currency: "NGN",
        stock_qty: 10,
        max_stock: null,
        weight_kg: "",
        shipping_amount: "",
        courier_id: null,
        variants: [
          {
            size_id: "019ec340-cfc0-7383-b75e-350d09e7b807",
            color_id: "019ec340-d004-7c36-a640-ebfcf52b11e8",
            price_override: "",
            stock_qty: 12, // 12 > 10
            sku: "",
            is_active: true,
            is_default: false,
            notes: "",
          }
        ],

        faqs: [],
        publish_intent: "pending",
        featured: false,
        hot_deal: false,
        digital: false,
        meta_title: "",
        meta_description: "",
        age_group: "",
        gender_target: "",
      };

      const result = ProductBuilderFormSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("exceeds product stock");
      }
    });
  });
});
