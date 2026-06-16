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
  eager?: string;
  eager_async?: boolean;
  notification_url?: string;
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
    asset_type: folder,
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
  if (presigned.upload_preset) {
    formData.append("upload_preset", presigned.upload_preset);
  }
  if (presigned.eager) {
    formData.append("eager", presigned.eager);
  }
  if (presigned.eager_async !== undefined) {
    formData.append("eager_async", String(presigned.eager_async));
  }
  if (presigned.notification_url) {
    formData.append("notification_url", presigned.notification_url);
  }

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









// SkeletonCard uses a global keyframe. Add it once via style tag in VendorDashboardView.

function CloudinaryFileUploader({
  id,
  value,
  onChange,
  folder = "vendor_shop",
  placeholder = "Upload image",
  aspectRatio = "square",
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  aspectRatio?: "square" | "video";
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large (max 10MB).");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFile(file, folder, "image", (event) => {
        setProgress(event.percentage);
      });
      onChange(result.secure_url);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const triggerSelect = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-1 w-full">
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={triggerSelect}
        className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all ${
          aspectRatio === "video" ? "aspect-[21/9] w-full" : "aspect-square w-full md:max-w-[200px]"
        } ${
          isUploading
            ? "border-[#FDA600]/40 bg-[#FDA600]/5"
            : error
            ? "border-red-300 bg-red-50/50 hover:border-red-400"
            : value
            ? "border-emerald-300 bg-emerald-50/10 hover:border-[#FDA600]/40"
            : "border-[#D9D9D9] bg-[#FAFAF8] hover:border-[#FDA600]/50 hover:bg-white"
        }`}
      >
        {value ? (
          <>
            <FashionistarImage
              src={value}
              alt="Uploaded preview"
              fill={true}
              objectFit="cover"
              imgClassName="transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); triggerSelect(); }}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition hover:bg-[#FDA600] h-auto min-h-0 cursor-pointer"
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={removeFile}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 h-auto min-h-0 cursor-pointer border-none"
                >
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#FDA600] transition-all duration-300"
                  strokeDasharray={`${progress}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-xs font-bold text-[#1A1208]">{progress}%</span>
            </div>
            <p className="mt-3 text-xs font-semibold text-[#1A1208]">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600] transition group-hover:bg-[#FDA600]/20">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1A1208]">{placeholder}</p>
            <p className="mt-1 text-xs text-[#7A6B44]">Drag & drop or click</p>
          </div>
        )}

        {value && !isUploading && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1 text-white shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <XCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}


