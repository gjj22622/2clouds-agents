import { NextResponse } from "next/server";
import { brandOpsStore, BrandOpsError, type BrandTaskOperation } from "@/lib/brand-ops-store";

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to write brand operation";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    const result = brandOpsStore.applyBrandOperation(
      brandId,
      body as BrandTaskOperation,
    );

    return NextResponse.json({
      brandId,
      ...result,
    });
  } catch (error) {
    const status = error instanceof BrandOpsError ? error.status : 500;

    return NextResponse.json(
      { error: readErrorMessage(error) },
      { status },
    );
  }
}
