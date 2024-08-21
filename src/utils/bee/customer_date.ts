import { CFD1 } from '@/utils/cfd1';

class CustomerDateInfo {
	customerid: string;
	by_date: string;
	status: string;
	ip_pcs: number;
	bandwidth?: number;
	ipservice?: string;
	package?: string;
	constructor(record: Record<string, unknown>) {
		this.customerid = record['customerid']?.toString() ?? '';
		this.by_date = record['by_date']?.toString() ?? '';
		this.status = record['status']?.toString() ?? 'active';
		this.ip_pcs = Number(record['ip_pcs'] ?? 0);
		this.bandwidth = Number(record['bandwidth']);
		this.ipservice = record['ipservice']?.toString();
		this.package = record['package']?.toString();
	}
}

export class CustomerDate {
	private oCFD1: CFD1;

	constructor(oCFD1: CFD1) {
		this.oCFD1 = oCFD1;
	}

	private async getCustomerDate(customerid: string, by_date: string): Promise<CustomerDateInfo> {
		const sSelect = { status: 'status', ip_pcs: 'ip_pcs', bandwidth: 'bandwidth', ipservice: 'ipservice', package: 'package' };
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_customer_date')
			.select(sSelect)
			.where([
				['customerid=?', [customerid]],
				['by_date=?', [by_date]],
			])
			.buildSelect();
		const sqlResult = await this.oCFD1.first(oSqlSelect);
		if (sqlResult) {
			return new CustomerDateInfo({ ...sqlResult, customerid, by_date });
		}
		const oSqlSelect2 = this.oCFD1
			.sql()
			.from('pre_bee_customer_date')
			.select(sSelect)
			.where([['customerid=?', [customerid]]])
			.orderBy([['id', 'DESC']])
			.buildSelect();
		const sqlResult2 = await this.oCFD1.first(oSqlSelect2);
		if (sqlResult2) {
			return new CustomerDateInfo({ ...sqlResult2, customerid, by_date });
		}
		return new CustomerDateInfo({ customerid, by_date });
	}

	public async saveCustomerDate(customerDateInfo: CustomerDateInfo) {
		const oSqlUpsert = this.oCFD1
			.sql()
			.from('pre_bee_customer_date')
			.set({
				status: customerDateInfo.status,
				ip_pcs: customerDateInfo.ip_pcs,
				bandwidth: customerDateInfo.bandwidth,
				ipservice: customerDateInfo.ipservice,
				package: customerDateInfo.package,
			})
			.conflict({ customerid: customerDateInfo.customerid, by_date: customerDateInfo.by_date })
			.buildUpsert();
		//console.log('插入数据库表的SQL语句', this.oCFD1.getSQL(oSqlUpsert));
		await this.oCFD1.all(oSqlUpsert);
	}

	public async start(limit = 100) {
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_logs')
			.select({ id: '[no]', action: 'action', customerid: 'customerid', oldvalue: 'oldvalue', newvalue: 'newvalue', date: 'date' })
			.where([['processed=?', [0]]])
			.orderBy([['no', 'ASC']])
			.limit(limit)
			.buildSelect();
		const sqlResult = await this.oCFD1.all(oSqlSelect);
		for (const logRow of sqlResult.results) {
			if (!logRow['id'] || !logRow['customerid'] || !logRow['date'] || !logRow['action']) {
				continue;
			}
			const logRowId = Number(logRow['id']);
			const customerid = logRow['customerid'].toString();
			const date = logRow['date'].toString().split(' ')[0];
			const action = logRow['action'].toString();
			const oldvalue = logRow['oldvalue']?.toString();
			const newvalue = logRow['newvalue']?.toString();
			const customerDateInfo = await this.getCustomerDate(customerid, date);
			switch (action) {
				case 'Added New Customer':
					customerDateInfo.status = 'active';
					break;
				case 'Changed Status':
					if (newvalue) {
						customerDateInfo.status = newvalue;
					}
					break;
				case 'Assigned IP Address':
					customerDateInfo.ip_pcs++;
					break;
				case 'Removed IP Address':
					customerDateInfo.ip_pcs--;
					break;
				case 'Changed Download Speed':
					customerDateInfo.bandwidth = Number(newvalue);
					break;
				case 'Changed IP Service':
					if (newvalue) {
						customerDateInfo.ipservice = newvalue;
					}
					break;
				case 'Changed Package':
					if (newvalue) {
						customerDateInfo.package = newvalue;
					}
					break;
			}
			this.saveCustomerDate(customerDateInfo);
			const oSqlUpdate = this.oCFD1
				.sql()
				.from('pre_bee_logs')
				.set({ processed: Date.now() })
				.where([['[no]=?', [logRowId]]])
				.buildUpdate();
			await this.oCFD1.all(oSqlUpdate);
		}
	}
}
