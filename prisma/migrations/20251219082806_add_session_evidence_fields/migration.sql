-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "completion_notes" TEXT,
ADD COLUMN     "student_join_time" TIMESTAMPTZ(6),
ADD COLUMN     "student_leave_time" TIMESTAMPTZ(6),
ADD COLUMN     "tutor_join_time" TIMESTAMPTZ(6),
ADD COLUMN     "tutor_leave_time" TIMESTAMPTZ(6);
