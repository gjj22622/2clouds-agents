"use client";

import { useState } from "react";
import type {
  TaskStatus,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
  User,
} from "@/lib/domain";
import {
  createStatusTraceLog,
  getAvailableActorTransitions,
} from "@/lib/training";
import { statusLabels } from "./status";

export function TaskWorkspace({
  task,
  assignment,
  user,
  initialTraceLogs,
}: {
  task: TrainingTask;
  assignment: TrainingTaskAssignment;
  user: User;
  initialTraceLogs: TraceLog[];
}) {
  const [status, setStatus] = useState<TaskStatus>(assignment.status);
  const [reviewerNote] = useState<string | undefined>(assignment.reviewerNote);
  const [logs, setLogs] = useState<TraceLog[]>(initialTraceLogs);

  const availableStatuses = getAvailableActorTransitions(status, user.role);

  function moveTo(toStatus: TaskStatus) {
    const log = createStatusTraceLog({
      assignmentId: assignment.id,
      actorId: user.id,
      fromStatus: status,
      toStatus,
    });
    setStatus(toStatus);
    setLogs((current) => [log, ...current]);
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Stage {task.stage} · {task.module}</div>
          <h1>{task.title}</h1>
          <p>{task.brief}</p>
        </div>
        <span className={`badge ${status}`}>{statusLabels[status]}</span>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        {reviewerNote && status === "needs_revision" && (
          <div className="reviewer-note">
            <h2>Reviewer 意見</h2>
            <p>{reviewerNote}</p>
          </div>
        )}

        <div>
          <h2>交付標準</h2>
          <p>{task.expectedOutput}</p>
        </div>

        <div>
          <h2>任務狀態</h2>
          {availableStatuses.length > 0 ? (
            <div className="button-row">
              {availableStatuses.map((targetStatus) => (
                <button
                  className="button"
                  key={targetStatus}
                  onClick={() => moveTo(targetStatus)}
                  type="button"
                >
                  標記為{statusLabels[targetStatus]}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty">此任務目前沒有可操作的下一個狀態。</div>
          )}
        </div>

        <div>
          <h2>Trace log</h2>
          {logs.length === 0 ? (
            <div className="empty">尚無操作記錄。</div>
          ) : (
            <div className="card-list">
              {logs.map((log) => (
                <div className="trace-row" key={log.id}>
                  <div className="meta-row">
                    <span className="badge">{log.action}</span>
                    {log.fromStatus && log.toStatus && (
                      <span className="badge">
                        {statusLabels[log.fromStatus]} → {statusLabels[log.toStatus]}
                      </span>
                    )}
                  </div>
                  <p>{new Date(log.createdAt).toLocaleString("zh-TW")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
