import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { delay, ResJSON, ResJsonTableColumn } from '@/utils/common/api';
import type { ColumnComponentType, ColumnDataType } from '@/utils/common/api';
const app = Route();

interface File {
	name: string;
	size: number,
	type: string,
	response: {
		file_sha1: string;
	}
}

interface FileVal {
	file: File;
	fileList: File[];
}

function getItemByColumnJson(column: Record<string, unknown>, json: Record<string, unknown>): Record<string, unknown> | undefined {
	if (!column.id) {
		throw new Error('no column.id');
	}
	if (!column.datatype) {
		throw new Error('no column.datatype');
	}
	const jsonKey = `col_${column.id}`;
	const val = json[jsonKey];
	const res: Record<string, unknown> = {};
	if (val === undefined) {
		//throw new Error(`not found column.id[${jsonKey}] in json`);
		return;
	}
	res[`value_${column.datatype.toString()}`] = val;
	const fileVal = val as FileVal;
	if (fileVal.file) {
		console.log(fileVal);
	}
	return res;
}

function getValuesBase(columns: Record<string, unknown>[], json: Record<string, unknown>): string {
	const values_base: Record<string, unknown> = {};
	for (const column of columns) {
		const jsonKey = `col_${column.id}`;
		const val = json[jsonKey];
		if (!val) {
			//throw new Error(`not found column.id[${jsonKey}] in json`);
			continue;
		}
		values_base[jsonKey] = val;
	}
	return JSON.stringify(values_base);
}

app.use(async (c, next) => {
	//await delay(1000);
	return await next();
});

app.post('/', async (c) => {
	// 这是“CRUDL”中的“Create”
	const json = await c.req.json();
	const oCFD1 = new CFD1(c.env.DB);
	const columns = (await oCFD1.sql().from('pre_bkdata_data_columns').select({
		id: 'id',
		datatype: 'datatype',
	}).buildSelect().getStmt().all()).results;
	// 第1步：新增[row_id]
	const oSqlInsert1 = oCFD1.sql().from('pre_bkdata_data_rows');
	oSqlInsert1.set({
		created: Date.now(),
		values_base: getValuesBase(columns, json),
	}).buildInsert();
	const r1 = await oSqlInsert1.getStmt().run();
	if (!r1.meta.last_row_id) {
		return c.json({
			"code": "500",
			"message": '添加失败',
		});
	}
	// 第2步：插入相应的值
	const oSqlInsert2 = oCFD1.sql().from('pre_bkdata_data_row_values');
	for (const column of columns) {
		const item = getItemByColumnJson(column, json);
		if (!item) {
			continue;
		}
		oSqlInsert2.set({
			...item,
			column_id: column.id,
			row_id: r1.meta.last_row_id,
			created: Date.now(),
		}).buildInsert();
		await oSqlInsert2.getStmt().run();
	}
	return c.json({
		message: '添加成功！',
	});
});

app.get('/:id', async (ctx) => {
	// 这是“CRUDL”中的“Read”
	const id = ctx.req.param('id');
	const oCFD1 = new CFD1(ctx.env.DB);
	const oSql = oCFD1.sql().from('pre_bkdata_data_row_values t1 LEFT JOIN pre_bkdata_data_columns t2 ON t1.column_id=t2.id');
	oSql.where([['t1.row_id=?', [id]]]);
	oSql.select({
		column_id: 't1.column_id',
		value_int: 't1.value_int',
		value_float: 't1.value_float',
		value_string: 't1.value_string',
		value_datetime: 't1.value_datetime',
		datatype: 't2.datatype',
	});
	const rows = (await oSql.buildSelect().getStmt().all()).results;
	const res: Record<string, unknown> = {};
	const dataFunc = (_input: any) => {
		if (typeof _input === 'string' && _input.substring(0, 1) === '{') {
			// 自动解析JSON
			return JSON.parse(_input);
		}
		return _input;
	};
	for (const row of rows) {
		res[`col_${row.column_id}`] = dataFunc(row[`value_${row.datatype}`]);
	}
	return ctx.json(res);
});

