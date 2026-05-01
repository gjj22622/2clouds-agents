import { NextResponse } from "next/server";
import type { ReviewDecision } from "@/lib/domain";
import {
  currentUser,
  decisionPrompts,
  reviewerUser,
  taskAssignments,
  traceLogs,
  trainingTasks,
} from "@/lib/seed";
import {
  applyReviewerReviewDecision,
  buildNewcomerDashboard,
} from "@/lib/training";

const reviewDecisions: ReviewDecision[] = ["reviewed", "needs_revision"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const { assignmentId } = await params;
  const assignment = taskAssignments.find(
    (candidate) => candidate.id === assignmentId,
  );

  if (!assignment) {
    return NextResponse.json(
      { error: `Assignment ${assignmentId} was not found` },
      { status: 404 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    decision?: string;
    reviewerNote?: string;
    reviewerScore?: number;
  };

  if (!body.decision || !reviewDecisions.includes(body.decision as ReviewDecision)) {
    return NextResponse.json(
      { error: "decision must be reviewed or needs_revision" },
      { status: 400 },
    );
  }

  if (
    body.reviewerScore !== undefined &&
    typeof body.reviewerScore !== "number"
  ) {
    return NextResponse.json(
      { error: "reviewerScore must be a number" },
      { status: 400 },
    );
  }

  try {
    const result = applyReviewerReviewDecision({
      assignment,
      reviewerId: reviewerUser.id,
      decision: body.decision as ReviewDecision,
      reviewerNote: body.reviewerNote,
      reviewerScore: body.reviewerScore,
    });
    const updatedAssignments = taskAssignments.map((candidate) =>
      candidate.id === assignment.id ? result.assignment : candidate,
    );
    const updatedTraceLogs = [result.traceLog, ...traceLogs];

    return NextResponse.json({
      assignment: result.assignment,
      traceLog: result.traceLog,
      dashboard: buildNewcomerDashboard({
        user: currentUser,
        targetPoints: 60,
        assignments: updatedAssignments,
        tasks: trainingTasks,
        decisionPrompts,
        traceLogs: updatedTraceLogs,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to review task" },
      { status: 400 },
    );
  }
}
