import { Request, Response } from "express";

import User from "../models/user.model.js";
import { PostModel } from "../models/Blog/post.model.js";
import Image from "../models/image.model.js";
import  CommentModel  from "../models/Blog/comment.model.js";
import { createTypedWebhook } from "../lib/typedWebhook.js";

const getRoleFromClerkUser = (data: any) =>
  typeof data.public_metadata?.role === "string"
    ? data.public_metadata.role
    : "visitor";

export const clerkWebHook = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  const payload = req.body.toString("utf-8");
  const headers = req.headers as Record<string, string>;

  //console.log("content-type:", req.headers["content-type"]);
  //console.log("isBuffer:", Buffer.isBuffer(req.body));
  //console.log("body length:", req.body?.length);
  //console.log("svix-id:", req.headers["svix-id"]);
  //console.log(
  //  "svix-signature:",
  //  req.headers["svix-signature"] ? "present" : "missing"
  //);
  //console.log("svix-timestamp:", req.headers["svix-timestamp"]);

  const { verify } = createTypedWebhook(WEBHOOK_SECRET);

  try {
    const evt = verify(payload, headers);

    console.log("Received event type:", evt.type);
    //
    // ******************** user created *******************************************
    if (evt.type === "user.created") {
      const primaryEmail =
        evt.data.email_addresses?.find(
          (email) => email.id === evt.data.primary_email_address_id
        )?.email_address ?? null;

      if (!primaryEmail) {
        console.warn("user.created received without an email address", {
          clerkUserId: evt.data.id,
          primaryEmailAddressId: evt.data.primary_email_address_id,
        });

        return res.status(200).json({
          message: "Webhook received, but no email was available",
        });
      }

      const username =
        evt.data.username ||
        [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") ||
        primaryEmail;
      //console.log("clerkwebhook evt.data", evt.data);
      await User.updateOne(
        { clerkUserId: evt.data.id },
        {
          $set: {
            clerkUserId: evt.data.id,
            username,
            email: primaryEmail,
            img: evt.data.profile_image_url ?? "",
          },
          $setOnInsert: {
            role: "applicant",
          }
        },
        { upsert: true }
      );
      console.log("User created:", {
        clerkUserId: evt.data.id,
        username,
        email: primaryEmail,
      });
      return res.status(200).json({
        message: "User created",
      });
    //
    /******************** user deleted *******************************************88  */
    } else if (evt.type === "user.deleted") {
      const deletedUser = await User.findOneAndDelete({
        clerkUserId: evt.data.id,
      });

      if (deletedUser) {
        await PostModel.deleteMany({ user: deletedUser._id });
        await CommentModel.deleteMany({ user: deletedUser._id });
      }
      console.log("User deleted:", {
        clerkUserId: evt.data.id,
        deletedUserId: deletedUser?._id,
      });
      return res.status(200).json({
        message: "User deleted",
      });
    //
    /******************** user updated   *******************************************88  */
    } else if (evt.type === "user.updated") {
      //console.log("Processing user.updated event:", evt.data);
      const primaryEmail =
        evt.data.email_addresses?.find(
          (email) => email.id === evt.data.primary_email_address_id
        )?.email_address ?? null;

      const username =
        evt.data.username ||
        [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") ||
        primaryEmail ||
        evt.data.id;
      
      //console.log("Role = ", getRoleFromClerkUser(evt.data));
      try {
        await User.updateOne(
          { clerkUserId: evt.data.id },
          {
            $set: {
              username,
              email: primaryEmail,
              img: evt.data.profile_image_url ?? "",
              role: getRoleFromClerkUser(evt.data),
            },
          },
          { upsert: true },
        );
      } catch (error) {
          console.error("Error updating user:", error);
          return res.status(500).json({
            message: "Error updating user",
            error: (error as Error).message,
          });
      } 

      console.log("User updated:", {
        clerkUserId: evt.data.id,
        username,
        email: primaryEmail,
      });
      return res.status(200).json({
        message: "User updated",
      });



    //
    /******************** user other events *******************************************88  */
    } else {
      console.warn("Unhandled Clerk event:", evt);
    }

    return res.status(200).json({
      message: "Webhook received",
    });
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return res.status(400).json({
      message: "Webhook handling failed!",
    });
  }
};

export const uploadWebhook = async (req: Request, res: Response) => {
  const { fileName, url, size } = req.body;

  await Image.create({
    fileName,
    url,
    size,
  });

  res.json({ success: true });
};