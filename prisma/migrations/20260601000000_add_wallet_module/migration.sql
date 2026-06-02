-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TransactionStatus" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable bank_accounts
CREATE TABLE IF NOT EXISTS "bank_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable transactions
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bank_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "bank_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable budgets
CREATE TABLE IF NOT EXISTS "budgets" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bank_accounts_account_number_key" ON "bank_accounts"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "budgets_user_id_month_year_key" ON "budgets"("user_id", "month", "year");

-- AddForeignKey (bank_accounts → users)
DO $$ BEGIN
  ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (transactions → bank_accounts)
DO $$ BEGIN
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_account_id_fkey"
    FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (subscriptions → bank_accounts)
DO $$ BEGIN
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_bank_account_id_fkey"
    FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (budgets → users)
DO $$ BEGIN
  ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
