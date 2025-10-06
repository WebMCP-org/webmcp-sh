CREATE TABLE "conversation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"token_count" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"summary" text,
	"message_count" integer DEFAULT 0 NOT NULL,
	"entity_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "entity_contexts" (
	"entity_id" uuid NOT NULL,
	"context_id" uuid NOT NULL,
	"relevance_score" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entity_contexts_entity_id_context_id_pk" PRIMARY KEY("entity_id","context_id")
);
--> statement-breakpoint
CREATE TABLE "entity_mentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"mention_context" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_entity_id" uuid NOT NULL,
	"to_entity_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"description" text,
	"strength" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_type" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"metadata" jsonb,
	"char_limit" integer DEFAULT 500 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"token_cost" integer GENERATED ALWAYS AS (CEIL(LENGTH("memory_blocks"."value")::NUMERIC / 4)) STORED NOT NULL,
	"inclusion_priority" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed" timestamp
);
--> statement-breakpoint
CREATE TABLE "memory_budget_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"total_tokens_available" integer NOT NULL,
	"tokens_used" integer NOT NULL,
	"memories_included" uuid[] DEFAULT '{}' NOT NULL,
	"memories_excluded" uuid[] DEFAULT '{}' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_conflicts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_a_id" uuid NOT NULL,
	"entity_b_id" uuid NOT NULL,
	"conflict_type" text NOT NULL,
	"resolution_status" text DEFAULT 'pending' NOT NULL,
	"resolution_entity_id" uuid,
	"resolution_strategy" text,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "memory_consolidations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consolidation_type" text NOT NULL,
	"source_entity_ids" uuid[] NOT NULL,
	"target_entity_id" uuid NOT NULL,
	"reason" text,
	"confidence" integer DEFAULT 50 NOT NULL,
	"consolidated_at" timestamp DEFAULT now() NOT NULL,
	"consolidated_by" text DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_contexts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_context_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memory_contexts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "memory_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"confidence" integer DEFAULT 100 NOT NULL,
	"source_type" text,
	"source_session_id" uuid,
	"source_message_id" uuid,
	"mention_count" integer DEFAULT 1 NOT NULL,
	"last_mentioned" timestamp DEFAULT now() NOT NULL,
	"importance_score" integer DEFAULT 50 NOT NULL,
	"memory_tier" text DEFAULT 'short_term' NOT NULL,
	"access_count" integer DEFAULT 0 NOT NULL,
	"last_accessed" timestamp,
	"promotion_score" integer DEFAULT 0 NOT NULL,
	"decay_rate" integer DEFAULT 10 NOT NULL,
	"last_reinforced" timestamp DEFAULT now() NOT NULL,
	"current_strength" integer DEFAULT 100 NOT NULL,
	"memory_type" text DEFAULT 'semantic' NOT NULL,
	"token_cost" integer GENERATED ALWAYS AS (CEIL(LENGTH("memory_entities"."name" || ' ' || "memory_entities"."description")::NUMERIC / 4)) STORED NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"content" text NOT NULL,
	"related_entity_ids" uuid[] DEFAULT '{}' NOT NULL,
	"temporal_order" integer NOT NULL,
	"emotional_context" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_retrieval_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"query_text" text,
	"query_type" text,
	"retrieved_entity_ids" jsonb,
	"retrieval_scores" jsonb,
	"retrieval_time_ms" integer,
	"result_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_value" text NOT NULL,
	"strength" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_contexts" ADD CONSTRAINT "entity_contexts_entity_id_memory_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_contexts" ADD CONSTRAINT "entity_contexts_context_id_memory_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."memory_contexts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_mentions" ADD CONSTRAINT "entity_mentions_entity_id_memory_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_mentions" ADD CONSTRAINT "entity_mentions_message_id_conversation_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."conversation_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_mentions" ADD CONSTRAINT "entity_mentions_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_relationships" ADD CONSTRAINT "entity_relationships_from_entity_id_memory_entities_id_fk" FOREIGN KEY ("from_entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_relationships" ADD CONSTRAINT "entity_relationships_to_entity_id_memory_entities_id_fk" FOREIGN KEY ("to_entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_budget_logs" ADD CONSTRAINT "memory_budget_logs_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_conflicts" ADD CONSTRAINT "memory_conflicts_entity_a_id_memory_entities_id_fk" FOREIGN KEY ("entity_a_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_conflicts" ADD CONSTRAINT "memory_conflicts_entity_b_id_memory_entities_id_fk" FOREIGN KEY ("entity_b_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_conflicts" ADD CONSTRAINT "memory_conflicts_resolution_entity_id_memory_entities_id_fk" FOREIGN KEY ("resolution_entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_consolidations" ADD CONSTRAINT "memory_consolidations_target_entity_id_memory_entities_id_fk" FOREIGN KEY ("target_entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_contexts" ADD CONSTRAINT "memory_contexts_parent_context_id_memory_contexts_id_fk" FOREIGN KEY ("parent_context_id") REFERENCES "public"."memory_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_episodes" ADD CONSTRAINT "memory_episodes_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_retrieval_logs" ADD CONSTRAINT "memory_retrieval_logs_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_triggers" ADD CONSTRAINT "memory_triggers_entity_id_memory_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."memory_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conv_messages_session_idx" ON "conversation_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "conv_messages_created_idx" ON "conversation_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "conv_messages_role_idx" ON "conversation_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "conv_sessions_started_idx" ON "conversation_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "conv_sessions_last_activity_idx" ON "conversation_sessions" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "entity_contexts_entity_idx" ON "entity_contexts" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "entity_contexts_context_idx" ON "entity_contexts" USING btree ("context_id");--> statement-breakpoint
