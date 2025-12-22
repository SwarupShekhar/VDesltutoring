-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'TUTOR', 'LEARNER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerkId" TEXT,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "user_role" DEFAULT 'LEARNER',
    "profile_image_url" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "last_login" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "price_usd" DECIMAL(10,2) NOT NULL,
    "credit_amount" INTEGER NOT NULL,
    "is_public" BOOLEAN DEFAULT true,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "tutor_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "status" "session_status" DEFAULT 'SCHEDULED',
    "livekit_room_id" TEXT,
    "meeting_link" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "primary_tutor_id" UUID,
    "learning_goals" TEXT,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "bio" TEXT,
    "expertise_tags" TEXT[],
    "hourly_rate_equivalent" INTEGER DEFAULT 1,

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutor_id" UUID,
    "day_of_week" INTEGER,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,

    CONSTRAINT "tutor_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_data_hash" TEXT NOT NULL,
    "response_data" JSONB,
    "status_code" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_livekit_room_id_key" ON "sessions"("livekit_room_id");

-- CreateIndex
CREATE INDEX "idx_sessions_start_time" ON "sessions"("start_time");

-- CreateIndex
CREATE INDEX "idx_sessions_student" ON "sessions"("student_id");

-- CreateIndex
CREATE INDEX "idx_sessions_tutor" ON "sessions"("tutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_profiles_user_id_key" ON "tutor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_tutor_tags" ON "tutor_profiles" USING GIN ("expertise_tags");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_availability_tutor_id_day_of_week_start_time_key" ON "tutor_availability"("tutor_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_key_key" ON "idempotency_records"("key");

-- CreateIndex
CREATE INDEX "idx_idempotency_key" ON "idempotency_records"("key");

-- CreateIndex
CREATE INDEX "idx_idempotency_expires" ON "idempotency_records"("expires_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tutor_availability" ADD CONSTRAINT "tutor_availability_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
