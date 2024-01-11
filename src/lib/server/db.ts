import { MongoClient, ServerApiVersion} from 'mongodb';
import "dotenv/config";


// Database URI and name
const DB_URI = process.env.DB_URI;
const DB_NAME = "files-db";

if (!DB_URI) {
    throw new Error("Database URI is not set");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 100,
});

// Connect the client to the server (optional starting in v4.7)
client.connect();
export const db = client.db(DB_NAME);
