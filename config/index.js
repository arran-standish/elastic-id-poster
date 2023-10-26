export default (function () {
  if (!process.env.INPUT_FILE) process.env.INPUT_FILE = 'input.dat';
  if (!process.env.PGUSER) process.env.PGUSER = 'postgres';
  if (!process.env.PGPASSWORD) process.env.PGPASSWORD = 'postgres';
  if (!process.env.PGDATABASE) process.env.PGDATABASE = 'hapi';
  if (!process.env.HAPI_PORT) process.env.HAPI_PORT = 3447;
  if (!process.env.HAPI_URL) process.env.HAPI_URL = 'localhost';
})()
