import { Kafka, KafkaConfig } from "kafkajs"

const kafkaConfig: KafkaConfig = { clientId: "my-app", brokers: ["localhost:29092"] }
export const kafka = new Kafka(kafkaConfig)
