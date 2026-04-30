# Domain Model Draft

This draft keeps Phase 1 focused on newcomer training and decision support.

## 1. User

Represents a platform user.

Fields:

- `id`
- `name`
- `email`
- `role`
- `status`

Roles:

- `jacky`
- `sophia`
- `yijia`
- `zhenghao`
- `newcomer`
- `admin`

## 2. Brain

Represents a callable decision context.

Types:

- `jacky`
- `team_member`
- `brand`

Fields:

- `id`
- `type`
- `name`
- `owner`
- `description`
- `when_to_use`
- `cannot_answer`
- `related_knowledge_node_ids`
- `trust_level`
- `updated_at`

## 3. KnowledgeNode

Represents a method, concept, SOP, case, or decision model.

Fields:

- `id`
- `title`
- `domain`
- `summary`
- `applies_when`
- `does_not_apply_when`
- `model_steps`
- `related_node_ids`
- `source_refs`
- `example_questions`
- `response_patterns`
- `platform_surfaces`

Example nodes:

- AI 行銷部
- 老闆 1-4 / AI 5-8
- 4 Agent 委員會
- SOSTAC
- AGENTS 拆建修串管交
- Brain / Hand / Infra
- 殘酷測試

## 4. TrainingTask

Represents a training unit that maps to real platform work.

Fields:

- `id`
- `title`
- `stage`
- `description`
- `scenario`
- `deliverable_format`
- `recommended_brain_ids`
- `recommended_knowledge_node_ids`
- `review_mode`
- `points`
- `required_for_certification`

Stages:

- `understand_shuangyun`
- `read_brand_brain`
- `content_task`
- `review_and_revision`
- `client_service_flow`
- `certification`

## 5. TrainingTaskAssignment

Represents a user's work on a task.

Fields:

- `id`
- `task_id`
- `user_id`
- `status`
- `submission`
- `submitted_at`
- `review_id`
- `trace_log_ids`

Statuses:

- `not_started`
- `in_progress`
- `submitted`
- `reviewed`
- `passed`
- `needs_revision`

## 6. DecisionPrompt

Represents one use of Jacky Decision Layer.

Fields:

- `id`
- `user_id`
- `surface`
- `task_assignment_id`
- `question`
- `problem_framing`
- `recommended_model`
- `related_knowledge_node_ids`
- `suggested_decision`
- `customer_reply_draft`
- `internal_reply_draft`
- `escalation_condition`

## 7. Review

Represents review of a training task or content output.

Fields:

- `id`
- `target_type`
- `target_id`
- `reviewer_id`
- `mode`
- `result`
- `score`
- `comments`
- `revision_instructions`

Modes:

- `structure`
- `brand`
- `compliance`
- `final`

Results:

- `pass`
- `needs_revision`
- `reject`

## 8. TraceLog

Records workflow evidence.

Fields:

- `id`
- `actor_id`
- `entity_type`
- `entity_id`
- `event_type`
- `before`
- `after`
- `note`
- `created_at`

Minimum Phase 1 events:

- `task_started`
- `decision_panel_opened`
- `task_submitted`
- `review_created`
- `certification_progress_updated`

## 9. CertificationProgress

Represents user's 60-point readiness.

Fields:

- `id`
- `user_id`
- `target_score`
- `current_score`
- `passed_task_count`
- `revision_pass_count`
- `review_pass_count`
- `ready_for_low_risk_client_work`

Initial target:

- 60 points
