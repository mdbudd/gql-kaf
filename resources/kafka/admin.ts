import { kafka } from "./kafka-client"

export const admin = kafka.admin()

export const createTopic = async (topicName: string) => {
  await admin.connect()
  console.log("Connected to Kafka broker - 📪")

  const topicsToCreate = [
    {
      topic: topicName,
      numPartitions: 1,
      replicationFactor: 1,
    },
  ]

  await admin.createTopics({
    topics: topicsToCreate,
  })
  console.log(`Topic "${topicName}" created successfully - 📁`)

  await admin.disconnect()
  console.log("Disconnected from Kafka broker")
}

