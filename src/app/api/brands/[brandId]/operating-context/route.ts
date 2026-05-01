import { NextResponse } from "next/server";
import { brandOpsStore } from "@/lib/brand-ops-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;

  try {
    return NextResponse.json(brandOpsStore.getBrandOperatingContext(brandId));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load brand operating context",
      },
      { status: 404 },
    );
  }
}
