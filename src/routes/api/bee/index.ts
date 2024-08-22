import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';
import { ApiBee } from '@/utils/api/bee';
import { CustomerDate } from '@/utils/bee/customer_date';

const app = Route();

app.get('/fetch_logs', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSqlSelect = oCFD1
		.sql()
		.from('pre_bee_logs')
		.select({ no: 'no' })
		.orderBy([['no', 'DESC']])
		.buildSelect();
	//console.log('执行的SQL语句', oCFD1.getSQL(oSqlSelect));
	const record = await oCFD1.first(oSqlSelect);
	var log_id_begin = 189154; //8月份的第一条
	log_id_begin = 5897;
	if (record) {
		log_id_begin = Number(record['no']) + 1;
	}
	const apiBee = new ApiBee();
	const res = await apiBee.customerGetAllLog(log_id_begin);
	if (res.data) {
		await oCFD1.begin();
		for (const log of res.data.logs) {
			const record = {
				no: log['no'],
				customerid: log['customerid'],
				date: log['date'],
				action: log['action'],
				oldvalue: log['from'],
				newvalue: log['to'],
				remark: log['remark'],
				changeby: log['change_by'],
			};
			const oSqlInsert = oCFD1.sql().from('pre_bee_logs').set(record).buildInsert();
			//console.log('插入数据库表的SQL语句', oCFD1.getSQL(oSqlInsert));
			const r2 = await oCFD1.all(oSqlInsert);
			if (r2.success) {
			}
		}
		await oCFD1.commit();
	}
	const result = {};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/put_customer_date', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const customerDate = new CustomerDate(oCFD1);
	await oCFD1.begin();
	const process1_count = await customerDate.start(1000000);
	await oCFD1.commit();
	if (0) {
		await oCFD1.begin();
		await customerDate.putAllCustomerInfoIfStillNull();
		await oCFD1.commit();
	}
	const process2_count = await customerDate.putCustomerInfoIfStillNull();
	const result = {
		process1_count,
		process2_count,
	};

	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
