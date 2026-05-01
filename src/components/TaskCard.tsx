import Link from "next/link";
import type { TrainingTask, TrainingTaskAssignment } from "@/lib/domain";
import { statusLabels } from "./status";

export function TaskCard({
  task,
  assignment,
}: {
  task: TrainingTask;
  assignment: TrainingTaskAssignment;
}) {
  return (
    <Link className="task-card" href={`/training/tasks/${task.id}`}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">{task.module}</div>
          <h3 style={{ marginBottom: 4 }}>{task.title}</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: 12 }}>{task.brief}</p>
        </div>
        <span className={`badge ${assignment.status}`}>
          {statusLabels[assignment.status]}
        </span>
      </div>
      <div className="meta-row" style={{ marginTop: "auto" }}>
        <span className="badge" style={{ background: "var(--sy-paper)", border: "1px solid var(--sy-line)" }}>
          {task.basePoints} pts
        </span>
        <span className="button secondary-button" style={{ minHeight: "32px", padding: "4px 10px", fontSize: "12px", marginLeft: "auto" }}>
          查看任務
        </span>
      </div>
    </Link>
  );
}
