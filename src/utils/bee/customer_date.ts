import { CFD1 } from '@/utils/cfd1';

class CustomerDateInfo {
	customerid: string;
	by_date: string;
	status?: string;
	ip_pcs: number;
	bandwidth?: number;
	ipservice?: string;
	package?: string;
	constructor(record: Record<string, unknown>) {
		this.customerid = record['customerid']?.toString() ?? '';
		this.by_date = record['by_date']?.toString() ?? '';
		this.status = record['status']?.toString();
		this.ip_pcs = Number(record['ip_pcs'] ?? 0);
		this.bandwidth = record['bandwidth'] ? Number(record['bandwidth']) : undefined;
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

	private async getCustomerDateInfo(logRow: Record<string, unknown>): Promise<CustomerDateInfo | null> {
		if (!logRow['customerid'] || !logRow['date'] || !logRow['action']) {
			return null;
		}
		const customerid = logRow['customerid'].toString();
		const date = logRow['date'].toString().split(' ')[0];
		const action = logRow['action'].toString();
		const oldvalue = logRow['oldvalue']?.toString();
		const newvalue = logRow['newvalue']?.toString();
		const customerDateInfo = await this.getCustomerDate(customerid, date);
		switch (action) {
			case 'Added New Customer':
				customerDateInfo.status = 'new';
				return customerDateInfo;
				break;
			case 'Changed Status':
				if (oldvalue) {
					const oSqlUpdate = this.oCFD1
						.sql()
						.from('pre_bee_customer_date')
						.set({ status: oldvalue })
						.where([
							['[customerid]=?', [customerid]],
							['[status]IS NULL', []],
						])
						.buildUpdate();
					await this.oCFD1.all(oSqlUpdate);
				}
				if (newvalue) {
					customerDateInfo.status = newvalue;
				}
				return customerDateInfo;
				break;
			case 'Assigned IP Address':
				customerDateInfo.ip_pcs++;
				return customerDateInfo;
				break;
			case 'Removed IP Address':
				customerDateInfo.ip_pcs--;
				return customerDateInfo;
				break;
			case 'Changed Download Speed':
				// 先把之前没有bandwidth参数的用oldvalue更新上去
				const bandwidth_oldvalue = Number(oldvalue?.match(/\d+/)?.[0]);
				if (bandwidth_oldvalue) {
					const oSqlUpdate = this.oCFD1
						.sql()
						.from('pre_bee_customer_date')
						.set({ bandwidth: bandwidth_oldvalue })
						.where([
							['[customerid]=?', [customerid]],
							['[bandwidth]IS NULL', []],
						])
						.buildUpdate();
					//console.log('SQL语句', this.oCFD1.getSQL(oSqlUpdate));
					await this.oCFD1.all(oSqlUpdate);
				}
				if (newvalue) {
					customerDateInfo.bandwidth = Number(newvalue.match(/\d+/)?.[0]);
				}
				return customerDateInfo;
				break;
			case 'Changed IP Service':
				if (oldvalue) {
					const oSqlUpdate = this.oCFD1
						.sql()
						.from('pre_bee_customer_date')
						.set({ ipservice: oldvalue })
						.where([
							['[customerid]=?', [customerid]],
							['[ipservice]IS NULL', []],
						])
						.buildUpdate();
					await this.oCFD1.all(oSqlUpdate);
				}
				if (newvalue) {
					customerDateInfo.ipservice = newvalue;
				}
				return customerDateInfo;
				break;
			case 'Changed Package':
				if (oldvalue) {
					const oSqlUpdate = this.oCFD1
						.sql()
						.from('pre_bee_customer_date')
						.set({ package: oldvalue })
						.where([
							['[customerid]=?', [customerid]],
							['[package]IS NULL', []],
						])
						.buildUpdate();
					await this.oCFD1.all(oSqlUpdate);
				}
				if (newvalue) {
					customerDateInfo.package = newvalue;
				}
				return customerDateInfo;
				break;
			case 'change network address':
			case 'change loginname':
			case 'change username':
			case 'Changed ISP':
			case 'Changed VLAN':
			case 'Changed Customer Name':
			case 'Changed Upload Speed':
			case 'Changed IP Address':
			case 'Changed Router':
			case 'Changed Port':
			case 'Changed Serial Number':
			case 'Changed ONT ID':
			case 'Changed Switch':
			case 'Changed Customer Name (CN)':
			case 'Finished Testing (3 Days)':
			case '+ Assigned IP(s)':
			case '- Removed IP(s)':
				return null;
				break;
			default:
				throw new Error(`无法处理[action=${action}]`);
		}
	}

	public async start(limit = 10000) {
		var count = 0;
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
			const customerDateInfo = await this.getCustomerDateInfo(logRow);
			if (customerDateInfo) {
				this.saveCustomerDate(customerDateInfo);
			}
			const oSqlUpdate = this.oCFD1
				.sql()
				.from('pre_bee_logs')
				.set({ processed: Date.now() })
				.where([['[no]=?', [logRowId]]])
				.buildUpdate();
			await this.oCFD1.all(oSqlUpdate);
			count++;
		}
		return count;
	}
}
