# FASHIONISTAR: Storefront Launch & V2 Scaling Master Blueprint

This document outlines the professional launch operational advices, monetization systems, and critical architectural scaling notes as the FASHIONISTAR platform transitions from initial release into high-volume V2 production.

---

## 💎 PART 1: 10 Core Launch & Monetization Operational Blueprints

### 1. Cloudinary Asset Optimization (Advice 1)
*   **Operational Objective:** Ensure LCP (Largest Contentful Paint) remains under 1.0s and INP (Interaction to Next Paint) stays below 75ms under any network speed.
*   **V1 Fix Completed:** Implemented dynamic Cloudinary transformation injection (`f_auto,q_auto`) directly into the `safe_media_url` serializer helper inside `apps/catalog/serializers/common.py`. This ensures every brand, category, collection, and blog asset served from Cloudinary is automatically compressed and transcoded to WebP/AVIF.
*   **V2 Target:** Implement a Next.js custom image loader matching this structure:
    ```javascript
    export default function cloudinaryLoader({ src, width, quality }) {
      const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
      return `https://res.cloudinary.com/dgpdlknc1/image/upload/${params.join(',')}/${src}`;
    }
    ```

### 2. Dynamically Rendered SEO Metatags (Advice 2)
*   **Operational Objective:** Drive high-value organic search volume by auto-indexing trending fashion keywords.
*   **Implementation Strategy:** Map the seeded `seo_title` and `seo_description` fields of `BlogPost` and `Category` in Next.js Server Components.
*   **Next.js Implementation Pattern:**
    ```typescript
    export async function generateMetadata({ params }): Promise<Metadata> {
      const blog = await getBlogData(params.slug);
      return {
        title: blog.seo_title || `${blog.title} | FASHIONISTAR`,
        description: blog.seo_description || blog.excerpt,
        openGraph: {
          title: blog.seo_title,
          description: blog.seo_description,
          images: [{ url: blog.featured_image_url }],
        }
      };
    }
    ```

### 3. Merchant Content Quality Guidelines (Advice 3)
*   **Operational Objective:** Build a visually harmonious, premium-brand catalog.
*   **Rulebook Policy:**
    - Standardize primary imagery to a 1:1 square ratio for product listings and 16:9 for collections.
    - Set background rules: uniform off-white, light gray, or studio soft drop.
    - Mandate high-resolution specs (minimum 2000px on the longest side).

### 4. Layered Storefront Cache Architecture (Advice 4)
*   **Operational Objective:** Handle 10k+ Requests Per Second (RPS) with less than 100ms response latency.
*   **Operational Plan:** Deploy a double-layer cache system:
    1. **CDN Edge Caching:** 5-minute TTL on public product and collection index routes.
    2. **Redis In-Memory Key-Value Stores:** Cache complex prefetch query segments inside Django Ninja selectors, automatically busted via custom `post_save` signals.

### 5. Context-Sensitive Tailoring Tooltips (Advice 5)
*   **Operational Objective:** Minimize refund rates by ensuring users scan their body measurements accurately.
*   **Design Pattern:** Overlay interactive guides on the Next.js camera interface using steps from the seeded *"Optimizing Your Measurement Profile"* article.
*   **Interactive Steps:**
    - **Step 1:** Fit close-fitting clothing (e.g. activewear) to prevent cloth bulk artifacts.
    - **Step 2:** Ensure bright, uniform lighting with no harsh backlighting.
    - **Step 3:** Natural upright posture with arms slightly offset from the hips.

---

### 6. Dynamic Tiered Escrow Commissions (Recommendation 1)
*   **Monetization Mechanism:** Capture diverse transaction values based on logistical complexity.
*   **Pricing Structure:**
    - **Tier A (10% Local RTW):** Simple off-the-rack garments delivered via local shipping.
    - **Tier B (15% Domestic Bespoke):** High-touch custom tailoring requiring digital body measurement synchronization.
    - **Tier C (18% Global Export):** Fully insured international shipping, escrow verification, and size conformity validation.

### 7. SaaS Subscriptions for Premium Tailors (Recommendation 2)
*   **Monetization Mechanism:** High-margin recurring SaaS revenue.
*   **Pricing Tiers:**
    - **Tier 1 (Free / Starter):** Basic store profile, up to 10 product listings, manual measurement receipt.
    - **Tier 2 (Pro - $49/mo):** 3D Digital Body Scanning access, infinite listings, and custom CRM integration.
    - **Tier 3 (Enterprise - $199/mo):** Custom domain routing, multi-tailor management dashboards, and discounted logistics.

### 8. Sponsored Featured Brand Placements (Recommendation 3)
*   **Monetization Mechanism:** Ad placement bidding on high-traffic storefront hubs.
*   **Operational Layout:** Allow premium verified partners (e.g., Deola Sagoe, Mai Atafo) to bid for primary homepage collection slots.
*   **Placement Rules:** Dynamic algorithmic auction refreshing every Monday at 00:00 UTC, matching tags to user browsing affinity.

### 9. Integrated Material Logistics Escrow (Recommendation 4)
*   **Monetization Mechanism:** Transaction service fees for logistics and materials handling.
*   **Operational Plan:**
    - Act as a trusted third-party escrow holding funds until client scans a QR code upon receiving a bespoke garment.
    - Partner directly with DHL/FedEx to generate instant shipping labels, charging a 3% coordination fee.

### 10. Sponsored Textile Affiliate Networks (Recommendation 5)
*   **Monetization Mechanism:** Direct native ad placement with textile fabricators.
*   **Operational Plan:** Integrate affiliate links into the fabric selector during custom product creation and within editorial articles.
*   **Partner Outlets:** Cooperate with high-grade European and West African lace and textile mills.

---

## ⚡ PART 2: Python 3.14 & `asgiref` Compatibility Warning

### 🔍 Root Cause Analysis
During high concurrency, rapid hot-reloads, or request aborts by the client (such as Next.js cancels/prefetches), the ASGI server issues a task cancellation to Django Ninja. 

Under the hood, Django’s `aget()` database helper utilizes `asgiref.sync.sync_to_async` to run synchronous ORM queries on a thread-pool executor. To prevent database connection threads from abruptly closing, `sync_to_async` shields the inner execution using `asyncio.shield`.

In **Python 3.14's experimental event loop**, when a task executing a shielded future is cancelled:
1. The outer task raising `CancelledError` causes the future returned by `sync_to_async` to be destroyed.
2. When the synchronous database thread completes and returns the query result, the shielded future tries to set its result but finds itself already garbage collected.
3. This triggers a console traceback: `[ERROR] asyncio — CancelledError exception in shielded future`.

This is a compatibility issue between Python 3.14's strict new garbage collection hooks and older `asgiref` versions.

---

## 🛠️ V2 Architectural Mitigations

To achieve maximum stability and silent error handling in high-traffic V2 environments, implement the following architectural mitigations:

### 1. Upgrade Dependency Stack (Recommended)
Ensure `pyproject.toml` and `requirements.txt` target `asgiref >= 3.8.1` which contains specific fixes for Python 3.13/3.14 task termination hooks:
```toml
asgiref = "^3.8.1"
```

### 2. Graceful Cancellation Catch Wrapper
Update high-prefetch async views to catch `asyncio.CancelledError` explicitly. This allows the connection to terminate silently without bubbling up to the default ASGI handler:
```python
import asyncio
from ninja.errors import HttpError

