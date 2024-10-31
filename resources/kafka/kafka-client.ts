import { Kafka, KafkaConfig } from "kafkajs"

const kafkaConfig: KafkaConfig = {
  enforceRequestTimeout: false,
  clientId: "my-app",
  brokers: ["localhost:29092"],
}
export const kafka = new Kafka(kafkaConfig)
