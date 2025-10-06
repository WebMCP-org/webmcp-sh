CREATE TABLE "sql_execution_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"source" text NOT NULL,
	"success" boolean NOT NULL,
	"rows_affected" integer,
	"error_message" text,
	"execution_time_ms" integer,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sql_log_source_idx" ON "sql_execution_log" USING btree ("source");--> statement-breakpoint
CREATE INDEX "sql_log_executed_idx" ON "sql_execution_log" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "sql_log_success_idx" ON "sql_execution_log" USING btree ("success");