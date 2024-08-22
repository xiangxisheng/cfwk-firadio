import { CFD1 } from '@/utils/cfd1';
import { NwsrvDateInfo } from './nwsrv_date';

class BillInfo {
	customerid: string;
	date_begin: string;
	date_end: string;
	package?: string;
	ipservice?: string;
	bw_dl_mbps?: number;
	bw_ul_mbps?: number;
	ip_pcs?: number;
	constructor(customerid: string, date_begin: string, date_end: string, record: NwsrvDateInfo) {
		this.customerid = customerid;
		this.date_begin = date_begin;
		this.date_end = date_end;
		this.package = record.package;
		this.ipservice = record.ipservice;
		this.bw_dl_mbps = record.bw_dl_mbps;
		this.bw_ul_mbps = record.bw_ul_mbps;
		this.ip_pcs = record.ip_pcs;
	}
}

export class NwsrvBills {
	private oCFD1: CFD1;
	private sTableName = 'pre_bee_customer_nwsrv_bills';

	constructor(oCFD1: CFD1) {
		this.oCFD1 = oCFD1;
	}
	public async start() {
		// 首先取得有价格数据的客户ID
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_customer_nwsrv_prices')
			.select({ customerid: 'customerid', id: 'MAX(id)' })
			.groupBy(['customerid'])
			.orderBy([['id', 'ASC']])
			.buildSelect();
		const sqlResult = await this.oCFD1.all(oSqlSelect);
		var count = 0;
		for (const nwpRow of sqlResult.results) {
			count++;
			if (!nwpRow['customerid']) {
				continue;
			}
			console.log(nwpRow);
			const customerid = nwpRow['customerid'].toString();
			await this.getNewBill(customerid);
		}
		return count;
	}

	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	private adjustDate(dateString: string, addDays: number = 0, addMonths: number = 0, addyears: number = 0): string {
		const date = new Date(dateString);
		return this.formatDate(new Date(date.getFullYear() + addyears, date.getMonth() + addMonths, date.getDate() + addDays));
	}

	private getBeginOfMonth(dateString: string | undefined = undefined): string {
		const date = dateString ? new Date(dateString) : new Date();
		return this.formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
	}

	private getEndOfMonth(dateString: string | undefined = undefined): string {
		const date = dateString ? new Date(dateString) : new Date();
		// 将日期设置为下个月的第0天，JavaScript 会自动处理为当前月的最后一天
		return this.formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
	}

	private async getNewBill(customerid: string) {
		// 根据客户ID号生成账单
		const oSqlSelect = this.oCFD1
			.sql()
			.from('pre_bee_customer_nwsrv_dates')
			.select({
				by_date: 'by_date',
				status: 'status',
				ip_pcs: 'ip_pcs',
				bw_dl_mbps: 'bw_dl_mbps',
				bw_ul_mbps: 'bw_ul_mbps',
				ipservice: 'ipservice',
				package: 'package',
			})
			.where([['customerid = ?', [customerid]]])
			.orderBy([['id', 'ASC']])
			.buildSelect();
		const sqlResult = await this.oCFD1.all(oSqlSelect);
		var count = 0;
		const bills: Array<BillInfo> = [];
		var lastRow;
		const nwdRows: Array<NwsrvDateInfo> = [];
		for (const nwdRow of sqlResult.results) {
			lastRow = nwdRow;
			nwdRows.push(new NwsrvDateInfo(nwdRow));
		}
		if (lastRow) {
			const nwDI = new NwsrvDateInfo(lastRow);
			nwDI.setDate(this.adjustDate(this.getBeginOfMonth(), 0, 1));
			nwdRows.push(nwDI);
		}
		var lastNDI;
		for (const curNDI of nwdRows) {
			count++;
			if (!lastNDI) {
				lastNDI = curNDI;
				continue;
			}
			var endOfMonthLastDate = this.getEndOfMonth(lastNDI.by_date);
			if (curNDI.by_date > endOfMonthLastDate) {
				// 生成从[lastDate]开始到[lastDate月底]的账单
				bills.push(new BillInfo(customerid, lastNDI.by_date, endOfMonthLastDate, lastNDI));
				var ss = this.getBeginOfMonth(endOfMonthLastDate);
				ss = this.adjustDate(ss, 0, 1);
				while (ss < this.adjustDate(this.getBeginOfMonth(curNDI.by_date), 0, 0)) {
					bills.push(new BillInfo(customerid, this.getBeginOfMonth(ss), this.getEndOfMonth(ss), lastNDI));
					ss = this.adjustDate(ss, 0, 1);
				}
				if (ss < this.adjustDate(curNDI.by_date, 0, 0)) {
					bills.push(new BillInfo(customerid, this.getBeginOfMonth(ss), this.adjustDate(curNDI.by_date, -1), lastNDI));
				}
			} else {
				// 生成从[lastDate]开始到[by_date]的当月
				bills.push(new BillInfo(customerid, lastNDI.by_date, this.adjustDate(curNDI.by_date, -1), lastNDI));
			}
			lastNDI = curNDI;
		}
		console.log(bills);
		return count;
	}
}
