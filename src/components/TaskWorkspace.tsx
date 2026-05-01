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
  applyTaskStatusTransition,
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
    const result = applyTaskStatusTransition({
      assignment: { ...assignment, status },
      actorId: user.id,
      toStatus,
    });
    setStatus(result.assignment.status);
    setLogs((current) => [result.traceLog, ...current]);
  }

  return (
    <div className="stack">
      <section className="section">
        <header className="section-header">
          <div>
            <div className="eyebrow">Stage {task.stage} · {task.module}</div>
            <h1>{task.title}</h1>
            <p style={{ fontSize: "16px", maxWidth: "600px" }}>{task.brief}</p>
          </div>
          <div className="stack" style={{ alignItems: "flex-end", gap: "8px" }}>
            <span className={`badge ${status}`} style={{ fontSize: "14px", padding: "6px 12px" }}>
              {statusLabels[status]}
            </span>
            {status === "needs_revision" && (
              <span style={{ fontSize: "12px", color: "var(--danger)", fontWeight: 700 }}>待修正</span>
            )}
            {status === "reviewed" && (
              <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 700 }}>已通過認證</span>
            )}
          </div>
        </header>

        <div className="stack" style={{ marginTop: 32 }}>
          {reviewerNote && (status === "needs_revision" || status === "reviewed") && (
            <div className="reviewer-note" style={{ marginBottom: "8px" }}>
              <p>{reviewerNote}</p>
            </div>
          )}

          <div className="decision-block">
            <h2 style={{ fontSize: "16px", color: "var(--sy-gray)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>交付標準</h2>
            <div className="section" style={{ background: "var(--sy-paper)", borderStyle: "dashed", boxShadow: "none", padding: "16px 20px" }}>
              <p style={{ color: "var(--sy-ink)", fontWeight: 500, fontSize: "15px" }}>{task.expectedOutput}</p>
            </div>
          </div>

          <div className="decision-block">
            <h2 style={{ fontSize: "16px", color: "var(--sy-gray)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>狀態操作</h2>
            {availableStatuses.length > 0 ? (
              <div className="button-row">
                {availableStatuses.map((targetStatus) => (
                  <button
                    className="button"
                    key={targetStatus}
                    onClick={() => moveTo(targetStatus)}
                    style={{ background: targetStatus === "submitted" ? "var(--sy-deep)" : undefined }}
                    type="button"
                  >
                    標記為 {statusLabels[targetStatus]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ minHeight: "80px" }}>
                <p>目前沒有可操作的狀態更新。請等待 Reviewer 審核或聯繫 Jacky。</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: 24 }}>活動紀錄 (Trace Log)</h2>
        <div className="trace-list">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div className={`trace-row ${index === 0 ? "active" : ""}`} key={log.id}>
                <div className="trace-content">
                  <div className="trace-meta">
                    <span className="trace-label">
                      {log.action === "task_status_changed" ? "狀態變更" : log.action}
                    </span>
                    <time className="trace-time">
                      {new Date(log.createdAt).toLocaleString("zh-TW", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {log.fromStatus && (
                    <div className="meta-row" style={{ gap: "4px" }}>
                      <span className="badge" style={{ fontSize: "11px", padding: "2px 6px" }}>
                        {statusLabels[log.fromStatus]}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--sy-gray)" }}>→</span>
                      <span className={`badge ${log.toStatus}`} style={{ fontSize: "11px", padding: "2px 6px" }}>
                        {log.toStatus ? statusLabels[log.toStatus] : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty" style={{ minHeight: "60px", border: "none" }}>尚無操作紀錄</div>
          )}
        </div>
      </section>
    </div>
  );
}
