import {  Schema, InferSchemaType, model } from "mongoose";


const userSchema = new Schema (
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }
  },{
    timestamps: true,
  }
)

type UserType = InferSchemaType<typeof userSchema>

const UserModel = model<UserType>('User', userSchema)

export default UserModel