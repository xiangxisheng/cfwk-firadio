import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
const app = Route();


interface ResJsonTableColumnRule {
    required: boolean;
    message: string;
}

interface ResJsonTableColumn {
    dataIndex: string;
    title: string;
    form?: string;
    rules?: ResJsonTableColumnRule[];
    ellipsis?: boolean;
    placeholder?: string;
}


app.get('/', async (c, next) => {

    const columns: ResJsonTableColumn[] = [
        {
            title: '创建时间',
            dataIndex: 'CreationTime',
            ellipsis: false,
        },
        {
            title: '列名称',
            dataIndex: 'Name',
            ellipsis: false,
            form: 'input',
            rules: [{ required: true, message: '请输入[列名称]' }],
            placeholder: '请输入[列名称]',
        },
    ];

    const oCFD1 = new CFD1(c.env.DB);
    const oSql = oCFD1.sql().from('pre_bkdata_data_columns');
    const dataSource = (await oSql.select({ name: 'name', type: 'type' }).buildSelect().getStmt().all()).results;
    return c.json({
        columns,
        dataSource,
    });
});

export default app;
