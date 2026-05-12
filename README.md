This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

## Cloudinary Media Uploads

> **Version** 2026-03-16 · **Backend API** Django 6.0.2 · **Pattern** Two-Phase Direct Upload

Fashionistar uses a **two-phase direct-upload** pattern for all media (avatars, product images, brand logos, gallery photos, etc.). Files are uploaded **directly from the browser to Cloudinary** — they never pass through the Django server. This eliminates RAM/bandwidth pressure on the backend and enables sub-second upload completions.

### How It Works (High-Level)

```
Frontend                  Django Backend              Cloudinary
   │                           │                          │
   │ POST /api/v1/upload/presign/                         │
   │ { asset_type: "avatar" }  │                          │
   │ ─────────────────────────►│                          │
   │ ◄─────────────────────────│                          │
   │ { signature, timestamp,   │                          │
   │   api_key, public_id,     │                          │
   │   folder, cloud_name }    │                          │
   │                           │                          │
   │ POST https://api.cloudinary.com/v1_1/{cloud}/upload  │
   │ FormData: { file, signature, timestamp, public_id }  │
   │ ───────────────────────────────────────────────────► │
   │ ◄─────────────────────────────────────────────────── │
   │ { secure_url, public_id, ... }                       │
   │                           │                          │
   │                           │ ◄── Webhook notification │
   │                           │    /api/v1/upload/webhook/cloudinary/
   │                           │ [Celery task updates model field]
```

### Step 1 — Request a Presign Token

```typescript
// src/lib/cloudinary.ts

export interface PresignResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  public_id: string;
  folder: string;
  cloud_name: string;
  asset_type: string;
}

export async function getPresignToken(
  assetType: string,  // 'avatar' | 'product_image' | 'brand_logo' | 'gallery_image' | ...
  accessToken: string
): Promise<PresignResponse> {
  const res = await fetch('/api/v1/upload/presign/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ asset_type: assetType }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Presign request failed');
  }

  return res.json();
}
```

### Step 2 — Upload Directly to Cloudinary

```typescript
// src/lib/cloudinary.ts (continued)

export async function uploadToCloudinary(
  file: File,
  presign: PresignResponse,
  onProgress?: (percent: number) => void
): Promise<{ secure_url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', presign.signature);
  formData.append('timestamp', String(presign.timestamp));
  formData.append('api_key', presign.api_key);
  formData.append('public_id', presign.public_id);
  formData.append('folder', presign.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${presign.cloud_name}/image/upload`);
    xhr.send(formData);
  });
}
```

### Step 3 — Combine Into a Single Upload Function

```typescript
// src/lib/cloudinary.ts (continued)

export async function uploadMedia(
  file: File,
  assetType: string,
  accessToken: string,
  onProgress?: (percent: number) => void
): Promise<{ secure_url: string; public_id: string }> {
  // Phase 1: get presign token from Django backend
  const presign = await getPresignToken(assetType, accessToken);

  // Phase 2: upload directly to Cloudinary
  const result = await uploadToCloudinary(file, presign, onProgress);

  // The backend receives a webhook from Cloudinary automatically
  // and updates the model field. No further action needed.
  return result;
}
```

### Step 4 — Use in React Components

#### Avatar Upload Component (Sync + Progress Bar)

```tsx
// src/components/AvatarUpload.tsx
'use client';

import { useState } from 'react';
import { uploadMedia } from '@/lib/cloudinary';

interface AvatarUploadProps {
  userId: string;
  accessToken: string;
  onUploadComplete?: (secureUrl: string) => void;
}

