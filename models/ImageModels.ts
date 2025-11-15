import {Schema , model, Types, InferSchemaType} from 'mongoose'


const imageSchema = new Schema ({
  owner: {
    type: Types.ObjectId, 
    ref: "Users",
    required: true
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
  },
    transformations: [
      {
        type: { type: String },
        details: { type: Object },
        date: { type: Date, default: Date.now },
        file: String,
      },
    ],
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

type ImageType = InferSchemaType<typeof imageSchema>;

export const ImageModel = model<ImageType>("Image", imageSchema)

