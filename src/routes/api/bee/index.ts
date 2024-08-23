import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';
import { NwsrvApi } from '@/utils/bee/nwsrv_api';
import { NwsrvDate } from '@/utils/bee/nwsrv_date';
import { NwsrvBills } from '@/utils/bee/nwsrv_bill';

const app = Route();

app.get('/fetch_logs', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const result: Record<string, unknown> = {};
	await (async () => {
		const nwsrvApi = new NwsrvApi(oCFD1);
		if (1) {
			await oCFD1.begin();
			result.nwsrv_api_1 = await nwsrvApi.fetch_logs();
			await oCFD1.commit();
		}
		if (1) {
			await oCFD1.begin();
			result.nwsrv_api_2 = await nwsrvApi.fetch_customers();
			await oCFD1.commit();
		}
	})();
	await (async () => {
		const nwsrvDate = new NwsrvDate(oCFD1);
		if (1) {
			await oCFD1.begin();
			result.nwsrv_date_1 = await nwsrvDate.start(1000000);
			await oCFD1.commit();
		}
		if (1) {
			await oCFD1.begin();
			result.nwsrv_date_2 = await nwsrvDate.putCustomerInfoIfStillNull();
			await oCFD1.commit();
		}
	})();
	await (async () => {
		const nwsrvBills = new NwsrvBills(oCFD1);
		if (1) {
			await oCFD1.begin();
			result.nwsrv_bills_1 = await nwsrvBills.start();
			await oCFD1.commit();
		}
	})();
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
