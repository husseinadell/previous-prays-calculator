-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "pubertyDate" TIMESTAMP(3) NOT NULL,
    "regularPrayerStartDate" TIMESTAMP(3),
    "periodDaysAverage" DOUBLE PRECISION,
    "fajrMissPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dhuhrMissPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "asrMissPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maghribMissPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ishaMissPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jomaaMissPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