@router.get("/{slug}/", auth=None)
async def get_product(request, slug: str):
    try:
        product = await aget_product_detail(slug)
        if not product:
            raise HttpError(404, "Product not found.")
        await async_increment_product_views(product.pk)
        return _product_detail_out(product)
    except asyncio.CancelledError:
        # Catch and handle cancellation cleanly when client aborts the request
        logger.debug("Request for product slug=%s was aborted by client.", slug)
        raise
```

### 3. Translate Complex Selectors to Synchronous View Execution
For endpoints with extremely large query footprints (like product detail pages with 8+ Prefetch targets), define the view as **synchronous** (`def` instead of `async def`). 

Django Ninja runs synchronous views inside an isolated, non-cancellable threadpool thread. The database operations execute in standard blocking I/O fashion:
- **Pros:** Completely avoids `sync_to_async` and `asyncio.shield` overhead, entirely resolving the `CancelledError` bug.
- **Cons:** Bypasses async concurrency benefits, but completely safe under typical CPU-bound and connection-pooled setups.

---

## 📋 V2 Launch Checklist
- [ ] Upgrade `asgiref` to version `3.8.1` in python lockfiles.
- [ ] Implement Next.js Custom Image Loader routing to dynamic Cloudinary transforms.
- [ ] Deploy CDN-level caching for high-load storefront catalog routers.
- [ ] Launch tailors portal with Tiered Commission structure.
