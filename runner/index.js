import { getResourceTuples, shutdown as postgresShutdown } from './postgres.js';
import { getResourceData, shutdown as hapiShutdown } from './hapi.js';
import { flushCursor } from '../filesystem/cursor.js';

export async function execute(ids) {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error(`Failed to pass in a valid populated array. Received: ${JSON.stringify(ids)}`);

  try {
    // rather than hope that postgres returns an array in the same order as the ids (and have to sync two arrays)
    // simply have postgres return a array of tuples of (resource_type, forced_id) instead
    const resourceTuples = await getResourceTuples(ids);
    const resourceData = await getResourceData(resourceTuples);
    // need to pass data to kafka over here and build up message
    // resourceData already in form of [{ resource: {}, request: {} }]
    // so just need to add top level data: { resourceType: "Bundle", type: "transaction", entry: resourceData }
    // and should be good to go
    console.log({ resourceType: "Bundle", type: "transaction", entry: resourceData });

    await postgresShutdown();
    hapiShutdown();
  } catch (err) {
    console.error(err);
    await postgresShutdown();
    hapiShutdown();
    await flushCursor(ids[0]);
    process.exit(1);
  }
}