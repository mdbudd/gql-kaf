import request from "supertest"
import app from "../server"
import { queryTest } from "../resources/queries"

describe("Test app.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/random")
    expect(res.body.message).toEqual("Hello World!")
  })
})

describe("GET /what-is-this-even", () => {
  it("responds with a not found message", (done) => {
    request(app)
      .get("/what-is-this-even")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(404, done)
  })
})

it("doesn't return stack information in production", async () => {
  process.env.NODE_ENV = "production"
  const response = await request(app).get("/fivehundred").set("Accept", "application/json")
  expect(response.body).toEqual(
    expect.objectContaining({
      stack: "🥞",
    }),
  )
})

describe("GET /graphql", () => {
  it("gets the weather", async () => {
    const response = await request(app).post("/graphql").send(queryTest)
    expect(response.error).toBe(false)
    expect(response.body.data?.hello).toBe("world")
    expect(response.body.data?.places[2].name).toBe("Bournemouth Gardens")
    expect(response.body.data?.weather.wind_unit).toBe("mp/h")
  })
})

afterAll(() => setTimeout(() => process.exit(), 1000))
