import express, { Request, Response } from "express"
import { createTopic, admin } from "../../resources/kafka/admin"
// import { runConsumer } from "../../resources/kafka/consumer"
import { runProducer } from "../../resources/kafka/producer"

const router = express.Router()

const topics = ["topic_test", "topic_new"]

const topicName = topics[1]
router.get("/seed", async function (req: Request, res: Response) {
  await createTopic(topicName).catch(console.error)
  // const topicList = await runConsumer(topicName)

  return res.json({ message: `topic ${topicName} created!` })
})

router.get("/send", async function (req: Request, res: Response) {
  const topicList = await runProducer(topicName, [
    { value: "Hello Worlds!" },
    { value: "Hello Kafka" },
    { value: "Kafka, Docker, Node.js" },
  ])

  res.format({
    json: function () {
      res.json(topicList)
    },
  })
})

router.get("/topics", async function (req: Request, res: Response) {
  const topicList = await admin.fetchTopicMetadata()

  res.format({
    json: function () {
      res.json(topicList)
    },
  })
})
export default router
