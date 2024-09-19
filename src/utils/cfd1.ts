import { SQL } from './sql';

export class CFD1 {
	private DB: D1Database;
	constructor(DB: D1Database) {
		this.DB = DB;
	}
	public sql() {
		return new SQL(this);
	}
	private prepare(oSql: SQL) {
		return this.DB.prepare(oSql.getSQL());
	}
	public getStmt(oSql: SQL) {
		const stmt = this.prepare(oSql);
		return stmt.bind.apply(stmt, oSql.getParam());
	}
	public async all<T = Record<string, unknown>>(oSql: SQL): Promise<D1Result<T>> {
		// 获取全部
		return await this.getStmt(oSql).all();
	}
	public async first<T = Record<string, unknown>>(oSql: SQL): Promise<T | null> {
		// 获取一条
		return await this.getStmt(oSql).first();
	}
	public async begin() {
		// 开始事务处理
		return await this.DB.exec('BEGIN TRANSACTION');
	}
	public async commit() {
		// 提交事务处理
		return await this.DB.exec('COMMIT');
	}
	public async rollback() {
		// 回滚事务处理
		return await this.DB.exec('ROLLBACK');
	}
}
