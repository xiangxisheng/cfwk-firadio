import { SQL } from './sql';

export function CFD1(DB: D1Database) {
	const oCFD1 = {
		sql() {
			return SQL();
		},
		getSQL(oSql: any) {
			return oSql.getSQL();
		},
		getParam(oSql: any) {
			return oSql.getParam();
		},
		getStmt(oSql: any) {
			return DB.prepare(oSql.getSQL());
		},
		bindSqlParam(oSql: any) {
			const stmt = oCFD1.getStmt(oSql);
			return stmt.bind.apply(stmt, oSql.getParam());
		},
		async all(oSql: any) {
			// 获取全部
			return await oCFD1.bindSqlParam(oSql).all();
		},
		async first(oSql: any) {
			// 获取一条
			return await oCFD1.bindSqlParam(oSql).first();
		},
	};
	return oCFD1;
}
