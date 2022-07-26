/*
  Warnings:

  - You are about to drop the `_CreatorEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_CreatorEvent_B_index";

-- DropIndex
DROP INDEX "_CreatorEvent_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CreatorEvent";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "places" TEXT NOT NULL,
    "tickets" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER,
    CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "date", "description", "id", "imageUrl", "places", "price", "tickets", "title") SELECT "createdAt", "date", "description", "id", "imageUrl", "places", "price", "tickets", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
