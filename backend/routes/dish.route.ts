// routes/dishes.ts
import express from "express"
import Dish from "../models/dish.model.js"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ name: 1 })
    res.json(dishes)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dishes" })
  }
})

export default router