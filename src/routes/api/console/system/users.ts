import { Hono } from 'hono';
import { Env } from '../../../../utils/interface';
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
	const results = {
		"buttons": [
			{
				"type": "add",
				"title": "table.add",
				"buttons": [
					{
						"title": "table.cancel"
					},
					{
						"title": "table.add",
						"type": "primary"
					}
				]
			},
			{
				"type": "delete",
				"title": "table.delete",
				"popconfirm": {
					"title": "table.popconfirm_delete_batch",
					"okText": "table.delete",
					"cancelText": "table.cancel"
				}
			}
		],
		"table": {
			"columns": [
				{
					"title": "UID",
					"dataIndex": "uid",
					"width": 80,
					"sorter": true,
					"sql_where": "`uid`=?",
					"form": "input",
					"disabled": true,
					"readonly": true
				},
				{
					"title": "table.username",
					"dataIndex": "username",
					"width": 100,
					"sorter": true,
					"sql_where": "`username` LIKE ?",
					"form": "input",
					"placeholder": "table.please_enter",
					"rules": [
						{
							"required": true,
							"message": "table.please_enter"
						}
					]
				},
				{
					"title": "table.password",
					"dataIndex": "password",
					"form": "input",
					"placeholder": "table.please_enter",
					"rules": [
						{
							"required": true,
							"message": "table.please_enter"
						}
					]
				},
				{
					"title": "table.roles",
					"dataIndex": "roles",
					"width": 80,
					"sorter": true,
					"form": "input",
					"sql_where": "`roles` LIKE ?"
				},
				{
					"title": "table.nickname",
					"dataIndex": "nickname",
					"width": 80,
					"sorter": true,
					"form": "input",
					"rules": [
						{
							"required": true,
							"message": "table.please_enter"
						}
					],
					"sql_where": "`nickname` LIKE ?"
				},
				{
					"title": "table.remark",
					"dataIndex": "remark",
					"width": 100,
					"sorter": true,
					"sql_where": "`remark` LIKE ?",
					"form": "input",
					"placeholder": "table.please_enter",
					"rules": [
						{
							"required": false,
							"message": "table.please_enter"
						}
					]
				},
				{
					"title": "table.operates",
					"fixed": "right",
					"width": 140,
					"operates": [
						{
							"action": "view",
							"title": "table.view"
						},
						{
							"action": "edit",
							"title": "table.edit",
							"buttons": [
								{
									"title": "table.cancel"
								},
								{
									"title": "table.save",
									"type": "primary"
								}
							]
						},
						{
							"action": "delete",
							"title": "table.delete",
							"popconfirm": {
								"title": "table.popconfirm_delete",
								"okText": "table.delete",
								"cancelText": "table.cancel"
							}
						}
					]
				}
			],
			"pagination": {
				"pageSizeOptions": [
					"10",
					"20",
					"50",
					"100"
				],
				"showTotalTemplate": "table.showTotalTemplate",
				"total": "4",
				"current": 1,
				"pageSize": 18
			},
			"rowKey": "uid",
			"rowSelection": true,
			"dataSource": [
				{
					"uid": "1",
					"username": "admin",
					"password": "admin",
					"roles": "sysadmin",
					"nickname": "test",
					"remark": "test1"
				},
			]
		}
	};
	return c.json(results);
});

export default app;
