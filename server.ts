import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
// prefer to leave express open for new endpoints so leaving startStandaloneServer for awareness
// import { startStandaloneServer } from "@apollo/server/standalone"
import express, { Express, Request, Response } from "express"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import * as middlewares from "./resources/middlewares"
import api from "./api"
import bodyParser from "body-parser"
import fs from "fs"
import https from "https"
const privateKey = fs.readFileSync("certs/cert.key", "utf8")
const certificate = fs.readFileSync("certs/cert.pem", "utf8")
const credentials = { key: privateKey, cert: certificate }
import cors from "cors"
import dotenv from "dotenv"
import { PlacesAPI, WeatherAPI } from "./resources/rest"
import db from "./resources/db"
import { resolvers } from "./resources/resolvers"
import { typeDefs } from "./resources/typedefs"
import { verifyAccessToken } from "./resources/utils"

dotenv.config()

const app: Express = express()
const httpsServer = https.createServer(credentials, app)
const envServer = process.env.NODE_ENV === "dev" ? httpsServer : httpsServer

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  server: envServer,
})

const serverCleanup = useServer({ schema }, wsServer)

// Set up Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer: envServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

// evoking server asyncronously in order to instantiate Apollo Server
async function main(): Promise<void> {
  await server.start()
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(
    cors({
      origin: ["*"],
      credentials: true,
    }),
  )
  app.use(
    "/graphql",
    cors({
      origin: ["*"],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req /*, res*/ }) => {
        const { cache } = server
        const tokenIn = req.headers.authorization || ""
        const token = tokenIn.replace("token=", "")
        let user = { token, name: "", roles: [""] }
        var decoded: any = verifyAccessToken(token)
        if (decoded.success) {
          user = { token, name: decoded.data.name, roles: decoded.data.roles }
        } else {
          user = user
        }
        return {
          dataSources: {
            placesAPI: new PlacesAPI({ cache }),
            weatherAPI: new WeatherAPI({ cache }),
            db,
          },
          user,
        }
      },
    }),
  )

  app.get("/random", (req: Request, res: Response) => {
    res.json({ message: "Hello World!" })
  })

  // purely for testing
  app.get("/fivehundred", () => {
    throw new Error("some unexpected/uncaught async exception")
  })

  app.use("/api/v1", api)
  // app.use("/blogs", express.static(path.join(__dirname, "blogs")))
  app.use(middlewares.notFound)
  app.use(middlewares.errorHandler)
  const port = process.env.NODE_ENV === "dev" ? 2095 : 2096
  const protocol = process.env.NODE_ENV === "dev" ? "http" : "https"
  envServer.listen({ port }, () =>
    console.log(`🚀 ${protocol} Server ready at ${protocol}://localhost:${port}`),
  )
  // httpsServer.listen({ port: 2096 }, () =>
  //   console.log("🚀 https Server ready at https://localhost:2096"),
  // )
}
main().catch(console.error)

export default app // exporting app for testing
