import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const secret = req.headers.get("x-revalidate-secret");

    // In production, enforce secret token comparison
    const envSecret = process.env.REVALIDATION_SECRET || "default_secret";
    if (secret !== envSecret && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid revalidation token" },
        { status: 401 }
      );
    }

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Bad Request: Tag parameter is required" },
        { status: 400 }
      );
    }

    // Trigger stable Next.js cache revalidation
    revalidateTag(tag, "max");

    return NextResponse.json({
      success: true,
      revalidated: tag,
      invalidated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
