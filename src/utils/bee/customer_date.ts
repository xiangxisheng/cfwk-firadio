import { CFD1 } from '@/utils/cfd1';

class CustomerDateInfo {
	update_id?: number;
	customerid: string;
	by_date: string;
	status?: string;
	ip_pcs: number;
	bw_dl_mbps?: number;
	bw_ul_mbps?: number;
	ipservice?: string;
	package?: string;
	constructor(record: Record<string, unknown>) {
		this.update_id = Number(record['update_id']);
		this.customerid = record['customerid']?.toString() ?? '';
		this.by_date = record['by_date']?.toString() ?? '';
		this.status = record['status']?.toString();
		this.ip_pcs = Number(record['ip_pcs'] ?? 0);
		this.bw_dl_mbps = record['bw_dl_mbps'] ? Number(record['bw_dl_mbps']) : undefined;
		this.bw_ul_mbps = record['bw_ul_mbps'] ? Number(record['bw_ul_mbps']) : undefined;
		this.ipservice = record['ipservice']?.toString();
		this.package = record['package']?.toString();
	}
}

export class CustomerDate {
	private oCFD1: CFD1;
	private sTableName = 'pre_bee_customer_nwsrv_dates';

	constructor(oCFD1: CFD1) {
		this.oCFD1 = oCFD1;
	}

