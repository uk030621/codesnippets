import { MongoClient } from "mongodb";

const uri = process.env.SNIPPETMONGODB_URI;
const client = new MongoClient(uri);
const dbName = "snippets_db";

let cachedClient = null;

export async function connectToDatabase() {
  if (!cachedClient) {
    await client.connect();
    cachedClient = client;
  }
  const db = cachedClient.db(dbName);
  return { db, client: cachedClient };
}
