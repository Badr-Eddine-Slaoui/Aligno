-- Drop legacy auth tables so the current schema can be created cleanly
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_picture_url" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verify_token" TEXT,
    "email_verify_expires" TIMESTAMP(3),
    "refresh_token" TEXT,
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
