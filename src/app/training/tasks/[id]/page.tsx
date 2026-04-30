import { notFound } from "next/navigation";
import { DecisionPanel } from "@/components/DecisionPanel";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import {
  currentUser,
  decisionPrompts,
  taskAssignments,
  traceLogs,
  trainingTasks,
} from "@/lib/seed";

export default async function TrainingTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = trainingTasks.find((candidate) => candidate.id === id);

  if (!task) {
    notFound();
  }

  const assignment = taskAssignments.find(
    (candidate) => candidate.taskId === task.id,
  );
  const decisionPrompt = decisionPrompts.find(
    (candidate) => candidate.taskId === task.id,
  );

  if (!assignment || !decisionPrompt) {
    notFound();
  }

  return (
    <div className="page-grid">
      <TaskWorkspace
        assignment={assignment}
        initialTraceLogs={traceLogs.filter(
          (traceLog) => traceLog.assignmentId === assignment.id,
        )}
        task={task}
        user={currentUser}
      />
      <DecisionPanel decisionPrompt={decisionPrompt} task={task} />
    </div>
  );
}
