import { brains } from "@/lib/seed";

export default function BrainsPage() {
  return (
    <div className="stack">
      <section className="section">
        <div className="eyebrow">Brain directory</div>
        <h1>腦袋資料庫</h1>
        <p>Phase 1 先列出新人在任務中可以查用的決策腦、成員腦、品牌腦與方法論節點。</p>
      </section>

      <section className="section">
        <div className="card-list">
          {brains.map((brain) => (
            <article className="brain-card" key={brain.id}>
              <div className="section-header">
                <div>
                  <div className="eyebrow">{brain.type}</div>
                  <h2>{brain.name}</h2>
                </div>
                <span className="badge">{brain.owner}</span>
              </div>
              <p>{brain.summary}</p>
              <div className="meta-row">
                {brain.coverage.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
