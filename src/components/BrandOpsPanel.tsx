"use client";

import { useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BrandTask, BrandTaskStatus } from "@/lib/domain";

const controlStyle: CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 6,
  color: "var(--text)",
  font: "inherit",
  minHeight: 40,
  padding: "8px 12px",
  width: "100%",
};

const textareaStyle: CSSProperties = {
  ...controlStyle,
  minHeight: 88,
  resize: "vertical",
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: CSSProperties = {
  color: "var(--sy-gray)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

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

      setMessage("已寫入品牌操作，頁面會同步更新最新狀態。");

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
          : "寫入失敗",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="eyebrow">Brand Ops</div>
      <h2>營運寫入</h2>
      <p>
        這裡可以直接把木酢品牌的任務狀態、操作 note 與 revenue signal 寫進平台。
      </p>

      <form onSubmit={handleSubmit} className="stack" style={{ gap: 16 }}>
        <label style={fieldStyle}>
          <span style={labelStyle}>操作類型</span>
          <select
            onChange={(event) => setKind(event.target.value as OperationKind)}
            style={controlStyle}
            value={kind}
          >
            <option value="task_status">變更任務狀態</option>
            <option value="task_note">留下任務 note</option>
            <option value="revenue_signal">新增 revenue signal</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>任務</span>
          <select
            onChange={(event) => setTaskId(event.target.value)}
            required={kind !== "revenue_signal"}
            style={controlStyle}
            value={taskId}
          >
            <option value="">不綁定任務</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} · {statusLabels[task.status]}
              </option>
            ))}
          </select>
        </label>

        {kind === "task_status" && (
          <>
            <label style={fieldStyle}>
              <span style={labelStyle}>目標狀態</span>
              <select
                onChange={(event) =>
                  setStatus(event.target.value as BrandTaskStatus)
                }
                style={controlStyle}
                value={status}
              >
                <option value="queued">排隊中</option>
                <option value="in_progress">進行中</option>
                <option value="reviewing">審核中</option>
                <option value="done">完成</option>
              </select>
            </label>
            <label style={fieldStyle}>
              <span style={labelStyle}>補充 note（選填）</span>
              <textarea
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：已完成素材確認，等待藝嘉確認下一步。"
                style={textareaStyle}
                value={note}
              />
            </label>
          </>
        )}

        {kind === "task_note" && (
          <label style={fieldStyle}>
            <span style={labelStyle}>操作 note</span>
            <textarea
              onChange={(event) => setNote(event.target.value)}
              placeholder="例如：已補上商品頁的安全說明與使用場景。"
              required
              style={textareaStyle}
              value={note}
            />
          </label>
        )}

        {kind === "revenue_signal" && (
          <div className="stack" style={{ gap: 12 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <label style={fieldStyle}>
                <span style={labelStyle}>訊號類型</span>
                <select
                  onChange={(event) =>
                    setSignalType(event.target.value as RevenueSignalType)
                  }
                  style={controlStyle}
                  value={signalType}
                >
                  <option value="lead">lead</option>
                  <option value="conversion">conversion</option>
                  <option value="retention">retention</option>
                  <option value="upsell">upsell</option>
                </select>
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>信心度</span>
                <select
                  onChange={(event) =>
                    setConfidence(event.target.value as RevenueConfidence)
                  }
                  style={controlStyle}
                  value={confidence}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
            </div>

            <label style={fieldStyle}>
              <span style={labelStyle}>訊號標題</span>
              <input
                onChange={(event) => setSignalLabel(event.target.value)}
                placeholder="例如：會員喚醒進站點擊回升"
                required
                style={controlStyle}
                value={signalLabel}
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>訊號內容</span>
              <textarea
                onChange={(event) => setSignalValue(event.target.value)}
                placeholder="例如：最近一週有明顯回訪，適合推會員喚醒與加購包。"
                required
                style={textareaStyle}
                value={signalValue}
              />
            </label>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fceceb",
              border: "1px solid #f3b4ae",
              borderRadius: 6,
              color: "var(--danger)",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 12px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: "var(--sy-cloud)",
              border: "1px solid var(--sy-line)",
              borderRadius: 6,
              color: "var(--sy-deep)",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 12px",
            }}
          >
            {message}
          </div>
        )}

        <div className="button-row">
          <button className="button" disabled={isPending || isSubmitting} type="submit">
            {isPending || isSubmitting ? "送出中…" : "送出寫入"}
          </button>
          <button
            className="secondary-button"
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
            type="button"
          >
            重設
          </button>
        </div>
      </form>
    </section>
  );
}
