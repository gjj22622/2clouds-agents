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
  canTransitionTaskStatus,
  createStatusTraceLog,
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
    <div className="stack">
      <section className="section">
        <header className="section-header">
          <div>
            <div className="eyebrow">{task.module}</div>
            <h1>{task.title}</h1>
            <p style={{ fontSize: "16px" }}>{task.brief}</p>
          </div>
          <span className={`badge ${status}`} style={{ fontSize: "14px", padding: "6px 12px" }}>
            {statusLabels[status]}
          </span>
        </header>

        <div className="stack" style={{ marginTop: 32 }}>
          <div className="decision-block">
            <h2 style={{ fontSize: "18px", marginBottom: 12 }}>交付標準</h2>
            <div className="section" style={{ background: "var(--sy-paper)", borderStyle: "dashed", boxShadow: "none" }}>
              <p style={{ color: "var(--sy-ink)", fontWeight: 500 }}>{task.expectedOutput}</p>
            </div>
          </div>

          <div className="decision-block">
            <h2 style={{ fontSize: "18px", marginBottom: 12 }}>任務狀態更新</h2>
            {availableStatuses.length > 0 ? (
              <div className="button-row">
                {availableStatuses.map((targetStatus) => (
                  <button
                    className="button"
                    key={targetStatus}
                    onClick={() => moveTo(targetStatus)}
                    type="button"
                  >
                    標記為 {statusLabels[targetStatus]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">此任務目前沒有可由新人操作的下一個狀態。</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: "18px", marginBottom: 16 }}>Trace log</h2>
        <div className="stack" style={{ gap: 12 }}>
          {logs.length > 0 ? (
            logs.map((log) => (
              <div className="trace-row" key={log.id} style={{ background: "var(--sy-paper)", border: "none" }}>
                <div className="meta-row" style={{ justifyContent: "space-between" }}>
                  <div className="meta-row">
                    <span className="badge" style={{ background: "var(--sy-ink)", color: "white" }}>{log.action}</span>
                    {log.fromStatus && (
                      <span className="badge" style={{ background: "var(--sy-line)" }}>
                        {statusLabels[log.fromStatus]} → {log.toStatus ? statusLabels[log.toStatus] : ""}
                      </span>
                    )}
                  </div>
                  <time style={{ fontSize: "12px", color: "var(--sy-gray)" }}>
                    {new Date(log.createdAt).toLocaleString("zh-TW", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            ))
          ) : (
            <div className="empty" style={{ minHeight: "60px" }}>尚無操作紀錄</div>
          )}
        </div>
      </section>
    </div>
  );
}
