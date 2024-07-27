-- Migration number: 0001 	 2024-07-26T13:45:42.161Z
-- CreateTable
CREATE TABLE "mails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" INTEGER NOT NULL,
    "domain_from" TEXT NOT NULL,
    "domain_to" TEXT NOT NULL,
    "email_from" TEXT NOT NULL,
    "email_to" TEXT NOT NULL,
    "headers" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_text" TEXT,
    "body_html" TEXT
);
