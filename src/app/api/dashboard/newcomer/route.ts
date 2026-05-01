import { NextResponse } from "next/server";
import {
  currentUser,
  decisionPrompts,
  taskAssignments,
  traceLogs,
  trainingTasks,
} from "@/lib/seed";
import { buildNewcomerDashboard } from "@/lib/training";

export function GET() {
  const dashboard = buildNewcomerDashboard({
    user: currentUser,
    targetPoints: 60,
    assignments: taskAssignments,
    tasks: trainingTasks,
    decisionPrompts,
    traceLogs,
  });

  return NextResponse.json(dashboard);
}
