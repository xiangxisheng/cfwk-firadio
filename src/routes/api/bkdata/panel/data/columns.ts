import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { ResJSON, ResJsonTableColumn } from '@/utils/common/api';
const app = Route();

app.post('/', async (c) => {
    const json = await c.req.json();
    const oCFD1 = new CFD1(c.env.DB);
    const oSql = oCFD1.sql().from('pre_bkdata_data_columns');
    const sqlResult = await oCFD1.all(oSql.set({ name: json.name, type: json.type }).buildInsert());
    return c.json({
        message: '添加成功！',
    });
});

app.delete('/', async (c) => {
    const oCFD1 = new CFD1(c.env.DB);
    const oSql = oCFD1.sql().from('pre_bkdata_data_columns');
    const json = await c.req.json();
    oSql.where([
        ['id IN (*)', json],
    ])
    const r = await oSql.buildDelete().getStmt().run();
    if (!r.success) {
        return c.json({
            "code": "400",
            "success": false,
        });
    }
    return c.json({
        message: '删除成功！',
    });
});

app.get('/', async (c) => {

    const columns: ResJsonTableColumn[] = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '创建时间',
            dataIndex: 'CreationTime',
            ellipsis: false,
        },
        {
            title: '列名称',
            dataIndex: 'name',
            ellipsis: false,
            form: 'input',
            rules: [{ required: true, message: '请输入[列名称]' }],
            placeholder: '请输入[列名称]',
        },
        {
            title: '列类型',
            dataIndex: 'type',
            ellipsis: false,
            form: 'input',
            rules: [{ required: true, message: '请输入[列类型]' }],
            placeholder: '请输入[列类型]',
        },
    ];

    const oCFD1 = new CFD1(c.env.DB);
    const oSql = oCFD1.sql().from('pre_bkdata_data_columns');
    const dataSource = (await oSql.select({ id: 'id', name: 'name', type: 'type' }).buildSelect().getStmt().all()).results;
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
