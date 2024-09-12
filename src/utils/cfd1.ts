import { SQL } from './sql';

export class CFD1 {
	private DB: D1Database;
	constructor(DB: D1Database) {
		this.DB = DB;
	}
	sql() {
		return new SQL(this);
	}
	getSQL(oSql: SQL) {
		return oSql.getSQL();
	}
	getParam(oSql: SQL) {
		return oSql.getParam();
	}
	prepare(oSql: SQL) {
		return this.DB.prepare(oSql.getSQL());
	}
	getStmt(oSql: SQL) {
		const stmt = this.prepare(oSql);
		return stmt.bind.apply(stmt, oSql.getParam());
	}
	async all(oSql: SQL) {
		// 获取全部
		return await this.getStmt(oSql).all();
	}
	async first(oSql: SQL) {
		// 获取一条
		return await this.getStmt(oSql).first();
	}
	async run(oSql: SQL) {
		// 例如执行 INSERT 或 UPDATE
		return await this.getStmt(oSql).run();
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
