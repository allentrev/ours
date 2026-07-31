import { Request, Response, NextFunction} from "express";

import { PostModel } from "../models/Blog/post.model.js";

const increaseVisit = async (req: Request, res: Response, next: NextFunction) => {
  const slug = req.params.slug;

  await PostModel.findOneAndUpdate({ slug }, { $inc: { visit: 1 } });

  next();
};

export default increaseVisit;
