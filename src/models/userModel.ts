import mongoose, { Document, Model, Schema, Types } from "mongoose"
import bcrypt from "bcrypt"
import { RoleCode } from "./roleModel";

export interface UserDoc extends Document {
  _id: Schema.Types.ObjectId;
  name?: string;
  email?: string;
  roles: Types.ObjectId[];
  password?: string;
  matchPassword?: (enteredPassword: string) => Promise<boolean>;
}

export interface UserModel extends Model<UserDoc> {
  matchPassword?: (enteredPassword: string) => Promise<boolean>;
}

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

const userSchema = new Schema<UserDoc>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    roles: {
      type: [
        {
          type: Types.ObjectId,
          ref: "Role",
        },
      ]
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  if (this.password) this.password = await bcrypt.hash(this.password, salt)
})

const User: Model<UserDoc> = mongoose.model<UserDoc, UserModel>(DOCUMENT_NAME, userSchema, COLLECTION_NAME)

export default User
