import { getResourceTuples, shutdown as postgresShutdown } from './postgres.js';
import { getResourceData, shutdown as hapiShutdown } from './hapi.js';
import { sendToKafka, shutdown as kafkaShutdown } from './kafka.js';
import { flushCursor } from '../filesystem/cursor.js';

export async function shutdown() {
  await Promise.all([postgresShutdown(), kafkaShutdown()]);
  hapiShutdown();
}

export async function execute(ids) {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error(`Failed to pass in a valid populated array. Received: ${JSON.stringify(ids)}`);

  try {
    // rather than hope that postgres returns an array in the same order as the ids (and have to sync two arrays)
    // simply have postgres return a array of tuples of (resource_type, forced_id) instead
    const resourceTuples = await getResourceTuples(ids);
    const resourceData = await getResourceData(resourceTuples);
    resourceData.length > 0 && await sendToKafka(resourceData);
  } catch (err) {
    console.error(err);
    await flushCursor(ids[0]);
  }
}
