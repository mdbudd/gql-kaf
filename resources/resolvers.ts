import { PubSub } from "graphql-subscriptions"
import { WeatherAPI, PlacesAPI } from "./rest"
import DataLoader from "dataloader"
import GraphQLJSON from "graphql-type-json"
import { persistConsumer } from "./kafka/consumer"
import { authors /*, books*/ } from "../data/data"
import db from "./db"

interface ContextValue {
  user: any
  dataSources: {
    placesAPI: PlacesAPI
    weatherAPI: WeatherAPI
    db: any
  }
}
export const pubsub = new PubSub()

let currentNumber = 0
// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber })
  setTimeout(incrementNumber, 1000)
}
// Start incrementing
incrementNumber()
persistConsumer("topic_new")
export const resolvers = {
  JSON: GraphQLJSON,
  Subscription: {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
    newMessage: {
      subscribe: () => {
        return pubsub.asyncIterator(["MESSAGE_CREATED"])
      },
    },
  },
  Query: {
    currentNumber() {
      return currentNumber
    },
    hello: () => "world",
    places: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parent: any,
      args: { name: string },
      contextValue: ContextValue,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: any,
    ) => {
      let places = contextValue.dataSources.placesAPI.getPlace(args.name)
      return places
    },
    weather: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parent: any,
      args: { latitude: number; longitude: number },
      contextValue: ContextValue,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: any,
    ) => {
      let weather = contextValue.dataSources.weatherAPI.getWeather(
        args.latitude.toString(),
        args.longitude.toString(),
      )
      return weather
    },

    getStudents: () => db.students.list(),
  },

  Book: {
    // author: parent => {
    //   console.log(authors.find(author => author.id === parent.author))
    //   return authors.find(author => author.id === parent.author)
    // },
    author: (parent: any) => {
      const authorLoader = new DataLoader((keys: any) => {
        const result = keys.map((authorId: any) => {
          return authors.find((author) => author.id === authorId)
        })

        return Promise.resolve(result)
      })

      return authorLoader.load(parent.author)
    },
  },
  Mutation: {
    createStudent: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parent: any,
      args: any,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      contextValue: ContextValue,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: any,
    ) => {
      const id = db.students.create({
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        password: args.password,
        new: args.new,
      })
      return db.students.get(id)
    },
  },
}
