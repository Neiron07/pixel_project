import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import Logging from "../utils/logging";
import { SECRET_KEY } from "../config/config";
import settingsFn from "../utils/settings";
import { ErrorMessages } from "../constants/exporter";
import { Enums } from "../types/exporter";

const settings = settingsFn();

/**
 * Middleware for JWT authentication.
 * Verifies the Authorization header, extracts the token,
 * decodes it, and attaches the user data to `req.user`.
 * If no accounts are configured, skips the middleware.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
async function jwtauthenticator(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Logging.attempting(req);

  // Check if accounts exist in settings
  const accountsExist = (await settings).accounts;
  if (!accountsExist) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    Logging.warn(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.Authentication.AuthHeaderMissing);
    res.status(Enums.HttpStatusCodes.Unauthorized).send(ErrorMessages.Texts.Authentication.AuthHeaderMissing);
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    Logging.warn(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.Authentication.TokenMissing);
    res.status(Enums.HttpStatusCodes.Unauthorized).send(ErrorMessages.Texts.Authentication.TokenMissing);
    return;
  }

  try {
    const decoded = await verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    Logging.error(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.Authentication.InvalidToken, err);
    res.status(Enums.HttpStatusCodes.Forbidden).send(ErrorMessages.Texts.Authentication.InvalidToken);
    return;
  }
}

/**
 * Verifies the provided JWT token.
 * @param token - The JWT token to verify.
 * @returns Decoded token data or rejects if invalid.
 */
function verifyToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

export default jwtauthenticator;
