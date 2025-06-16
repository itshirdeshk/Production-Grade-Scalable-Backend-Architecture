import app from "./app"
import { port } from "./config"
import Logger from "./core/Logger"
import dotenv from "dotenv"

dotenv.config()

app.listen(port, () => {
  Logger.info(`Server is running on port ${port}`) // Log server start
})
  .on("error", e => Logger.error(`Server error: ${e}`))
