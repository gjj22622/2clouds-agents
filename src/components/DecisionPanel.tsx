import { brains, knowledgeNodes } from "@/lib/seed";
import type { DecisionPrompt, TrainingTask } from "@/lib/domain";

export function DecisionPanel({
  task,
  decisionPrompt,
}: {
  task: TrainingTask;
  decisionPrompt: DecisionPrompt;
}) {
  const relatedNodes = knowledgeNodes.filter((node) =>
    decisionPrompt.relatedKnowledgeNodeIds.includes(node.id),
  );
  const relatedBrains = brains.filter((brain) =>
    task.recommendedBrainIds.includes(brain.id),
  );

  return (
    <aside className="section decision-panel" style={{ padding: "28px" }}>
      <div className="eyebrow" style={{ color: "var(--sy-ember)", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "16px" }}>⚡</span> Jacky Decision Panel
      </div>
      <h2 style={{ marginBottom: 24, fontSize: "20px" }}>{task.title}</h2>
      
      <div className="stack" style={{ gap: "28px" }}>
        <div className="decision-block">
          <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", textTransform: "uppercase", letterSpacing: "0.05em" }}>問題框定</h3>
          <p style={{ color: "var(--sy-ink)", fontSize: "15px", fontWeight: 500, lineHeight: 1.5 }}>{decisionPrompt.problemFraming}</p>
        </div>

        <div className="decision-block">
          <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", textTransform: "uppercase", letterSpacing: "0.05em" }}>推薦模型</h3>
          <p style={{ color: "var(--sy-deep)", fontSize: "15px", fontWeight: 600 }}>{decisionPrompt.recommendedModel}</p>
        </div>

        <div className="decision-block">
          <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>輔助資源</h3>
          <div className="stack" style={{ gap: 12 }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--sy-slate)", marginBottom: 6, fontWeight: 700 }}>相關腦袋</div>
              <div className="meta-row">
                {relatedBrains.map((brain) => (
                  <span className="badge" key={brain.id} style={{ background: "var(--sy-cloud)", color: "var(--sy-deep)" }}>
                    {brain.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--sy-slate)", marginBottom: 6, fontWeight: 700 }}>知識節點</div>
              <div className="meta-row">
                {relatedNodes.map((node) => (
                  <span className="badge" key={node.id} style={{ background: "var(--sy-mist)", color: "var(--sy-deep)" }}>
                    {node.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="decision-block" style={{ background: "var(--sy-cloud)", margin: "0 -28px", padding: "20px 28px", borderTop: "1px solid var(--sy-line)", borderBottom: "1px solid var(--sy-line)" }}>
          <h3 style={{ fontSize: "14px", color: "var(--sy-deep)", textTransform: "uppercase", letterSpacing: "0.05em" }}>建議下一步</h3>
          <p style={{ color: "var(--sy-ink)", fontSize: "15px", fontWeight: 600, marginBottom: 0 }}>{decisionPrompt.suggestedNextStep}</p>
        </div>

        <div className="decision-block">
          <h3 style={{ fontSize: "14px", color: "var(--sy-ember)", textTransform: "uppercase", letterSpacing: "0.05em" }}>升級條件 (Escalation)</h3>
          <p style={{ color: "var(--sy-slate)", fontSize: "14px", fontStyle: "italic" }}>{decisionPrompt.escalationCondition}</p>
        </div>
      </div>
    </aside>
  );
}
