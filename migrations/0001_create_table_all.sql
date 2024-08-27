-- CreateTable
CREATE TABLE "links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" INTEGER NOT NULL,
    "updated" INTEGER,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

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
    "roles" TEXT NOT NULL DEFAULT 'user'
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

-- CreateTable
CREATE TABLE "pre_bee_logs" (
    "no" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldvalue" TEXT,
    "newvalue" TEXT,
    "changeby" TEXT,
    "date" DATETIME NOT NULL,
    "requestnumber" TEXT,
    "remark" TEXT,
    "processed" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "pre_bee_customer_nwsrvs" (
    "code" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT NOT NULL,
    "customername" TEXT,
    "customername_cn" TEXT,
    "status" TEXT,
    "download" TEXT,
    "upload" TEXT,
    "package" TEXT,
    "ipservice" TEXT
);

-- CreateTable
CREATE TABLE "pre_bee_customer_nwsrv_dates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT NOT NULL,
    "by_date" DATETIME NOT NULL,
    "status" TEXT,
    "ip_pcs" INTEGER NOT NULL DEFAULT 0,
    "bw_dl_mbps" INTEGER,
    "bw_ul_mbps" INTEGER,
    "package" TEXT,
    "ipservice" TEXT
);

-- CreateTable
CREATE TABLE "pre_bee_customer_nwsrv_prices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "ipservice" TEXT NOT NULL,
    "price_bw" REAL NOT NULL,
    "price_ip" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "pre_bee_customer_nwsrv_bills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT NOT NULL,
    "date_begin" DATETIME NOT NULL,
    "date_end" DATETIME NOT NULL,
    "package" TEXT NOT NULL,
    "ipservice" TEXT NOT NULL,
    "bw_dl_mbps" INTEGER NOT NULL,
    "bw_ul_mbps" INTEGER NOT NULL,
    "ip_pcs" INTEGER NOT NULL,
    "price_bw" REAL NOT NULL,
    "price_ip" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "pre_bee_dict" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "zh_cn" TEXT
);

-- CreateTable
CREATE TABLE "pre_bee_customer_nwsrv_sellers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT NOT NULL,
    "pjmt" TEXT,
    "area" TEXT,
    "seller" TEXT
);

-- CreateTable
CREATE TABLE "pre_bee_customer_nwsrv_bills_amy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerid" TEXT,
    "date_begin" DATETIME,
    "date_end" DATETIME,
    "days" INTEGER,
    "package" TEXT,
    "ipservice" TEXT,
    "bw_dl_mbps" INTEGER,
    "bw_ul_mbps" INTEGER,
    "ip_pcs" INTEGER,
    "price_bw" REAL,
    "price_ip" REAL,
    "subtotal" REAL,
    "discount" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "links_name_key" ON "links"("name");

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

-- CreateIndex
CREATE INDEX "pre_bee_logs_processed_idx" ON "pre_bee_logs"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_customer_nwsrvs_customerid_key" ON "pre_bee_customer_nwsrvs"("customerid");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_customer_nwsrv_dates_customerid_by_date_key" ON "pre_bee_customer_nwsrv_dates"("customerid", "by_date");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_customer_nwsrv_prices_customerid_package_ipservice_key" ON "pre_bee_customer_nwsrv_prices"("customerid", "package", "ipservice");

-- CreateIndex
CREATE INDEX "pre_bee_customer_nwsrv_bills_customerid_idx" ON "pre_bee_customer_nwsrv_bills"("customerid");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_customer_nwsrv_bills_date_begin_customerid_key" ON "pre_bee_customer_nwsrv_bills"("date_begin", "customerid");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_customer_nwsrv_bills_date_end_customerid_key" ON "pre_bee_customer_nwsrv_bills"("date_end", "customerid");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_dict_code_key" ON "pre_bee_dict"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pre_bee_customer_nwsrv_sellers_customerid_key" ON "pre_bee_customer_nwsrv_sellers"("customerid");

-- CreateIndex
CREATE INDEX "pre_bee_customer_nwsrv_bills_amy_customerid_idx" ON "pre_bee_customer_nwsrv_bills_amy"("customerid");

