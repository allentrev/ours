// lib/apiResponse.ts

import type {
  Response,
} from "express";

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message: string
) => {
  return successResponse(
    res,
    data,
    message,
    201
  );
};