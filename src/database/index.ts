import { Pool, QueryResult } from 'pg';

let pool: Pool;

// Takes the database url and creates a pool out of it
export function setupDatabase(databaseURL: string) {

    pool = new Pool({
        connectionString: databaseURL,
        ssl: {
            rejectUnauthorized: false // this is a workaround, pg rejects the connection otherwise
        }
    });
}

export async function terminatePool() {
    try {
        await pool.end();
    } catch (err) { 
        console.log(err);
    }
}

// This is what you should you use if you want to execute a statement
// and you do not care about the returned content. 
// Ideal for INSERT/UPDATE/DELETE statements.
export async function execWithTransaction(prepared: string, ...args: any[]) {
    
    const client = await pool.connect();

    try {

        await client.query('BEGIN');
        await client.query(prepared, args);
        await client.query('COMMIT');
    } catch (err) {

        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();        
    }
}

// This is what you should use if you want to work with the result returned
// upon execution of the statement. The work that you need to do should be 
// held by the scanRows function. This function is ideal for SELECT statement.
export async function queryWithTransaction(prepared: string, 
    scanRows: (rows: QueryResult<any>) => Error | undefined,  ...args: any[]) {
    
    const client = await pool.connect();

    try {

        await client.query('BEGIN');
        const rows = await client.query(prepared, args);
        const err = scanRows(rows);
        if (err !== undefined) {
            throw err;
        }
        await client.query('COMMIT');
    } catch (err) {

        await client.query('ROLLBACK');
        throw err;
    } finally {

        client.release();
    }
}

export * from './user';
export * from './class';