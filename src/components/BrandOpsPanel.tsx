"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BrandTask, BrandTaskStatus } from "@/lib/domain";

const statusLabels: Record<BrandTaskStatus, string> = {
  queued: "排隊中",
  in_progress: "進行中",
  reviewing: "審核中",
  done: "完成",
};

type OperationKind = "task_status" | "task_note" | "revenue_signal";
type RevenueSignalType = "lead" | "conversion" | "retention" | "upsell";
type RevenueConfidence = "low" | "medium" | "high";

export function BrandOpsPanel({
  brandId,
  tasks,
}: {
  brandId: string;
  tasks: BrandTask[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kind, setKind] = useState<OperationKind>("task_status");
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? "");
  const [status, setStatus] = useState<BrandTaskStatus>("in_progress");
  const [note, setNote] = useState("");
  const [signalType, setSignalType] = useState<RevenueSignalType>("lead");
  const [signalLabel, setSignalLabel] = useState("");
  const [signalValue, setSignalValue] = useState("");
  const [confidence, setConfidence] = useState<RevenueConfidence>("medium");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isPending || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const body =
        kind === "task_status"
          ? {
              kind,
              taskId,
              status,
              note: note.trim() || undefined,
            }
          : kind === "task_note"
            ? {
                kind,
                taskId,
                note,
              }
            : {
                kind,
                taskId: taskId || undefined,
                type: signalType,
                label: signalLabel,
                value: signalValue,
                confidence,
              };

      const response = await fetch(`/api/brands/${brandId}/ops`, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; context?: unknown }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "寫入失敗");
        return;
      }

      setMessage("已成功寫入操作，頁面正在更新...");

      if (kind === "task_note") {
        setNote("");
      }

      if (kind === "revenue_signal") {
        setSignalLabel("");
        setSignalValue("");
        setConfidence("medium");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "系統連線失敗",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section isolated-section">
      <div className="eyebrow">Brand Ops Console</div>
      <h2 style={{ marginBottom: 8 }}>營運快速操作</h2>
      <p style={{ fontSize: 14, marginBottom: 24 }}>
        直接更新木酢品牌的任務進度、操作備註或捕捉即時營收訊號。
      </p>

      {/* Operation Kind Switcher */}
      <div className="button-row" style={{ marginBottom: 24, padding: 4, background: "var(--sy-paper)", borderRadius: 8 }}>
        {[
          { id: "task_status", label: "任務進度" },
          { id: "task_note", label: "操作備註" },
          { id: "revenue_signal", label: "營收訊號" },
        ].map((item) => (
          <button
            key={item.id}
            className={`secondary-button ${kind === item.id ? "active" : ""}`}
            onClick={() => {
              setKind(item.id as OperationKind);
              setError(null);
              setMessage(null);
            }}
            style={{
              flex: 1,
              border: "none",
              background: kind === item.id ? "white" : "transparent",
              boxShadow: kind === item.id ? "var(--shadow-sm)" : "none",
              fontSize: 13,
              minHeight: 32,
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-field">
          <label className="form-label" htmlFor="taskId">
            關聯任務 {kind !== "revenue_signal" && <span style={{ color: "var(--danger)" }}>*</span>}
          </label>
          <select
            className="form-control"
            disabled={isLoading}
            id="taskId"
            onChange={(event) => setTaskId(event.target.value)}
            required={kind !== "revenue_signal"}
            value={taskId}
          >
            <option value="">{kind === "revenue_signal" ? "可選：關聯至特定任務" : "請選擇任務"}</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {statusLabels[task.status]} · {task.title}
              </option>
            ))}
          </select>
        </div>

        {kind === "task_status" && (
          <div className="form-stack">
            <div className="form-field">
              <label className="form-label" htmlFor="targetStatus">目標狀態</label>
              <select
                className="form-control"
                disabled={isLoading}
                id="targetStatus"
                onChange={(event) =>
                  setStatus(event.target.value as BrandTaskStatus)
                }
                value={status}
              >
                <option value="queued">排隊中</option>
                <option value="in_progress">進行中</option>
                <option value="reviewing">待審核</option>
                <option value="done">已完成</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="statusNote">補充說明</label>
              <textarea
                className="form-control"
                disabled={isLoading}
                id="statusNote"
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：已完成初步排版，等待素材中..."
                value={note}
              />
            </div>
          </div>
        )}

        {kind === "task_note" && (
          <div className="form-field">
            <label className="form-label" htmlFor="taskNote">
              操作內容 <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <textarea
              className="form-control"
              disabled={isLoading}
              id="taskNote"
              onChange={(event) => setNote(event.target.value)}
              placeholder="請輸入本次操作的具體重點..."
              required
              value={note}
            />
          </div>
        )}

        {kind === "revenue_signal" && (
          <div className="form-stack">
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
              <div className="form-field">
                <label className="form-label" htmlFor="signalType">訊號類型</label>
                <select
                  className="form-control"
                  disabled={isLoading}
                  id="signalType"
                  onChange={(event) =>
                    setSignalType(event.target.value as RevenueSignalType)
                  }
                  value={signalType}
                >
                  <option value="lead">Lead</option>
                  <option value="conversion">Conversion</option>
                  <option value="retention">Retention</option>
                  <option value="upsell">Upsell</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="confidence">信心度</label>
                <select
                  className="form-control"
                  disabled={isLoading}
                  id="confidence"
                  onChange={(event) =>
                    setConfidence(event.target.value as RevenueConfidence)
                  }
                  value={confidence}
                >
                  <option value="low">低 (Low)</option>
                  <option value="medium">中 (Medium)</option>
                  <option value="high">高 (High)</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="signalLabel">
                訊號摘要 <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="form-control"
                disabled={isLoading}
                id="signalLabel"
                onChange={(event) => setSignalLabel(event.target.value)}
                placeholder="例如：官網流量點擊回升"
                required
                value={signalLabel}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="signalValue">
                具體訊號內容 <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <textarea
                className="form-control"
                disabled={isLoading}
                id="signalValue"
                onChange={(event) => setSignalValue(event.target.value)}
                placeholder="例如：LINE 推播後進站人數提升 20%，適合推廣回購包..."
                required
                value={signalValue}
              />
            </div>
          </div>
        )}

        <div className="stack" style={{ gap: 12, marginTop: 8 }}>
          {error && <div className="feedback error">{error}</div>}
          {message && <div className="feedback success">{message}</div>}

          <div className="button-row">
            <button
              className="button"
              disabled={isLoading}
              style={{ flex: 2 }}
              type="submit"
            >
              {isLoading ? "處理中..." : "確認送出"}
            </button>
            <button
              className="secondary-button"
              disabled={isLoading}
              onClick={() => {
                setTaskId(tasks[0]?.id ?? "");
                setStatus("in_progress");
                setNote("");
                setSignalType("lead");
                setSignalLabel("");
                setSignalValue("");
                setConfidence("medium");
                setError(null);
                setMessage(null);
              }}
              style={{ flex: 1 }}
              type="button"
            >
              重置
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
