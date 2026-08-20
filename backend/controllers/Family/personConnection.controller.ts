import type {
  Request,
  Response,
} from "express";

import {
  findPersonConnection,
} from "../../services/personConnection.service.js";

const modName =
  "/controllers/Family/personConnection.controller/";

export const getPersonConnection = async (
  req: Request,
  res: Response
) => {
  const funcName =
    "getPersonConnection";

  try {
    const fromId =
      typeof req.query.fromId ===
      "string"
        ? req.query.fromId
        : undefined;

    const toId =
      typeof req.query.toId ===
      "string"
        ? req.query.toId
        : undefined;

    if (
      !fromId ||
      !toId
    ) {
      return res
        .status(400)
        .json({
          message:
            "fromId and toId are required",
        });
    }

    const result =
      await findPersonConnection(
        fromId,
        toId
      );

    return res
      .status(200)
      .json(
        result
      );
  } catch (err) {
    console.error(
      `${modName}${funcName} error:`,
      err
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to find person connection",
      });
  }
};