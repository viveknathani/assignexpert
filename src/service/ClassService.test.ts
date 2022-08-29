import dotenv from 'dotenv';
import * as database from '../database';
import { UserService } from './UserService';
import { ClassService } from './ClassService';
import * as entity from '../entity';
dotenv.config();

database.setupDatabase(process.env.DATABASE_URL || '');
afterAll(async () => await database.terminatePool());
