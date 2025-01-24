import { Router } from "express";
import { body } from "express-validator";

import jwtauthenticator from "../middleware/authenticator";
import { registerUser, loginUser, whoami } from "../controllers/user.controller";
import { ErrorMessages } from "../constants/exporter";
import Routes from "../constants/routes";

/**
 * Router for user-related operations.
 */
const router = Router();

/**
 * @route POST /register
 * @description Register a new user
 * @access Public
 */
router.post(
  Routes.User.Register,
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage(ErrorMessages.Texts.RouteValidation.UserNameShoudlContainMin3Symbols),
    body("email")
      .isEmail()
      .withMessage(ErrorMessages.Texts.RouteValidation.InvalidEmail),
    body("password")
      .isLength({ min: 6 })
      .withMessage(ErrorMessages.Texts.RouteValidation.PasswordShouldContainMin6Symbols),
  ],
  registerUser
);

/**
 * @route POST /login
 * @description Login an existing user
 * @access Public
 */
router.post(
  Routes.User.Login,
  [
    body("email")
      .isEmail()
      .withMessage(ErrorMessages.Texts.RouteValidation.InvalidEmail),
    body("password")
      .exists()
      .withMessage(ErrorMessages.Texts.RouteValidation.PasswordRequired),
  ],
  loginUser
);

/**
 * @route GET /whoami
 * @description Get the current authenticated user's information
 * @access Protected
 */
router.get(Routes.User.WhoAmI, jwtauthenticator, whoami);

export default router;
