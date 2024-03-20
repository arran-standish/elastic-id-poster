import http from 'node:http';

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 5,
  maxTotalSockets: 15,
  timeout: 1000 * 60 * 2
});

function promisfyHapiGet(resourceTuple) {
  const url = `http://${process.env.HAPI_URL}:${process.env.HAPI_PORT}/fhir/${resourceTuple.resource_type}/${resourceTuple.forced_id}`;
  return new Promise((resolve, reject) => {
    http.get(url, { agent }, (res) => {
      const { statusCode } = res;
      // if the resource is deleted hapi fhir will return a 410
      // so just consume the response without processing
      if (statusCode === 410) {
        res.resume();
        return resolve(null);
      }

      res.setEncoding('utf-8');
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (statusCode > 299) return reject(new Error(`failed to process: ${url}\n${data.toString()}`));

          const parsedData = JSON.parse(data);
          delete parsedData.meta;
          const requestDetail = {
            method: "PUT",
            url: `${resourceTuple.resource_type}/${resourceTuple.forced_id}`
          }
          resolve({ resource: parsedData, request: requestDetail });
        } catch (error) {
          reject(error);
        }
      })
    }).on('error', (error) => reject(error));
  });
}

export async function getResourceData(resourceTuples) {
  const promises = [];
  const deletes = [];
  for (const resourceTuple of resourceTuples) {
    const { res_deleted_at } = resourceTuple;
    if (res_deleted_at == null) promises.push(promisfyHapiGet(resourceTuple));
    else deletes.push({
      request: {
        method: 'DELETE',
        url: `${resourceTuple.resource_type}/${resourceTuple.forced_id}`
      }
    });
  };

  // what happens if we throw over here
  // does it bubble up to the caller? it would right...
  const responses = await Promise.all(promises);
  return [deletes, responses.filter(response => response && response.resource)];
}

export function shutdown() {
  agent.destroy();
}
