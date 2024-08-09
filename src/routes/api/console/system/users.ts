import { Hono, Context } from 'hono';
import { BatchButton, TableColumn, Table, TablePagination, ResultData, ResponseResultData, ResponseMessage } from '../../../../utils/interface';
import { CFD1 } from '../../../../utils/cfd1';

// 定义一个接口来扩展Context
interface CustomContext extends Context {
	Bindings: Env,
	test: (data: any, status?: number) => Response;
}
const app = new Hono<CustomContext>();

const buttons: BatchButton[] = [
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
];

const columns: TableColumn[] = [
	{
		"title": "UID",
		"dataIndex": "user_id",
		"width": 80,
		"sorter": true,
		"sql_where": "`user_id`=?",
		"form": "input",
		"disabled": true,
		"readonly": true
	},
	{
		"title": "table.created",
		"dataIndex": "created",
		"width": 130,
		"sorter": true,
		"form": "input",
		"disabled": true,
		"readonly": true
	},
	{
		"title": "table.email",
		"dataIndex": "email",
		"width": 100,
		"sorter": true,
		"sql_where": "`email` LIKE ?",
		"form": "input",
		"placeholder": "table.please_enter",
		"rules": [
			{
				"required": true,
				"message": "table.please_enter"
			}
		],
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
		],
	},
	{
		"title": "table.roles",
		"dataIndex": "roles",
		"width": 80,
		"sorter": true,
		"form": "input",
		"sql_where": "`roles` LIKE ?",
		"rules": [
			{
				"required": true,
				"message": "table.please_enter"
			}
		],
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
			},
		],
	},
];

const table: Table = {
	"from": "users",
	columns,
	"rowKey": "user_id",
	"rowSelection": true,
};

app.get('/', async (c) => {
	const action = c.req.query("action");
	const pagination: TablePagination = JSON.parse(c.req.param("pagination") ?? '{}');
	table.pagination = {
		"pageSizeOptions": [
			10,
			20,
			50,
			100
		],
		"showTotalTemplate": "table.showTotalTemplate",
		"total": 4,
		"current": 1,
		"pageSize": 18
	};
	table.dataSource = [
		{
			"id": "1",
			"email": "xixi@firadio.com",
			"password": "admin",
			"roles": "sysadmin",
		},
	];
	if (action === 'init') {
		const select: Record<string, string> = {};
		for (const column of columns) {
			if (typeof column.dataIndex == 'string') {
				select[column.dataIndex] = column.dataIndex;
			}
		}
		const oCFD1 = CFD1(c.env.DB);
		const oSql = oCFD1.sql();
		oSql.select(select);
		oSql.from(table.from);
		oSql.orderBy(['user_id DESC']);
		oSql.offset(Number(c.req.query('offset') || 0));
		oSql.limit(Number(c.req.query('limit') || 10));
		oSql.buildSelect();
		console.log('执行的SQL语句', oCFD1.getSQL(oSql));
		table.dataSource = (await oCFD1.all(oSql)).results;
	}
	if (action === 'init') {
		const results: ResultData = {
			buttons,
			table,
		};
		throw new ResponseResultData(results);
	};
	throw new Error(`no action=${action}`);

});

app.post('/', async (c) => {
	const action = c.req.query("action");
	const jsonReq = await c.req.json();
	console.log(jsonReq);
	if (action === 'create') {
		const oCFD1 = CFD1(c.env.DB);
		const mAddData: Record<string, string | number> = {};
		for (const column of columns) {
			if (typeof column.dataIndex == 'string') {
				if (column.dataIndex === 'created') {
					mAddData[column.dataIndex] = +new Date();
					continue;
				}
				if (column.disabled) {
					continue;
				}
				if (column.readonly) {
					continue;
				}
				mAddData[column.dataIndex] = jsonReq[column.dataIndex];
			}
		}
		const oSql = oCFD1.sql().from(table.from).buildInsert(mAddData);
		console.log('插入数据库表的SQL语句', oCFD1.getSQL(oSql), oCFD1.getParam(oSql));
		const r2 = await oCFD1.all(oSql);
		if (r2.success) {
			console.log('用户添加成功', r2);
			throw new ResponseMessage('用户添加成功');
		}
	}
	throw new Error(`no action=${action}`);
});

export default app;
