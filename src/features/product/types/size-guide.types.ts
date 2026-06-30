// features/product/types/size-guide.types.ts
// TypeScript types for ProductSizeAndMeasurementGuide

export interface SizeGuide {
  id: string;
  name: string;
  description: string;
  size_label: string;
  chest_cm: string;
  waist_cm: string;
  hip_cm: string;
  length_cm: string;
  shoulder_cm: string;
  sleeve_cm: string;
  inseam_cm: string;
  foot_length_cm: string;
  sort_order: number;
  is_default: boolean;
  save_as_template: boolean;
  vendor_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SizeGuideCreatePayload {
  name: string;
  description?: string;
  size_label?: string;
  chest_cm?: string;
  waist_cm?: string;
  hip_cm?: string;
  length_cm?: string;
  shoulder_cm?: string;
  sleeve_cm?: string;
  inseam_cm?: string;
  foot_length_cm?: string;
  sort_order?: number;
  is_default?: boolean;
  save_as_template?: boolean;
}

/** Client measurement overlay — guide row + personal measurement data. */
export interface ClientMeasurements {
  chest_cm?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  shoulder_cm?: number | null;
  sleeve_length_cm?: number | null;
  inseam_cm?: number | null;
  height_cm?: number | null;
}

export interface ClientMeasurementOverlay {
  guide: SizeGuide;
  client_measurements: ClientMeasurements | null;
}
