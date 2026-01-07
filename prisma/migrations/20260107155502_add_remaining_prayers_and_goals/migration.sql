-- CreateTable
CREATE TABLE "remaining_prayers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fajrRemaining" INTEGER NOT NULL DEFAULT 0,
    "dhuhrRemaining" INTEGER NOT NULL DEFAULT 0,
    "asrRemaining" INTEGER NOT NULL DEFAULT 0,
    "maghribRemaining" INTEGER NOT NULL DEFAULT 0,
    "ishaRemaining" INTEGER NOT NULL DEFAULT 0,
    "witrRemaining" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remaining_prayers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fajrGoal" INTEGER NOT NULL DEFAULT 0,
    "dhuhrGoal" INTEGER NOT NULL DEFAULT 0,
    "asrGoal" INTEGER NOT NULL DEFAULT 0,
    "maghribGoal" INTEGER NOT NULL DEFAULT 0,
    "ishaGoal" INTEGER NOT NULL DEFAULT 0,
    "witrGoal" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_prayers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "fajrCompleted" INTEGER NOT NULL DEFAULT 0,
    "dhuhrCompleted" INTEGER NOT NULL DEFAULT 0,
    "asrCompleted" INTEGER NOT NULL DEFAULT 0,
    "maghribCompleted" INTEGER NOT NULL DEFAULT 0,
    "ishaCompleted" INTEGER NOT NULL DEFAULT 0,
    "witrCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completed_prayers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "remaining_prayers_userId_key" ON "remaining_prayers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "completed_prayers_userId_date_key" ON "completed_prayers"("userId", "date");

-- AddForeignKey
ALTER TABLE "remaining_prayers" ADD CONSTRAINT "remaining_prayers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_prayers" ADD CONSTRAINT "completed_prayers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
