import type {
  Brain,
  DecisionPrompt,
  KnowledgeNode,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
  User,
} from "./domain";

export const currentUser: User = {
  id: "user-newcomer-01",
  name: "新人夥伴 A",
  role: "newcomer",
  title: "數位行銷服務訓練生",
};

export const brains: Brain[] = [
  {
    id: "brain-jacky",
    name: "Jacky 決策腦",
    type: "jacky",
    owner: "Jacky",
    summary: "用來判斷問題分類、風險層級、下一步與是否升級處理。",
    coverage: ["問題框定", "升級條件", "品質門檻"],
  },
  {
    id: "brain-member",
    name: "成員腦：新人 60 分服務者",
    type: "member",
    owner: "Training Team",
    summary: "定義新人在任務中應該會查、會問、會交付的基本行為。",
    coverage: ["任務節奏", "交付格式", "自我檢查"],
  },
  {
    id: "brain-brand",
    name: "双云品牌腦",
    type: "brand",
    owner: "双云行銷",
    summary: "保留品牌語氣、客戶溝通方式與內容品質基準。",
    coverage: ["品牌語氣", "內容風格", "客戶脈絡"],
  },
  {
    id: "brain-method",
    name: "AGENTS 方法論節點",
    type: "method",
    owner: "Platform",
    summary: "把任務拆成可觀察、可修正、可品管的工作節點。",
    coverage: ["任務拆解", "trace log", "review loop"],
  },
];

export const knowledgeNodes: KnowledgeNode[] = [
  {
    id: "kg-problem-framing",
    title: "先框問題，再做內容",
    domain: "decision",
    summary: "任何交付前先確認目標、受眾、限制、成功標準與風險。",
    source: "docs/jacky-decision-layer.md",
  },
  {
    id: "kg-brand-context",
    title: "品牌腦不是素材庫",
    domain: "brand",
    summary: "品牌腦需要能回答為什麼這樣說、不能只存放可複製文案。",
    source: "docs/modules.md",
  },
  {
    id: "kg-trace-review",
    title: "每次狀態改變都留下 trace",
    domain: "quality",
    summary: "平台要記錄任務如何前進，讓 reviewer 能回放判斷脈絡。",
    source: "docs/phase-1-engineering-plan.md",
  },
];

export const trainingTasks: TrainingTask[] = [
  {
    id: "task-context-brief",
    title: "整理客戶內容任務前情提要",
    module: "新人 Cockpit",
    brief: "閱讀一段客戶需求，把目標、限制、素材缺口與需要升級的問題整理出來。",
    expectedOutput: "一份 5 點以內的任務前情提要，包含不確定事項。",
    recommendedBrainIds: ["brain-jacky", "brain-member"],
    recommendedKnowledgeNodeIds: ["kg-problem-framing"],
    basePoints: 15,
  },
  {
    id: "task-brand-check",
    title: "用品牌腦檢查一則貼文草稿",
    module: "品牌工作台",
    brief: "判斷貼文是否符合品牌語氣，並提出 3 個具體修正理由。",
    expectedOutput: "貼文問題清單、修改方向、是否需要 reviewer 介入。",
    recommendedBrainIds: ["brain-brand", "brain-method"],
    recommendedKnowledgeNodeIds: ["kg-brand-context", "kg-trace-review"],
    basePoints: 20,
  },
  {
    id: "task-submit-review",
    title: "送出內容工廠最小交付",
    module: "內容工廠",
    brief: "依照前情提要完成一份社群短文，送出前做自我檢查。",
    expectedOutput: "社群短文、交付檢查表、升級判斷。",
    recommendedBrainIds: ["brain-jacky", "brain-brand"],
    recommendedKnowledgeNodeIds: ["kg-problem-framing", "kg-trace-review"],
    basePoints: 25,
  },
];

export const taskAssignments: TrainingTaskAssignment[] = [
  {
    id: "assignment-context-brief",
    taskId: "task-context-brief",
    userId: currentUser.id,
    status: "reviewed",
    reviewerNote: "能抓到主要限制，下一次要補成功標準。",
  },
  {
    id: "assignment-brand-check",
    taskId: "task-brand-check",
    userId: currentUser.id,
    status: "in_progress",
  },
  {
    id: "assignment-submit-review",
    taskId: "task-submit-review",
    userId: currentUser.id,
    status: "not_started",
  },
];

export const decisionPrompts: DecisionPrompt[] = [
  {
    taskId: "task-context-brief",
    problemFraming: "這不是寫文案任務，先判斷客戶要解決的營運問題。",
    recommendedModel: "目標、受眾、限制、缺口、升級條件",
    relatedKnowledgeNodeIds: ["kg-problem-framing"],
    suggestedNextStep: "把需求拆成已知資訊與待確認問題，再決定是否能開始交付。",
    escalationCondition: "客戶目標不明、素材不足、或承諾範圍超出新人權限時升級。",
  },
  {
    taskId: "task-brand-check",
    problemFraming: "判斷草稿是否能代表品牌，而不是只看文字是否順。",
    recommendedModel: "品牌語氣、受眾理解、證據密度、行動呼籲",
    relatedKnowledgeNodeIds: ["kg-brand-context", "kg-trace-review"],
    suggestedNextStep: "列出每個問題對應的品牌風險，再提出可執行修正。",
    escalationCondition: "涉及品牌定位、敏感議題或客戶承諾時升級。",
  },
  {
    taskId: "task-submit-review",
    problemFraming: "交付品要能被 reviewer 快速檢查來源、判斷與修改理由。",
    recommendedModel: "交付內容、檢查表、trace log、review note",
    relatedKnowledgeNodeIds: ["kg-problem-framing", "kg-trace-review"],
    suggestedNextStep: "先完成短文，再附上自我檢查與不確定點。",
    escalationCondition: "如果內容需要客戶新素材或需要改變策略方向，先升級。",
  },
];

export const traceLogs: TraceLog[] = [
  {
    id: "trace-001",
    assignmentId: "assignment-context-brief",
    actorId: currentUser.id,
    action: "task_status_changed",
    fromStatus: "submitted",
    toStatus: "reviewed",
    createdAt: "2026-04-30T08:30:00.000Z",
  },
];
