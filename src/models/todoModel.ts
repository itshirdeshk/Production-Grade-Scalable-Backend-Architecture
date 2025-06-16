import mongoose, { Model, Schema } from "mongoose"

export interface Todo extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  status: string;
}

export enum Status {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE"
}

export const DOCUMENT_NAME = "Todo";
export const COLLECTION_NAME = "todos";

const todoModel = new Schema<Todo>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: Status.NOT_STARTED,
      enum: Object.values(Status),
    },
  },
  {
    timestamps: true,
  }
)

const Todo: Model<Todo> = mongoose.model<Todo>(DOCUMENT_NAME, todoModel, COLLECTION_NAME);

export default Todo
