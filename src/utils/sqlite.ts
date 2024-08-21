import sqlite3 from 'sqlite3';

interface D1Meta {
	duration: number;
	size_after: number;
	rows_read: number;
	rows_written: number;
	last_row_id: number;
	changed_db: boolean;
	changes: number;
}
interface D1Response {
	success: true;
	meta: D1Meta & Record<string, unknown>;
	error?: never;
}
type D1Result<T = unknown> = D1Response & {
	results: T[];
};

export class D1PreparedStatement {
	private db: sqlite3.Database;
	private query: string;
	private bindValues: unknown[] = [];
	constructor(db: sqlite3.Database, query: string) {
		this.db = db;
		this.query = query;
	}
	bind(...values: unknown[]) {
		this.bindValues = values;
		return this;
	}
	first() {
		return new Promise((resolve, reject) => {
			const stmt = this.db.prepare(this.query);
			stmt.on('error', (err) => {
				return reject(err);
			});
			stmt.bind(...this.bindValues).get((err, row) => {
				if (err) {
					return reject(err);
				}
				resolve(row);
			});
			stmt.finalize();
		});
	}
	private fetchAll() {
		return new Promise((resolve, reject) => {
			const stmt = this.db.prepare(this.query);
			stmt.on('error', (err) => {
				return reject(err);
			});
			stmt.bind(...this.bindValues).all((err, row) => {
				if (err) {
					return reject(err);
				}
				resolve(row);
			});
			stmt.finalize();
		});
	}
	async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
		const results: T[] = (await this.fetchAll()) as T[];
		return {
			success: true,
			meta: {
				duration: 0,
				size_after: 0,
				rows_read: 0,
				rows_written: 0,
				last_row_id: 0,
				changed_db: false,
				changes: 0,
			},
			results,
		};
	}
}

export class D1Database {
	private db: sqlite3.Database;
	constructor(filename: string) {
		this.db = new (sqlite3.verbose().Database)(filename);
		this.db.on('error', (error) => {
			console.error('[OpenDB]', error);
			process.exit();
		});
	}
	exec(query: string) {
		return new Promise((resolve, reject) => {
			this.db.all(query, (err, row) => {
				if (err) {
					return reject(err);
				}
				resolve(row);
			});
		});
	}
	prepare(query: string) {
		return new D1PreparedStatement(this.db, query);
	}
	close() {
		this.db.close();
	}
}
