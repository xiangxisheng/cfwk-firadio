import { CFD1 } from '@/utils/cfd1';
import { ApiBee } from '@/utils/api/bee';

export class NwsrvApi {
	private oCFD1: CFD1;

	constructor(oCFD1: CFD1) {
		this.oCFD1 = oCFD1;
	}
	public async fetch_logs(): Promise<number> {
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_logs')
			.select({ no: 'no' })
			.orderBy([['no', 'DESC']])
			.buildSelect();
		//console.log('执行的SQL语句', oSqlSelect.getSQL());
		const record = await this.oCFD1.first(oSqlSelect);
		var log_id_begin = 189154; //8月份的第一条
		log_id_begin = 5897;
		if (record) {
			log_id_begin = Number(record['no']) + 1;
		}
		const apiBee = new ApiBee();
		const res = await apiBee.getAllLog(log_id_begin);
		var count = 0;
		if (res.data) {
			for (const log of res.data.logs) {
				count++;
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
				const oSqlInsert = this.oCFD1.sql().from('pre_bee_logs').set(record).buildInsert();
				//console.log('插入数据库表的SQL语句', oSqlInsert.getSQL());
				const r2 = await this.oCFD1.all(oSqlInsert);
				if (r2.success) {
				}
			}
		}
		return count;
	}

	public async fetch_customers(): Promise<number> {
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_customer_nwsrvs')
			.select({ code: 'code' })
			.orderBy([['code', 'DESC']])
			.buildSelect();
		const record = await this.oCFD1.first(oSqlSelect);
		var log_id_begin = 0;
		if (record) {
			log_id_begin = Number(record['code']) + 1;
		}
		const apiBee = new ApiBee();
		const res = await apiBee.getAllCustomer(log_id_begin);
		var count = 0;
		if (res.data) {
			for (const row of res.data.customers) {
				count++;
				const record = {
					code: row['code'],
					customerid: row['customerid'],
					customername: row['customername'],
					customername_cn: row['customername_cn'],
					status: row['status'],
					download: row['download'],
					upload: row['upload'],
					package: row['package'],
					ipservice: row['ip_service'],
				};
				const oSqlInsert = this.oCFD1.sql().from('pre_bee_customer_nwsrvs').set(record).buildInsert();
				const r2 = await this.oCFD1.all(oSqlInsert);
				if (r2.success) {
				}
			}
		}
		return count;
	}
}
