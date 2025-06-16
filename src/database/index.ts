import mongoose, { mongo } from "mongoose"
import Logger from "../core/Logger"
import { db } from "../config";

const dbURI = `mongodb://localhost:27017/${db.name}`
// const dbURI = `mongodb://${db.user}:${encodeURIComponent(db.password)}@${db.host}:${db.port}/${db.name}`

const options = {
  autoIndex: true,
  minPoolSize: db.minPoolSize,
  maxPoolSize: db.maxPoolSize,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}

Logger.debug("Database URI: ", dbURI);

function setRunValidators() {
  return { runValidators: true };
}

mongoose.set("strictQuery", true);

mongoose
  .plugin(((schema: any) => {
    schema.pre("findOneAndUpdate", setRunValidators);
    schema.pre("updateMany", setRunValidators);
    schema.pre("updateOne", setRunValidators);
    schema.pre("update", setRunValidators);
  }))
  .connect(dbURI, options)
  .then(() => {
    Logger.info("Mongoose Connection Established");
  })
  .catch((err: any) => {
    Logger.info("Mongoose Connection Error: ", err);
    Logger.error(err);
  });

mongoose.connection.on("connected", () => {
  Logger.debug("Mongoose deafult connection is open to " + dbURI);
});

mongoose.connection.on("error", (err: any) => {
  Logger.error("Mongoose default connection Error: " + err);
});

mongoose.connection.on("disconnected", () => {
  Logger.debug("Mongoose default connection is disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close().finally(() => {
    Logger.info("Mongoose default connection is disconnected due to application termination");
    process.exit(0);
  });
});

export const dbConnection = mongoose.connection;