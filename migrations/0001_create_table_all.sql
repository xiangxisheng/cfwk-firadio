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

-- CreateTable
CREATE TABLE "pre_system_configs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "pre_system_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" INTEGER NOT NULL,
    "updated" INTEGER,
    "logged" INTEGER,
    "login_name" TEXT NOT NULL,
    "login_password" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "roles" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "pre_system_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" INTEGER NOT NULL,
    "updated" INTEGER,
    "logged" INTEGER,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "pre_system_menus_parent_id_name_key" ON "pre_system_menus"("parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pre_system_configs_name_key" ON "pre_system_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pre_system_users_login_name_key" ON "pre_system_users"("login_name");

-- CreateIndex
CREATE UNIQUE INDEX "pre_system_sessions_token_key" ON "pre_system_sessions"("token");

-- CreateIndex
CREATE INDEX "pre_system_sessions_user_id_idx" ON "pre_system_sessions"("user_id");

