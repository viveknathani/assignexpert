import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { QueryResult } from 'pg';
import { queryWithTransaction, setupDatabase } from './database';
import { getClient, setupCache } from './cache';
import path from 'path';
import { api, pageRouter } from './routes';

async function main() {

    let databaseURL = '', redisURL = '';
    if (process.env.NODE_ENV === 'development') {
        databaseURL = process.env.DATABASE_URL_DEV || ''
        redisURL = process.env.REDIS_URL_DEV || ''
    } else {
        databaseURL = process.env.DATABASE_URL_PROD || ''
        redisURL = process.env.REDIS_URL_PROD || ''
    }
    setupDatabase(databaseURL)
    await queryWithTransaction("select 1+1 as result", function scanRows(result: QueryResult<any>): Error | undefined {            
        console.log(result.rows[0]);
        return undefined;             
    });
    setupCache(redisURL, '', '')
    const client = getClient();
    await client.connect();

    const app: express.Application = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/web', express.static(path.join(__dirname, './web')))
    app.use(pageRouter);
    app.use('/api', api);
    app.listen(process.env.PORT, () => console.log('server is up!'));
}

main()
.then(() => {})
.catch((err) => console.log(err));
