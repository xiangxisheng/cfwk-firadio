import { SQL } from './sql';

export class CFD1 {
	private DB: D1Database;
	constructor(DB: D1Database) {
		this.DB = DB;
	}
	sql() {
		return SQL();
	}
	getSQL(oSql: any) {
		return oSql.getSQL();
	}
	getParam(oSql: any) {
		return oSql.getParam();
	}
	getStmt(oSql: any) {
		return this.DB.prepare(oSql.getSQL());
	}
	bindSqlParam(oSql: any) {
		const stmt = this.getStmt(oSql);
		return stmt.bind.apply(stmt, oSql.getParam());
	}
	async all(oSql: any) {
		// 获取全部
		return await this.bindSqlParam(oSql).all();
	}
	async first(oSql: any) {
		// 获取一条
		return await this.bindSqlParam(oSql).first();
	}
	async run(oSql: any) {
		// 例如执行 INSERT 或 UPDATE
		return await this.bindSqlParam(oSql).run();
	}
	async begin() {
		// 开始事务处理
		return await this.DB.exec('BEGIN TRANSACTION');
	}
	async commit() {
		// 提交事务处理
		return await this.DB.exec('COMMIT');
	}
	async rollback() {
		// 回滚事务处理
		return await this.DB.exec('ROLLBACK');
	}
}
