import { Sequelize } from 'sequelize';

const isProduction = process.env.NODE_ENV === 'production';

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '';
const dbName = process.env.DB_NAME;

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let sequelize: Sequelize;

if (dbHost && dbName) {
  // Individual DB credentials (host, port, user, password, db name)
  sequelize = new Sequelize(dbName, dbUser || 'root', dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: isProduction ? false : console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else if (databaseUrl && databaseUrl.startsWith('mysql')) {
  // MySQL URL connection string
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'mysql',
    logging: isProduction ? false : console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // SQLite fallback for local development / zero-config running
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './graftdesk_dev.sqlite',
    logging: false,
  });
}

export { sequelize };
export default sequelize;
