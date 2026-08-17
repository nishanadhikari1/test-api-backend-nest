-- CreateTable
CREATE TABLE "CookieJar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '/',
    "expires" TIMESTAMP(3),
    "httpOnly" BOOLEAN NOT NULL DEFAULT false,
    "secure" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieJar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CookieJar_userId_domain_idx" ON "CookieJar"("userId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "CookieJar_userId_domain_name_path_key" ON "CookieJar"("userId", "domain", "name", "path");

-- AddForeignKey
ALTER TABLE "CookieJar" ADD CONSTRAINT "CookieJar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
