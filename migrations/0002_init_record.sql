DROP TABLE IF EXISTS pre_system_menus;
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
CREATE UNIQUE INDEX "pre_system_menus_parent_id_name_key" ON "pre_system_menus"("parent_id", "name");
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (1, 1673628456162, 1674324685354, 0, 0, 0, 'Dashboard', '主页', '/dashboard', 'bx:bx-home', 'LAYOUT', 100, 0, '/dashboard/analysis', '{"hideChildrenInMenu": true}');
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (2, 1673628456165, 1674196181252, 0, 1, 1, 'Analysis', '分析页', 'analysis', 'bx:bx-home', '/dashboard/analysis/index', 100, 0, NULL, '{"hideMenu": true, "hideBreadcrumb": true, "currentActiveMenu": "/dashboard"}');
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (3, 1673628456166, 1674196162932, 2, 1, 1, 'Workbench', '工作台', 'workbench', 'bx:bx-home', '/dashboard/workbench/index', 100, 0, NULL, '{"hideMenu": true, "hideBreadcrumb": true, "currentActiveMenu": "/dashboard"}');
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (4, 1673628456168, 1674195725901, 2, 0, 0, 'Permission', '权限管理', '/permission', 'carbon:user-role', 'LAYOUT', 100, 0, '/permission/front/page', NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (5, 1673628456171, 1674195732527, 2, 4, 1, 'PermissionBackDemo', '基于后台权限', 'back', NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (6, 1673628456172, 1674195738826, 2, 5, 1, 'BackAuthPage', '页面权限', 'page', NULL, '/demo/permission/back/index', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (7, 1673628456174, 1674195740268, 2, 5, 1, 'BackAuthBtn', '按钮权限', 'btn', NULL, '/demo/permission/back/Btn', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (8, 1673628456175, 1674195741293, 2, 0, 0, 'Level', '多级菜单', '/level', 'carbon:user-role', 'LAYOUT', 100, 0, '/level/menu1/menu1-1', NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (9, 1673628456176, 1674195742278, 2, 8, 1, 'Menu1Demo', 'Menu1Demo', 'menu1', NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (10, 1673628456178, 1674195743253, 2, 9, 1, 'Menu11Demo', 'Menu11Demo', 'menu1-1', NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (11, 1673628456179, 1674195744128, 2, 10, 1, 'Menu111Demo', 'Menu111Demo', 'menu1-1-1', NULL, '/demo/level/Menu111', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (12, 1673628456180, 1674195745050, 2, 9, 1, 'Menu12Demo', 'Menu12Demo', 'menu1-2', NULL, '/demo/level/Menu12', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (13, 1673628456182, 1674195746023, 2, 8, 1, 'Menu2Demo', 'Menu2Demo', 'menu2', NULL, '/demo/level/Menu2', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (14, 1673628456184, 1674195191118, 0, 0, 0, 'System', '系统管理', '/system', 'ion:settings-outline', 'LAYOUT', 100, 0, '/system/account', NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (15, 1673628456186, 1674377257587, 0, 14, 1, 'AccountManagement', '账号管理', 'account', 'ant-design:usergroup-add-outlined', '/demo/system/account/index', 100, 1, NULL, '{"ignoreKeepAlive": true}');
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (16, 1673628456187, 1674377197298, 0, 15, 1, 'AccountDetail', '账号详情', 'account_detail/:id', 'ant-design:usergroup-add-outlined', '/demo/system/account/AccountDetail', 100, 1, NULL, '{"hideMenu": true, "showMenu": false, "currentActiveMenu": "/system/account"}');
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (17, 1673628456188, 1674405302252, 0, 14, 1, 'RoleManagement', '角色管理', 'role', 'ant-design:android-filled', '/demo/system/role/index', 100, 1, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (18, 1673628456190, 1674405028063, 0, 14, 1, 'MenuManagement', '菜单管理', 'menu', 'ant-design:menu-outlined', '/demo/system/menu/index', 100, 1, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (19, 1673628456191, 1674405046929, 0, 14, 1, 'DeptManagement', '部门管理', 'dept', 'ant-design:deployment-unit-outlined', '/demo/system/dept/index', 100, 1, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (20, 1673628456193, 1674375981619, 0, 39, 1, 'ChangePassword', '修改密码', 'changePassword', 'ant-design:lock-outlined', '/demo/system/password/index', 100, 1, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (21, 1673628456194, 1674195720343, 2, 0, 0, 'Link', '外部页面', '/link', 'ion:tv-outline', 'LAYOUT', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (22, 1673628456196, 1674195748930, 2, 21, 1, 'Doc', '项目文档(内嵌)', 'doc', NULL, NULL, 100, 0, NULL, '{"frameSrc": "https://vvbin.cn/doc-next/"}');
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (23, 1673628456197, 1674195749787, 2, 21, 1, 'DocExternal', '项目文档(外链)', 'https://vvbin.cn/doc-next/', NULL, 'LAYOUT', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (24, 1673703235549, 1674303654149, 0, 17, 2, 'save', '修改角色', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (25, 1674054416114, 1674303653000, 0, 17, 2, 'add', '添加角色', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (26, 1674055119487, 1674303651660, 0, 17, 2, 'del', '删除角色', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (27, 1674143531931, 1674303650427, 0, 24, 2, 'menu', '菜单列表', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (28, 1674302276051, 1674303649179, 0, 18, 2, 'save', '保存菜单', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (29, 1674303144041, 1674303647914, 0, 18, 2, 'add', '新增菜单', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (30, 1674303206858, 1674303646439, 0, 18, 2, 'del', '删除菜单', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (31, 1674323836684, NULL, 0, 19, 2, 'save', '保存部门', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (32, 1674323854754, NULL, 0, 19, 2, 'add', '新增部门', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (33, 1674323874156, NULL, 0, 19, 2, 'del', '删除部门', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (34, 1674326105944, 1674374080266, 0, 15, 2, 'isAccountExist', '账号是否存在', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (35, 1674326235967, 1674374107120, 0, 15, 2, 'getAllRoleList', '获取全部角色', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (36, 1674374017365, NULL, 0, 15, 2, 'save', '保存用户', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (37, 1674374037754, NULL, 0, 15, 2, 'add', '新增用户', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (38, 1674374060361, NULL, 0, 15, 2, 'del', '删除用户', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (39, 1674375913972, 1674376761709, 0, 0, 0, 'me', '个人中心', '/me', 'ant-design:user-outlined', 'LAYOUT', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (40, 1674405426419, NULL, 0, 0, 0, 'bkatm', 'BKATM', '/bkatm', 'ant-design:bold-outlined', 'LAYOUT', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (41, 1674405480749, 1674571140261, 0, 40, 1, 'bankcard', '银行卡', 'bankcard', 'ant-design:credit-card-filled', '/xixi/table', 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (42, 1674653606689, NULL, 0, 41, 2, 'import', '银行卡导入', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (43, 1677081709056, 1677160480431, 0, 41, 2, 'recheck', '重新检测', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (44, 1677081739702, 1677160504122, 0, 41, 2, 'del', '删除', NULL, NULL, NULL, 100, 0, NULL, NULL);
INSERT INTO `pre_system_menus` (`id`, `created`, `updated`, `status`, `parent_id`, `type`, `name`, `title`, `path`, `icon`, `component`, `orderNo`, `keepalive`, `redirect`, `meta`) VALUES (45, 1674405480749, 1674571140261, 0, 40, 1, 'mail', '邮件', 'mail', 'ant-design:mail-filled', '/xixi/table', 100, 0, NULL, NULL);
