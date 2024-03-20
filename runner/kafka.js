import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: 'elastic-id-poster',
  brokers: process.env.KAFKA_URL.split(',')
});

let isConnected = false;
const producer = kafka.producer({ allowAutoTopicCreation: false });
producer.on('producer.disconnect', () => { isConnected = false; })

export async function sendPostsToKafka(resourceData) {
  const message = { resourceType: "Bundle", type: "transaction", entry: resourceData };
  
  await sendToKafka(message);
}

export async function sendDeletesToKafka(deleteData) {
  for (const request of deleteData) {
    await sendToKafka(request);
  }
}

async function sendToKafka(message) {
  if (!isConnected) {
    await producer.connect();
    isConnected = true; 
  }

  await producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [ { value: JSON.stringify(message) } ]
  });
}

export async function shutdown() {
  await producer.disconnect();
}
