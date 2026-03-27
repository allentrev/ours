import mongoose from "mongoose"

const ImageSchema = new mongoose.Schema({

  url: String,
  fileName: String,
  size: Number

})

export default mongoose.model(
  "Image",
  ImageSchema
)
