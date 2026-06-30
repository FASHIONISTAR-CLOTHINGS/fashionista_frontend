/**
 * Core Cache Revalidation trigger helper.
 * Enforces server-side unstable_cache tag revalidation via secure POST request.
 */
export async function triggerServerRevalidate(
  tag: "products" | "product" | "categories" | "collections" | "blog"
): Promise<boolean> {
  try {
    const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET || "default_secret";
    const response = await fetch(`/api/revalidate?tag=${tag}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
    });

    if (!response.ok) {
      console.warn(`Server revalidation request failed for tag "${tag}":`, response.statusText);
      return false;
    }

    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error(`Failed to trigger server revalidation for tag "${tag}":`, error);
    return false;
  }
}
