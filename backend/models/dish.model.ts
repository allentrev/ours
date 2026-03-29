// models/Dish.ts
import mongoose from "mongoose"

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true }
})

export default mongoose.model("Dish", DishSchema)