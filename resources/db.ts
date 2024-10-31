import { DataStore } from "notarealdb"

const store = new DataStore("./data")

const db = {
  students: store.collection("students"),
}
export default db
