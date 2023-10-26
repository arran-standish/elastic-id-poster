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
      res.setEncoding('utf-8');
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const { statusCode } = res;
          const parsedData = JSON.parse(data);
          // if the resource is deleted hapi fhir will return a 410
          // so just resolve nothing
          // although need to handle it properly in the promise array
          // otherwise you might have a blank object that gets posted to kafka
          if (statusCode === 410) { 
            res.resume();
            return resolve();
          }
          if (statusCode > 299) reject(new Error(data.toString()));
          else {
            delete parsedData.meta;
            const requestDetail = {
              method: "PUT",
              url: `${resourceTuple.resource_type}/${resourceTuple.forced_id}`
            }
            resolve({ resource: parsedData, request: requestDetail });
          }
        } catch (error) {
          reject(error);
        }
      })
    }).on('error', (error) => reject(error));
  });
}

export async function getResourceData(resourceTuples) {
  const promises = [];
  for (const resourceTuple of resourceTuples) {
    promises.push(promisfyHapiGet(resourceTuple));
  };

  // what happens if we throw over here
  // does it bubble up to the caller? it would right...
  return await Promise.all(promises);
}

export function shutdown() {
  agent.destroy();
}
