import type { TaskStatus } from "@/lib/domain";

export const statusLabels: Record<TaskStatus, string> = {
  not_started: "未開始",
  in_progress: "進行中",
  submitted: "已送出",
  reviewed: "已品管",
};
