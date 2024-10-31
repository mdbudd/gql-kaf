import { Message } from "kafkajs"
import { kafka } from "./kafka-client"

// Create a producer instance
const producer = kafka.producer()

export const runProducer = async (topic: string, messages: Message[]) => {
  try {
    // Connect the producer to the Kafka broker
    await producer.connect()
    console.log("Producer connected - 🔗")

    // Send messages to the topic
    await producer.send({
      topic, // Replace with your topic name
      messages,
    })

    console.log("Messages sent - 📤")

    // Disconnect the producer
    await producer.disconnect()
    console.log("Producer disconnected - 🛑")
  } catch (err) {
    console.error("Error in producer:", err)
  }
}

// runProducer()
