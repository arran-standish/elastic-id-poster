export default (function () {
  if (!process.env.ID_BATCH_SIZE) process.env.ID_BATCH_SIZE = 10;
  if (!process.env.INPUT_FILE) process.env.INPUT_FILE = 'input.dat';
  if (!process.env.PGHOST) process.env.PGHOST = 'localhost';
  if (!process.env.PGUSER) process.env.PGUSER = 'postgres';
  if (!process.env.PGPASSWORD) process.env.PGPASSWORD = 'postgres';
  if (!process.env.PGDATABASE) process.env.PGDATABASE = 'hapi';
  if (!process.env.HAPI_PORT) process.env.HAPI_PORT = 3447;
  if (!process.env.HAPI_URL) process.env.HAPI_URL = 'localhost';
  if (!process.env.KAFKA_URL) process.env.KAFKA_URL = 'localhost:19092';
  if (!process.env.KAFKA_TOPIC) process.env.KAFKA_TOPIC = '2xx';
})()