app.put('/:id', async (c) => {
	// 这是“CRUDL”中的“Update”
	const id = c.req.param('id');
	const json = await c.req.json();
	const oCFD1 = new CFD1(c.env.DB);

	// 1：取得columns
	const columns = (await oCFD1.sql().from('pre_bkdata_data_columns').select({
		id: 'id',
		datatype: 'datatype',
	}).buildSelect().getStmt().all()).results;

	// 2：更新基本列
	const oSql = oCFD1.sql().from('pre_bkdata_data_rows');
	oSql.where([['id=?', [id]]]);
	oSql.set({
		updated: Date.now(),
		values_base: getValuesBase(columns, json),
	});
	await oSql.buildUpdate().getStmt().run();

	// 3：更新详情列
	const oSqlUpdate = oCFD1.sql().from('pre_bkdata_data_row_values');
	for (const column of columns) {
		const item = getItemByColumnJson(column, json);
		if (!item) {
			continue;
		}
		oSqlUpdate.where([['row_id=? AND column_id=?', [id, column.id as number]]]);
		oSqlUpdate.conflict({ row_id: id, column_id: column.id as number });
		oSqlUpdate.set({
			...item,
			updated: Date.now(),
		}).buildUpsert();
		await oSqlUpdate.getStmt().run();
	}

	return c.json({
		message: '修改成功！',
	});
});

app.delete('/', async (c) => {
	// 这是“CRUDL”中的“Delete”
	const json = await c.req.json();
	const oCFD1 = new CFD1(c.env.DB);

	await oCFD1.sql().from('pre_bkdata_data_row_values').where([
		['row_id IN (*)', json],
	]).buildDelete().getStmt().run();

	await oCFD1.sql().from('pre_bkdata_data_rows').where([
		['id IN (*)', json],
	]).buildDelete().getStmt().run();

	return c.json({
		message: '删除成功！',
	});
});

app.get('/', async (c) => {
	// 这是“CRUDL”中的“List”
	const oCFD1 = new CFD1(c.env.DB);

	// 第1步：返回列头
	const oSql = oCFD1.sql().from('pre_bkdata_data_columns');
	oSql.select({
		id: 'id',
		created: 'created',
		title: 'title',
		component: 'component',
		datatype: 'datatype',
	});
	oSql.orderBy([['seq', 'ASC']]);
	const data_columns = (await oSql.buildSelect().getStmt().all()).results;
	const columns: ResJsonTableColumn[] = [
		{
			title: 'ID',
			dataIndex: 'id',
		},
		{
			title: '创建时间',
			dataIndex: 'created',
			dataType: 'js_timestamp',
			dayjsFormat: 'YYYY-MM-DD HH:mm:ss',
		},
		{
			title: '修改时间',
			dataIndex: 'updated',
			dataType: 'js_timestamp',
			dayjsFormat: 'YYYY-MM-DD HH:mm:ss',
		},
	];
	for (const row of data_columns) {
		const column: ResJsonTableColumn = {
			title: row['title']?.toString() || '',
			dataIndex: 'col_' + row.id?.toString() || '',
			component: row.component as ColumnComponentType,
			dataType: row.datatype as ColumnDataType,
			//rules: [{ required: true, message: `请输入[${row.title}]` }],
			placeholder: `请输入[${row.title}]`,
		};
		if (column.dataType === 'datetime') {
			column.dayjsFormat = 'YYYY-MM-DD';
		}
		columns.push(column);
	}

	// 第2步：返回数据列表
	const oSqlRows = oCFD1.sql().from('pre_bkdata_data_rows');
	const dataSource = (await oSqlRows.select({
		id: 'id',
		created: 'created',
		updated: 'updated',
		values_base: 'values_base',
	}).buildSelect().getStmt().all()).results;
	for (const row of dataSource) {
		// 把内容不多的基本数据通过values_base列表出来
		const json = JSON.parse(row.values_base?.toString() || '{}');
		for (const key in json) {
			row[key] = json[key];
		}
	}

	// 最后输出
	const resJson: ResJSON = {
		table: {
			option: {
				rowKey: 'id',
			},
			columns,
			dataSource,
		},
	};
	return c.json(resJson);
});

export default app;
