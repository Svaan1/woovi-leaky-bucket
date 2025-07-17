import type { Document, Model } from "mongoose";
import mongoose from "mongoose";

const Schema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      description: "The user's name",
    },
    email: {
      type: String,
      description: "The user's email",
      unique: true,
    },
    password: {
      type: String,
      description: "The user's password",
    },
  },
  {
    collection: "User",
    timestamps: true,
  },
);

export type IUser = {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
} & Document;

export const User: Model<IUser> = mongoose.model("User", Schema);
