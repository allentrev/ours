import { Request, Response } from "express";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { createTypedWebhook, isUnknownEvent, isUserCreatedEvent, isUserDeletedEvent } from "../lib/typedWebhook.js";

export const clerkWebHook = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  // use raw body for verification (set in body-parser middleware)
  const payload = (req as any).rawBody as string;
  const headers = req.headers;

  const { verify } = createTypedWebhook(WEBHOOK_SECRET);

  try {
    const evt = verify(payload, headers as Record<string, string>);

    console.log("Received event:", evt);

    if (isUserCreatedEvent(evt)) {
      const newUser = new User({
        clerkUserId: evt.data.id,
        username:
          evt.data.username || evt.data.email_addresses[0].email_address,
        email: evt.data.email_addresses[0].email_address,
        img: evt.data.profile_img_url,
      });

      await newUser.save();
    } else if (isUserDeletedEvent(evt)){
      const deletedUser = await User.findOneAndDelete({
        clerkUserId: evt.data.id,
      });

      if (deletedUser) {
        await Post.deleteMany({ user: deletedUser._id });
        await Comment.deleteMany({ user: deletedUser._id });
      }
    } else if (isUnknownEvent(evt)) {
      console.warn("Unhandled Clerk event:", evt.type, evt.data);
    }

    return res.status(200).json({
      message: "Webhook received",
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({
      message: "Webhook verification failed!",
    });
  }
};
