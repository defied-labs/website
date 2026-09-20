-- DropIndex
DROP INDEX `invitation_email_idx` ON `invitation`;

-- CreateIndex
CREATE INDEX `account_userId_idx` ON `account`(`userId`(191));

-- CreateIndex
CREATE INDEX `invitation_organizationId_idx` ON `invitation`(`organizationId`(191));

-- CreateIndex
CREATE INDEX `invitation_email_idx` ON `invitation`(`email`(191));

-- CreateIndex
CREATE INDEX `post_authorId_idx` ON `post`(`authorId`(191));

-- CreateIndex
CREATE INDEX `session_userId_idx` ON `session`(`userId`(191));
