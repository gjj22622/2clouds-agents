import { NextResponse } from "next/server";
import {
  brandBrains,
  brandTasks,
  clientBrands,
  revenueSignals,
  currentUser,
  reviewerUser,
  seniorMemberActivities,
} from "@/lib/seed";
import { buildBrandOperatingContext } from "@/lib/brands";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;

  try {
    return NextResponse.json(
      buildBrandOperatingContext({
        brandId,
        brands: clientBrands,
        brandBrains,
        brandTasks,
        revenueSignals,
        seniorMemberActivities,
        users: [currentUser, reviewerUser],
      }),
    );
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