export function AvatarUpload({ userId, accessToken, onUploadComplete }: AvatarUploadProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    setPreviewUrl(URL.createObjectURL(file));
    setProgress(0);
    setError(null);

    try {
      const { secure_url } = await uploadMedia(
        file,
        'avatar',
        accessToken,
        setProgress
      );
      setProgress(100);
      onUploadComplete?.(secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(null);
    }
  };

  return (
    <div>
      {previewUrl && (
        <img src={previewUrl} alt="Avatar preview" style={{ width: 80, height: 80, borderRadius: '50%' }} />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {progress !== null && progress < 100 && (
        <progress value={progress} max={100}>{progress}%</progress>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

#### Product Image Upload (Async, Multiple Files)

```tsx
// src/components/ProductImageUpload.tsx
'use client';

import { useState } from 'react';
import { uploadMedia } from '@/lib/cloudinary';

export function ProductImageUpload({ accessToken }: { accessToken: string }) {
  const [uploads, setUploads] = useState<Array<{ name: string; url: string | null; progress: number }>>([]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // Initialize state for each file
    setUploads(files.map(f => ({ name: f.name, url: null, progress: 0 })));

    // Upload all files concurrently
    await Promise.all(
      files.map(async (file, i) => {
        try {
          const { secure_url } = await uploadMedia(
            file,
            'product_image',
            accessToken,
            (pct) => setUploads(prev => prev.map((u, j) => j === i ? { ...u, progress: pct } : u))
          );
          setUploads(prev => prev.map((u, j) => j === i ? { ...u, url: secure_url, progress: 100 } : u));
        } catch {
          setUploads(prev => prev.map((u, j) => j === i ? { ...u, progress: -1 } : u));
        }
      })
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleFiles} />
      {uploads.map((u, i) => (
        <div key={i}>
          <span>{u.name}</span>
          {u.progress === 100 && u.url && <img src={u.url} alt="" width={60} />}
          {u.progress > 0 && u.progress < 100 && <span>{u.progress}%</span>}
          {u.progress === -1 && <span style={{ color: 'red' }}>Failed</span>}
        </div>
      ))}
    </div>
  );
}
```

### Available Asset Types

| `asset_type` value | Used for | Max size |
|---|---|---|
| `avatar` | User profile photo | 10 MB |
| `product_image` | Product main/cover image | 20 MB |
| `gallery_image` | Product gallery photos | 20 MB |
| `brand_logo` | Vendor/brand logo | 5 MB |
| `vendor_logo` | Vendor store banner | 5 MB |
| `category_image` | Category card image | 5 MB |
| `color_swatch` | Product color swatch | 2 MB |
| `collection_cover` | Collection hero image | 20 MB |
| `blog_cover` | Blog post cover image | 10 MB |
| `profile_image` | Generic profile photo | 10 MB |
| `measurement_photo` | Body measurement photo | 15 MB |
| `message_attachment` | Chat/message attachment | 25 MB |

### Background (Async) Upload Pattern with React Query

```tsx
// src/hooks/useCloudinaryUpload.ts
import { useMutation } from '@tanstack/react-query';
import { uploadMedia } from '@/lib/cloudinary';

export function useCloudinaryUpload(assetType: string) {
  return useMutation({
    mutationFn: ({
      file,
      accessToken,
      onProgress,
    }: {
      file: File;
      accessToken: string;
      onProgress?: (pct: number) => void;
    }) => uploadMedia(file, assetType, accessToken, onProgress),

    onSuccess: (data) => {
      console.log('Upload complete:', data.secure_url);
    },

    onError: (error) => {
      console.error('Upload failed:', error.message);
    },
  });
}

// Usage in a component:
// const { mutate, isPending, data } = useCloudinaryUpload('avatar');
// mutate({ file, accessToken, onProgress: setProgress });
```

### Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000   # or production URL
# No Cloudinary keys needed in frontend — all signing is done server-side
```

### Error Handling

The presign endpoint returns standard error envelopes:

```typescript
// 400: invalid asset_type
{ success: false, message: "Invalid asset type", code: "validation_error" }

// 401: missing or expired JWT
{ success: false, message: "Authentication credentials were not provided", code: "not_authenticated" }
```

Handle them in your upload function:

```typescript
const res = await fetch('/api/v1/upload/presign/', { ... });
if (!res.ok) {
  const err = await res.json();
  if (res.status === 401) {
    // Redirect to login or refresh token
    router.push('/login');
  } else {
    throw new Error(err.message ?? 'Upload configuration failed');
  }
}
```

### Security Notes

- The presign token is valid for **60 seconds** (server-side TTL on the signature timestamp)
- The signature is generated server-side using Python `hashlib.sha256` — the Cloudinary API secret is never exposed to the browser
- All webhook calls from Cloudinary are validated with **HMAC-SHA256** on the backend before being processed

---
**End of Cloudinary Integration Section** · Last updated 2026-03-16
