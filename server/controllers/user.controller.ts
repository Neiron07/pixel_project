import { Request, Response } from "express";
import { validationResult } from "express-validator";

import userService from "../services/user.service";
import Logging from "../utils/logging";
import { ErrorMessages } from "../constants/exporter";
import { Enums } from "../types/exporter";

/**
 * Handles user registration.
 * Validates the input, creates a new user, and returns the created user data.
 * @param req - Express request object containing `username`, `email`, and `password` in the body.
 * @param res - Express response object.
 */
export async function registerUser(req: Request, res: Response) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Logging.warn(Enums.HttpRequestTypes.POST, errors.array().toString());
      return res
        .status(Enums.HttpStatusCodes.BadRequest)
        .json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const newUser = await userService.registerUser(username, email, password);

    Logging.success(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.User.SuccessfullyRegistered);
    return res.status(Enums.HttpStatusCodes.Created).json({
      message: ErrorMessages.Texts.User.SuccessfullyRegistered,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (error: any) {
    Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.User.RegistrationError, error);
    if (error.message.includes(ErrorMessages.Texts.User.AlreadyExists)) {
      return res
        .status(Enums.HttpStatusCodes.Conflict)
        .json({ error: error.message });
    }
    return res
      .status(Enums.HttpStatusCodes.ServerError)
      .json({ error: ErrorMessages.Texts.General.ServerError });
  }
}

/**
 * Handles user login.
 * Validates the input, checks user credentials, and returns an access token on success.
 * @param req - Express request object containing `email` and `password` in the body.
 * @param res - Express response object.
 */
export async function loginUser(req: Request, res: Response) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Logging.warn(Enums.HttpRequestTypes.POST, errors.array().toString());
      return res
        .status(Enums.HttpStatusCodes.BadRequest)
        .json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const { user, accessToken } = await userService.loginUser(email, password);

    Logging.success(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.User.SuccessfullyAuthorized);
    return res.status(Enums.HttpStatusCodes.Success).json({
      message: ErrorMessages.Texts.User.SuccessfullyAuthorized,
      accessToken,
    });
  } catch (error: any) {
    Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.User.AuthorizationError, error);
    if (error.message.includes(ErrorMessages.Texts.User.IncorrectLoginOrPasswordError)) {
      return res
        .status(Enums.HttpStatusCodes.Unauthorized)
        .json({ error: error.message });
    }
    return res
      .status(Enums.HttpStatusCodes.ServerError)
      .json({ error: ErrorMessages.Texts.General.ServerError });
  }
}

/**
 * Retrieves information about the currently authenticated user.
 * Checks the user's ID from the token and fetches their data.
 * @param req - Express request object with user information in the token.
 * @param res - Express response object.
 */
export async function whoami(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    // If no user ID is found, return Unauthorized
    if (!userId) {
      Logging.warn(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.User.UserIsNotAuthorized);
      return res
        .status(Enums.HttpStatusCodes.Unauthorized)
        .json({ error: ErrorMessages.Texts.User.UserIsNotAuthorized });
    }

    const user = await userService.getUserById(userId);

    // If user is not found, return Not Found
    if (!user) {
      Logging.warn(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.User.UserIsNotFound);
      return res
        .status(Enums.HttpStatusCodes.NotFound)
        .json({ error: ErrorMessages.Texts.User.UserIsNotFound });
    }

    return res.status(Enums.HttpStatusCodes.Success).json(user);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.User.UserInformationGettingError, error);
    return res
      .status(Enums.HttpStatusCodes.ServerError)
      .json({ error: ErrorMessages.Texts.General.ServerError });
  }
}
