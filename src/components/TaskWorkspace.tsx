"use client";

import { useMemo, useState } from "react";
import type {
  TaskStatus,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
  User,
} from "@/lib/domain";
import {
  applyTaskStatusTransition,
  canTransitionTaskStatus,
} from "@/lib/training";
import { statusLabels } from "./status";

const nextStatuses: TaskStatus[] = ["in_progress", "submitted"];

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
  const [logs, setLogs] = useState<TraceLog[]>(initialTraceLogs);

  const availableStatuses = useMemo(
    () =>
      nextStatuses.filter(
        (targetStatus) =>
          targetStatus !== status && canTransitionTaskStatus(status, targetStatus),
      ),
    [status],
  );

  function moveTo(toStatus: TaskStatus) {
    const result = applyTaskStatusTransition({
      assignment: { ...assignment, status },
      actorId: user.id,
      toStatus,
    });
    setStatus(result.assignment.status);
    setLogs((current) => [result.traceLog, ...current]);
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">{task.module}</div>
          <h1>{task.title}</h1>
          <p>{task.brief}</p>
        </div>
        <span className={`badge ${status}`}>{statusLabels[status]}</span>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
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
            <div className="empty">此任務目前沒有可由新人操作的下一個狀態。</div>
          )}
        </div>

        <div>
          <h2>Trace log</h2>
          <div className="card-list">
            {logs.map((log) => (
              <div className="trace-row" key={log.id}>
                <div className="meta-row">
                  <span className="badge">{log.action}</span>
                  {log.fromStatus && (
                    <span className="badge">
                      {statusLabels[log.fromStatus]} to{" "}
                      {log.toStatus ? statusLabels[log.toStatus] : ""}
                    </span>
                  )}
                </div>
                <p>{new Date(log.createdAt).toLocaleString("zh-TW")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
