-- CreateTable
CREATE TABLE "_loginHistory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_loginHistory_A_fkey" FOREIGN KEY ("A") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_loginHistory_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_loginHistory_AB_unique" ON "_loginHistory"("A", "B");

-- CreateIndex
CREATE INDEX "_loginHistory_B_index" ON "_loginHistory"("B");
