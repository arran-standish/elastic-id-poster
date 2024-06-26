import pg from 'pg';

const pool = new pg.Pool();

export async function getResourceTuples(ids) {
  const query = "SELECT resource_type, forced_id, res_deleted_at FROM hfj_forced_id JOIN hfj_resource ON resource_pid = res_id WHERE forced_id IN (SELECT unnest(string_to_array($1, ','))::varchar) AND forced_id NOT IN ('mdm-Patient', 'mdm-Practitioner')";
  const res = await pool.query(query, [ids.toString()]);
  return res.rows;
}

export async function shutdown() {
  await pool.end();
}
