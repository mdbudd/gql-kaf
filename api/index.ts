import express from "express"
import MessageResponse from "../interfaces/MessageResponse"
import messaging from "./messaging"

const router = express.Router()
// console.log(process.memoryUsage())
router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏"
  })
})
router.get<{}, MessageResponse>("/hello", (req, res) => {
  res.json({
    message: "Is it API you're looking for... 👋🌎🌍🌏"
  })
})

router.use("/messaging", messaging)

export default router
