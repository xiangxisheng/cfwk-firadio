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

-- CreateTable
CREATE TABLE "users" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "pre_system_menus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" INTEGER NOT NULL,
    "updated" INTEGER,
    "status" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT,
    "icon" TEXT,
    "component" TEXT,
    "orderNo" INTEGER NOT NULL,
    "keepalive" INTEGER NOT NULL,
    "redirect" TEXT,
    "meta" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pre_system_menus_parent_id_name_key" ON "pre_system_menus"("parent_id", "name");