	private async getCustomerDate(customerid: string, by_date: string): Promise<CustomerDateInfo> {
		const sSelect = {
			status: 'status',
			ip_pcs: 'ip_pcs',
			bw_dl_mbps: 'bw_dl_mbps',
			bw_ul_mbps: 'bw_ul_mbps',
			ipservice: 'ipservice',
			package: 'package',
		};
		const oSqlSelect = this.oCFD1
			.sql()
			.from(this.sTableName)
			.select({ update_id: 'id', ...sSelect })
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
			.from(this.sTableName)
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

	public async updateCustomerDate(customerDateInfo: CustomerDateInfo) {
		const oSqlUpdate = this.oCFD1
			.sql()
			.from(this.sTableName)
			.set({
				status: customerDateInfo.status,
				ip_pcs: customerDateInfo.ip_pcs,
				bw_dl_mbps: customerDateInfo.bw_dl_mbps,
				bw_ul_mbps: customerDateInfo.bw_ul_mbps,
				ipservice: customerDateInfo.ipservice,
				package: customerDateInfo.package,
			})
			.where([['id = ?', [customerDateInfo.update_id]]])
			.buildUpdate();
		await this.oCFD1.all(oSqlUpdate);
	}

	public async insertCustomerDate(customerDateInfo: CustomerDateInfo) {
		const oSqlUpdate = this.oCFD1
			.sql()
			.from(this.sTableName)
			.set({
				customerid: customerDateInfo.customerid,
				by_date: customerDateInfo.by_date,
				status: customerDateInfo.status,
				ip_pcs: customerDateInfo.ip_pcs,
				bw_dl_mbps: customerDateInfo.bw_dl_mbps,
				bw_ul_mbps: customerDateInfo.bw_ul_mbps,
				ipservice: customerDateInfo.ipservice,
				package: customerDateInfo.package,
			})
			.buildInsert();
		await this.oCFD1.all(oSqlUpdate);
	}

	public async upsertCustomerDate(customerDateInfo: CustomerDateInfo) {
		const oSqlUpsert = this.oCFD1
			.sql()
			.from(this.sTableName)
			.set({
				status: customerDateInfo.status,
				ip_pcs: customerDateInfo.ip_pcs,
				bw_dl_mbps: customerDateInfo.bw_dl_mbps,
				bw_ul_mbps: customerDateInfo.bw_ul_mbps,
				ipservice: customerDateInfo.ipservice,
				package: customerDateInfo.package,
			})
			.conflict({ customerid: customerDateInfo.customerid, by_date: customerDateInfo.by_date })
			.buildUpsert();
		//console.log('插入数据库表的SQL语句', this.oCFD1.getSQL(oSqlUpsert));
		await this.oCFD1.all(oSqlUpsert);
	}

	private async updateFieldIfNull(customerid: string, fieldName: string, value: string | number) {
		const set: Record<string, string | number> = {};
		set[fieldName] = value;
		const oSqlUpdate = this.oCFD1
			.sql()
			.from(this.sTableName)
			.set(set)
			.where([
				['[customerid]=?', [customerid]],
				[`[${fieldName}]IS NULL`, []],
			])
			.buildUpdate();
		//console.log('SQL语句', this.oCFD1.getSQL(oSqlUpdate));
		await this.oCFD1.all(oSqlUpdate);
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
		switch (action.toLowerCase()) {
			case '- Removed IP(s)'.toLowerCase():
				return null;
			case '+ Assigned IP(s)'.toLowerCase():
				return null;
			case 'Added New Customer'.toLowerCase():
				// 1：新增客户
				customerDateInfo.status = 'active';
				return customerDateInfo;
			case 'Allowed Testing'.toLowerCase():
				return null;
			case 'Assigned IP Address'.toLowerCase():
				// 2：附加IP
				customerDateInfo.ip_pcs++;
				return customerDateInfo;
			case 'Change Customer ID'.toLowerCase():
				return null;
			case 'Change Location'.toLowerCase():
				return null;
			case 'change loginname'.toLowerCase():
				return null;
			case 'change network address'.toLowerCase():
				return null;
			case 'Change Test Status'.toLowerCase():
				return null;
			case 'change username'.toLowerCase():
				return null;
			case 'Changed Active Date'.toLowerCase():
				return null;
			case 'Changed Customer Name'.toLowerCase():
				return null;
			case 'Changed Customer Name (CN)'.toLowerCase():
				return null;
			case 'Changed Download Speed'.toLowerCase():
				// 3：修改下行速度
				const download_oldvalue = Number(oldvalue?.match(/\d+/)?.[0]);
				if (download_oldvalue) {
					// 先把之前没有[bw_dl_mbps]参数的用oldvalue更新上去
					await this.updateFieldIfNull(customerid, 'bw_dl_mbps', download_oldvalue);
				}
				if (newvalue) {
					customerDateInfo.bw_dl_mbps = Number(newvalue.match(/\d+/)?.[0]);
				}
				return customerDateInfo;
			case 'Changed Graph ID'.toLowerCase():
				return null;
			case 'Changed IP Address'.toLowerCase():
				return null;
			case 'Changed IP Service'.toLowerCase():
				// 4：修改IP服务
				if (oldvalue) {
					await this.updateFieldIfNull(customerid, 'ipservice', oldvalue);
				}
				if (newvalue) {
					customerDateInfo.ipservice = newvalue;
				}
				return customerDateInfo;
			case 'Changed IP Service Location'.toLowerCase():
				return null;
			case 'Changed ISP'.toLowerCase():
				return null;
			case 'Changed ONT ID'.toLowerCase():
				return null;
			case 'Changed Package'.toLowerCase():
				// 5：修改网络类型
				if (oldvalue) {
					await this.updateFieldIfNull(customerid, 'package', oldvalue);
				}
				if (newvalue) {
					customerDateInfo.package = newvalue;
				}
				return customerDateInfo;
			case 'Changed Port'.toLowerCase():
				return null;
			case 'Changed Router'.toLowerCase():
				return null;
			case 'Changed Serial Number'.toLowerCase():
				return null;
			case 'Changed Status'.toLowerCase():
				// 6：修改网络状态
				if (oldvalue) {
					await this.updateFieldIfNull(customerid, 'status', oldvalue);
				}
				if (newvalue) {
					customerDateInfo.status = newvalue;
				}
				return customerDateInfo;
			case 'Changed Switch'.toLowerCase():
				return null;
			case 'Changed Upload Speed'.toLowerCase():
				// 7：修改下行速度
				const upload_oldvalue = Number(oldvalue?.match(/\d+/)?.[0]);
				if (upload_oldvalue) {
					// 先把之前没有[bw_ul_mbps]参数的用oldvalue更新上去
					await this.updateFieldIfNull(customerid, 'bw_ul_mbps', upload_oldvalue);
				}
				if (newvalue) {
					customerDateInfo.bw_ul_mbps = Number(newvalue.match(/\d+/)?.[0]);
				}
				return null;
			case 'Changed VLAN'.toLowerCase():
				return null;
			case 'Created New Creditnote'.toLowerCase():
				return null;
			case 'Created New invoice'.toLowerCase():
				return null;
			case 'Created New Receipt'.toLowerCase():
				return null;
			case 'Finished Testing (1 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (10 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (13 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (14 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (2 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (3 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (30 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (4 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (5 Days)'.toLowerCase():
				return null;
			case 'Finished Testing (7 Days)'.toLowerCase():
				return null;
			case 'Manual Log'.toLowerCase():
				return null;
			case 'P: Added a payment record'.toLowerCase():
				return null;
			case 'P: Changed Billing/ Issued Date'.toLowerCase():
				return null;
			case 'P: Changed Due Date'.toLowerCase():
				return null;
			case 'P: Changed Invoice No'.toLowerCase():
				return null;
			case 'P: Changed Paid Date'.toLowerCase():
				return null;
			case 'P: Changed Paid Status'.toLowerCase():
				return null;
			case 'Removed IP Address'.toLowerCase():
				// 8：删除附加的IP
				customerDateInfo.ip_pcs--;
				return customerDateInfo;
			default:
				throw new Error(`无法处理[action=${action}]`);
		}
	}

	public async start(limit = 10000) {
		var count = 0;
		const aActions = [
			'Added New Customer',
			'Assigned IP Address',
			'Changed Download Speed',
			'Changed IP Service',
			'Changed Package',
			'Changed Status',
			'Changed Upload Speed',
			'Removed IP Address',
		];
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_logs')
			.select({ id: '[no]', action: 'action', customerid: 'customerid', oldvalue: 'oldvalue', newvalue: 'newvalue', date: 'date' })
			.where([
				['processed = ?', [0]],
				[`action IN (${aActions.map(() => '?').join(', ')})`, aActions],
			])
			.orderBy([['no', 'ASC']])
			.limit(limit)
			.buildSelect();
		const sqlResult = await this.oCFD1.all(oSqlSelect);
		for (const logRow of sqlResult.results) {
			if (!logRow['id']) {
				continue;
			}
			const logRowId = Number(logRow['id']);
			const customerDateInfo = await this.getCustomerDateInfo(logRow);
			if (customerDateInfo) {
				if (customerDateInfo.update_id) {
					this.updateCustomerDate(customerDateInfo);
				} else {
					this.insertCustomerDate(customerDateInfo);
				}
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

	public async putAllCustomerInfoIfStillNull() {
		// 把全部的用户信息都往[pre_bee_customer_nwsrv_dates]表里更新
		if (1) {
			throw new Error('本功能已由[putCustomerInfoIfStillNull]所取缔');
		}
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_customers')
			.select({
				id: '[id]',
				customerid: 'customerid',
				bw_dl_mbps: 'download',
				bw_ul_mbps: 'upload',
				package: 'package',
				ipservice: 'ipservice',
			})
			.orderBy([['id', 'ASC']])
			.buildSelect();
		const sqlResult = await this.oCFD1.all(oSqlSelect);
		var count = 0;
		for (const customerRow of sqlResult.results) {
			if (!customerRow['customerid']) {
				continue;
			}
			const customerid = customerRow['customerid']?.toString();
			for (const fieldName of ['bw_dl_mbps', 'bw_ul_mbps']) {
				const value = Number(customerRow[fieldName]?.toString().match(/\d+/)?.[0]);
				if (value) {
					await this.updateFieldIfNull(customerid, fieldName, value);
					count++;
				}
			}
			for (const fieldName of ['package', 'ipservice']) {
				const value = customerRow[fieldName]?.toString();
				if (value) {
					await this.updateFieldIfNull(customerid, fieldName, value);
					count++;
				}
			}
		}
		return count;
	}

	public async putCustomerInfoIfStillNull() {
		// 只将有空值的[pre_bee_customer_nwsrv_dates]表列出customerid
		const oSqlSelect = this.oCFD1
			.sql()
			.from(this.sTableName)
			.select({ customerid: 'customerid', id: 'MAX(id)' })
			.where([
				['by_date>?', ['2024-01-01']],
				['bw_dl_mbps IS NULL OR bw_ul_mbps IS NULL OR ipservice IS NULL OR package IS NULL', []],
			])
			.groupBy(['customerid'])
			.orderBy([['id', 'ASC']])
			.buildSelect();
		const sqlResult = await this.oCFD1.all(oSqlSelect);
		var count = 0;
		for (const cdRow of sqlResult.results) {
			count++;
			if (!cdRow['customerid']) {
				continue;
			}
			console.log(cdRow);
			const customerid = cdRow['customerid'].toString();
			const oSqlSelect = this.oCFD1
				.sql()
				.from('pre_bee_customer_nwsrvs')
				.select({
					bw_dl_mbps: 'download',
					bw_ul_mbps: 'upload',
					package: 'package',
					ipservice: 'ipservice',
				})
				.where([['customerid = ?', [customerid]]])
				.buildSelect();
			const cnRow = await this.oCFD1.first(oSqlSelect);
			if (cnRow) {
				for (const fieldName of ['bw_dl_mbps', 'bw_ul_mbps']) {
					const value = Number(cnRow[fieldName]?.toString().match(/\d+/)?.[0]);
					if (value) {
						await this.updateFieldIfNull(customerid, fieldName, value);
					}
				}
				for (const fieldName of ['package', 'ipservice']) {
					const value = cnRow[fieldName]?.toString();
					if (value) {
						await this.updateFieldIfNull(customerid, fieldName, value);
					}
				}
			}
		}
		return count;
	}
}
