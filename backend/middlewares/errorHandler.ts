// middlewares/errorHandler.ts

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import { AppError } from "../lib/AppError.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(
    `[${_req.method}] ${_req.originalUrl}`,
    error
  );

  /* -------------------- Application errors -------------------- */

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  /* -------------------- Mongoose validation -------------------- */

  if (
    error instanceof
    mongoose.Error.ValidationError
  ) {
    const fieldLabels: Record<
      string,
      string
    > = {
      relationshipType:
        "relationship type",

      relationshipDate:
        "relationship date",

      fatherHandle:
        "father",

      motherHandle:
        "mother",
    };

    const errors = Object.entries(
      error.errors
    ).map(
      ([field, validationError]) => {
        const label =
          fieldLabels[field] ??
          field;

        if (
          validationError.kind ===
          "enum"
        ) {
          return `"${validationError.value}" is not a valid ${label}.`;
        }

        return validationError.message;
      }
    );

    return res.status(400).json({
      success: false,
      message: errors.join(" "),
      errors,
    });
  }

  /* -------------------- Invalid ObjectId etc -------------------- */

  if (
    error instanceof
    mongoose.Error.CastError
  ) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}.`,
    });
  }

  /* -------------------- Duplicate key -------------------- */

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  ) {
    const duplicateError = error as {
      keyValue?: Record<
        string,
        unknown
      >;
    };

    const field = Object.keys(
      duplicateError.keyValue ?? {}
    )[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists.`
        : "Duplicate value.",
    });
  }

  /* -------------------- Unknown -------------------- */

  if (error instanceof Error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      "An unexpected server error occurred.",
  });
};