CREATE INDEX "entity_mentions_entity_idx" ON "entity_mentions" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "entity_mentions_message_idx" ON "entity_mentions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "entity_mentions_session_idx" ON "entity_mentions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "entity_mentions_created_idx" ON "entity_mentions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entity_rel_from_idx" ON "entity_relationships" USING btree ("from_entity_id");--> statement-breakpoint
CREATE INDEX "entity_rel_to_idx" ON "entity_relationships" USING btree ("to_entity_id");--> statement-breakpoint
CREATE INDEX "entity_rel_type_idx" ON "entity_relationships" USING btree ("relationship_type");--> statement-breakpoint
CREATE INDEX "memory_blocks_type_idx" ON "memory_blocks" USING btree ("block_type");--> statement-breakpoint
CREATE INDEX "memory_blocks_priority_idx" ON "memory_blocks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "memory_blocks_updated_idx" ON "memory_blocks" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "memory_blocks_inclusion_idx" ON "memory_blocks" USING btree ("inclusion_priority");--> statement-breakpoint
CREATE INDEX "budget_logs_session_idx" ON "memory_budget_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "budget_logs_timestamp_idx" ON "memory_budget_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "conflicts_status_idx" ON "memory_conflicts" USING btree ("resolution_status");--> statement-breakpoint
CREATE INDEX "conflicts_type_idx" ON "memory_conflicts" USING btree ("conflict_type");--> statement-breakpoint
CREATE INDEX "consolidations_target_idx" ON "memory_consolidations" USING btree ("target_entity_id");--> statement-breakpoint
CREATE INDEX "consolidations_type_idx" ON "memory_consolidations" USING btree ("consolidation_type");--> statement-breakpoint
CREATE INDEX "contexts_name_idx" ON "memory_contexts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contexts_parent_idx" ON "memory_contexts" USING btree ("parent_context_id");--> statement-breakpoint
CREATE INDEX "memory_entities_category_idx" ON "memory_entities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "memory_entities_tags_idx" ON "memory_entities" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "memory_entities_mention_count_idx" ON "memory_entities" USING btree ("mention_count");--> statement-breakpoint
CREATE INDEX "memory_entities_last_mentioned_idx" ON "memory_entities" USING btree ("last_mentioned");--> statement-breakpoint
CREATE INDEX "memory_entities_importance_idx" ON "memory_entities" USING btree ("importance_score");--> statement-breakpoint
CREATE INDEX "memory_entities_name_idx" ON "memory_entities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "memory_entities_tier_idx" ON "memory_entities" USING btree ("memory_tier");--> statement-breakpoint
CREATE INDEX "memory_entities_access_count_idx" ON "memory_entities" USING btree ("access_count");--> statement-breakpoint
CREATE INDEX "memory_entities_last_accessed_idx" ON "memory_entities" USING btree ("last_accessed");--> statement-breakpoint
CREATE INDEX "memory_entities_strength_idx" ON "memory_entities" USING btree ("current_strength");--> statement-breakpoint
CREATE INDEX "memory_entities_type_idx" ON "memory_entities" USING btree ("memory_type");--> statement-breakpoint
CREATE INDEX "episodes_session_idx" ON "memory_episodes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "episodes_temporal_idx" ON "memory_episodes" USING btree ("temporal_order");--> statement-breakpoint
CREATE INDEX "episodes_type_idx" ON "memory_episodes" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "memory_retrieval_session_idx" ON "memory_retrieval_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "memory_retrieval_created_idx" ON "memory_retrieval_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "triggers_entity_idx" ON "memory_triggers" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "triggers_type_idx" ON "memory_triggers" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "triggers_value_idx" ON "memory_triggers" USING btree ("trigger_value");