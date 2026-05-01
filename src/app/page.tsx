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
        <header className="section" style={{ background: "var(--sy-cloud)", border: "none" }}>
          <div className="eyebrow">Cockpit</div>
          <h1>早安，{currentUser.name}</h1>
          <p style={{ maxWidth: "600px", fontSize: "16px" }}>
            歡迎回到訓練工作台。今天的目標是完成可被品管的真實任務。
            記住：遇到判斷問題時先打開 <strong>Jacky Decision Panel</strong>，產出後留下 <strong>trace log</strong> 以確保品質。
          </p>
        </header>

        <CertificationSummary progress={progress} />

        <section className="section">
          <header className="section-header">
            <div>
              <div className="eyebrow">Learning Path</div>
              <h2>導入任務</h2>
              <p>完成這些任務以獲得 60 分認證。</p>
            </div>
          </header>
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

      <aside>
        <DecisionPanel decisionPrompt={decisionPrompt} task={activeTask} />
      </aside>
    </div>
  );
}
