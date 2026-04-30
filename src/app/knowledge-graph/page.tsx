import { knowledgeNodes } from "@/lib/seed";

export default function KnowledgeGraphPage() {
  return (
    <div className="stack">
      <section className="section">
        <div className="eyebrow">Knowledge graph MVP</div>
        <h1>知識圖譜中心</h1>
        <p>先用最小節點瀏覽器保存方法論、品牌脈絡與品管規則的來源。</p>
      </section>

      <section className="section">
        <div className="card-list">
          {knowledgeNodes.map((node) => (
            <article className="node-card" key={node.id}>
              <div className="section-header">
                <div>
                  <div className="eyebrow">{node.domain}</div>
                  <h2>{node.title}</h2>
                </div>
                <span className="badge">{node.source}</span>
              </div>
              <p>{node.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
