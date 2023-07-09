/*
  Warnings:

  - You are about to drop the `_loginHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_loginHistory_B_index";

-- DropIndex
DROP INDEX "_loginHistory_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_loginHistory";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("id", "message", "token") SELECT "id", "message", "token" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
