-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "user_type" TEXT,
    "action" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "resource_type" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_audit_user" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_audit_event_type" ON "audit_logs"("event_type");

-- CreateIndex
CREATE INDEX "idx_audit_resource" ON "audit_logs"("resource_id");

-- CreateIndex
CREATE INDEX "idx_audit_created_at" ON "audit_logs"("created_at");
