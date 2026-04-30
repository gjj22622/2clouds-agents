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
      <div className="section-header">
        <div>
          <div className="eyebrow">{task.module}</div>
          <h3>{task.title}</h3>
        </div>
        <span className={`badge ${assignment.status}`}>
          {statusLabels[assignment.status]}
        </span>
      </div>
      <p>{task.brief}</p>
      <div className="meta-row">
        <span className="badge">{task.basePoints} pts</span>
        <span className="badge">查看任務</span>
      </div>
    </Link>
  );
}
