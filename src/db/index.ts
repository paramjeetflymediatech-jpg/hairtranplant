import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '';
const dbName = process.env.DB_NAME || 'graftdesk_db';

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let sequelize: Sequelize;

if (dbHost && dbName) {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else if (databaseUrl && databaseUrl.startsWith('mysql')) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './graftdesk_dev.sqlite',
    logging: false,
  });
}

let isSynced = false;
let syncPromise: Promise<void> | null = null;

export async function ensureDbSynced() {
  if (isSynced) return;

  if (!syncPromise) {
    syncPromise = (async () => {
      try {
        if (dbHost && dbName) {
          try {
            const connection = await mysql.createConnection({
              host: dbHost,
              port: dbPort,
              user: dbUser,
              password: dbPassword,
            });
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            await connection.end();
          } catch (dbErr) {
            // Ignore connection error here
          }
        }

        // Standard sync without concurrent ALTER deadlock
        try {
          await sequelize.sync();
        } catch (syncErr) {
          // Fallback if table creation needed
        }

        // Modify existing columns in MySQL to LONGTEXT to support large base64 image payloads
        const safeAlter = async (query: string) => {
          try {
            await sequelize.query(query);
          } catch (e) {}
        };

        await safeAlter('ALTER TABLE `leads` MODIFY COLUMN `photos` LONGTEXT NULL;');
        await safeAlter('ALTER TABLE `leads` MODIFY COLUMN `hairAnalysisData` LONGTEXT NULL;');
        await safeAlter('ALTER TABLE `clinics` MODIFY COLUMN `logo` LONGTEXT NULL;');
        await safeAlter('ALTER TABLE `clinics` MODIFY COLUMN `backgroundImage` LONGTEXT NULL;');
        await safeAlter('ALTER TABLE `users` MODIFY COLUMN `avatar` LONGTEXT NULL;');

        // Add whatsappTracked column if missing (safeAlter handles it if it already exists)
        await safeAlter('ALTER TABLE `leads` ADD COLUMN `whatsappTracked` BOOLEAN DEFAULT 0;');
        await safeAlter('ALTER TABLE `patients` ADD COLUMN `whatsappTracked` BOOLEAN DEFAULT 0;');

        isSynced = true;
      } catch (err) {
        console.error('Failed to sync DB schema:', err);
      } finally {
        syncPromise = null;
      }
    })();
  }

  return syncPromise;
}

export { sequelize };
export default sequelize;
