import { TaskCard } from "@/components/TaskCard";
import { taskAssignments, trainingTasks } from "@/lib/seed";

export default function TrainingTasksPage() {
  return (
    <div className="stack">
      <section className="section">
        <div className="eyebrow">Training task list</div>
        <h1>任務訓練場</h1>
        <p>新人依序完成任務，從問題框定、品牌檢查到內容交付形成閉環。</p>
      </section>

      <section className="section">
        <div className="card-list">
          {taskAssignments.map((assignment) => {
            const task = trainingTasks.find(
              (candidate) => candidate.id === assignment.taskId,
            )!;
            return (
              <TaskCard assignment={assignment} key={assignment.id} task={task} />
            );
          })}
        </div>
      </section>
    </div>
  );
}
