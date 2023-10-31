import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: 'elastic-id-poster',
  brokers: process.env.KAFKA_URL.split(',')
});

let isConnected = false;
const producer = kafka.producer({ allowAutoTopicCreation: false });
producer.on('producer.disconnect', () => { isConnected = false; })

export async function sendToKafka(resourceData) {
  if (!isConnected) {
    await producer.connect();
    isConnected = true; 
  }

  const message = { resourceType: "Bundle", type: "transaction", entry: resourceData };
  await producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [ { value: JSON.stringify(message) } ]
  });
}

export async function shutdown() {
  await producer.disconnect();
}
