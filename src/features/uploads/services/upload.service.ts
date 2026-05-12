/**
 * Upload Service — Cloudinary Presigned Upload Integration
 *
 * Flow:
 *  1. Frontend requests a signed token from backend → POST /api/v1/upload/presign/
 *  2. Backend (Django common/views.py) verifies JWT, generates Cloudinary signature
 *  3. Frontend uploads directly to Cloudinary using the presigned data
 *  4. Cloudinary fires webhook → backend POST /api/v1/upload/webhook/cloudinary/
 *
 * No raw API key exposed to browser. Secure, HMAC-signed flow.
 */
import { apiSync } from "@/core/api/client.sync";
import { COMMON_ENDPOINTS } from "@/core/constants/api.constants";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PresignedUploadData {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  upload_preset: string;
  folder: string;
  resource_type: "image" | "video" | "auto" | "raw";
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  folder: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
/**
 * Step 1: Get presigned upload token from Django backend.
 * Requires JWT authentication (handled by apiSync interceptor).
 *
 * @param folder - Cloudinary folder path (e.g. 'products', 'avatars', 'brands')
 * @param resourceType - 'image' | 'video' | 'auto'
 */
export async function getPresignedToken(
  folder: string,
  resourceType: "image" | "video" | "auto" = "image",
): Promise<PresignedUploadData> {
  const { data } = await apiSync.post(COMMON_ENDPOINTS.UPLOAD_PRESIGN, {
    folder,
    resource_type: resourceType,
  });
  return data as PresignedUploadData;
}

/**
 * Step 2: Upload file directly to Cloudinary using presigned data.
 * No API secret exposed — uses server-generated signature.
 *
 * @param file - The file to upload
 * @param presigned - Presigned data from getPresignedToken()
 * @param onProgress - Optional progress callback
 */
export async function uploadToCloudinary(
  file: File,
  presigned: PresignedUploadData,
  onProgress?: (event: UploadProgressEvent) => void,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", presigned.signature);
  formData.append("timestamp", String(presigned.timestamp));
  formData.append("api_key", presigned.api_key);
  formData.append("folder", presigned.folder);
  formData.append("upload_preset", presigned.upload_preset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${presigned.cloud_name}/${presigned.resource_type}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    // Track upload progress
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult);
      } else {
        reject(
          new Error(
            `Cloudinary upload failed: ${xhr.status} ${xhr.responseText}`,
          ),
        );
      }
    };

    xhr.onerror = () =>
      reject(new Error("Network error during Cloudinary upload"));
    xhr.send(formData);
  });
}

/**
 * Convenience: Get presigned token + upload in one call.
 * Ideal for simple drag-and-drop upload components.
 */
export async function uploadFile(
  file: File,
  folder: string = "general",
  resourceType: "image" | "video" | "auto" = "image",
  onProgress?: (event: UploadProgressEvent) => void,
): Promise<CloudinaryUploadResult> {
  const presigned = await getPresignedToken(folder, resourceType);
  return uploadToCloudinary(file, presigned, onProgress);
}
