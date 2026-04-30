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
    <aside className="section decision-panel">
      <div className="eyebrow">Jacky Decision Panel</div>
      <h2>{task.title}</h2>
      <div className="stack">
        <div className="decision-block">
          <h3>問題框定</h3>
          <p>{decisionPrompt.problemFraming}</p>
        </div>
        <div className="decision-block">
          <h3>推薦模型</h3>
          <p>{decisionPrompt.recommendedModel}</p>
        </div>
        <div className="decision-block">
          <h3>相關腦袋</h3>
          <div className="meta-row">
            {relatedBrains.map((brain) => (
              <span className="badge" key={brain.id}>
                {brain.name}
              </span>
            ))}
          </div>
        </div>
        <div className="decision-block">
          <h3>知識節點</h3>
          <div className="meta-row">
            {relatedNodes.map((node) => (
              <span className="badge" key={node.id}>
                {node.title}
              </span>
            ))}
          </div>
        </div>
        <div className="decision-block">
          <h3>下一步</h3>
          <p>{decisionPrompt.suggestedNextStep}</p>
        </div>
        <div className="decision-block">
          <h3>升級條件</h3>
          <p>{decisionPrompt.escalationCondition}</p>
        </div>
      </div>
    </aside>
  );
}
