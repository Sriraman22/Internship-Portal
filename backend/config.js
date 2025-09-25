require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  sql: {
    server: process.env.AZURE_SQL_SERVER,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    options: {
      encrypt: true
    }
  },
  storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  storageContainer: process.env.AZURE_STORAGE_CONTAINER || 'application-docs',
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  sendgridKey: process.env.SENDGRID_API_KEY || '',
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};
