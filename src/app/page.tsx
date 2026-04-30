import { CertificationSummary } from "@/components/CertificationSummary";
import { DecisionPanel } from "@/components/DecisionPanel";
import { TaskCard } from "@/components/TaskCard";
import { calculateCertificationProgress } from "@/lib/training";
import {
  currentUser,
  decisionPrompts,
  taskAssignments,
  trainingTasks,
} from "@/lib/seed";

export default function CockpitPage() {
  const progress = calculateCertificationProgress({
    userId: currentUser.id,
    targetPoints: 60,
    assignments: taskAssignments,
    tasks: trainingTasks,
  });
  const activeAssignment =
    taskAssignments.find((assignment) => assignment.status === "in_progress") ??
    taskAssignments[0];
  const activeTask = trainingTasks.find(
    (task) => task.id === activeAssignment.taskId,
  )!;
  const decisionPrompt = decisionPrompts.find(
    (prompt) => prompt.taskId === activeTask.id,
  )!;

  return (
    <div className="page-grid">
      <div className="stack">
        <section className="section">
          <div className="eyebrow">Newcomer cockpit</div>
          <h1>{currentUser.name} 的訓練工作台</h1>
          <p>
            今天的目標是完成可被品管的真實任務，遇到判斷問題時先打開 Jacky
            Decision Panel，再留下 trace log。
          </p>
        </section>

        <CertificationSummary progress={progress} />

        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Assigned tasks</div>
              <h2>導入任務</h2>
            </div>
          </div>
          <div className="card-list">
            {taskAssignments.map((assignment) => {
              const task = trainingTasks.find(
                (candidate) => candidate.id === assignment.taskId,
              )!;
              return (
                <TaskCard
                  assignment={assignment}
                  key={assignment.id}
                  task={task}
                />
              );
            })}
          </div>
        </section>
      </div>

      <DecisionPanel decisionPrompt={decisionPrompt} task={activeTask} />
    </div>
  );
}
