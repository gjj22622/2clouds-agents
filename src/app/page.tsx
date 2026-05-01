import { CertificationSummary } from "@/components/CertificationSummary";
import { DecisionPanel } from "@/components/DecisionPanel";
import { TaskCard } from "@/components/TaskCard";
import {
  currentUser,
  decisionPrompts,
  taskAssignments,
  traceLogs,
  trainingTasks,
} from "@/lib/seed";
import { buildNewcomerDashboard } from "@/lib/training";

export default function CockpitPage() {
  const dashboard = buildNewcomerDashboard({
    user: currentUser,
    targetPoints: 60,
    assignments: taskAssignments,
    tasks: trainingTasks,
    decisionPrompts,
    traceLogs,
  });

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

        <CertificationSummary progress={dashboard.progress} />

        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Assigned tasks</div>
              <h2>導入任務</h2>
            </div>
          </div>
          <div className="card-list">
            {dashboard.assignments.map(({ assignment, task }) => {
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

      <DecisionPanel
        decisionPrompt={dashboard.decisionPrompt}
        task={dashboard.activeTask}
      />
    </div>
  );
}
