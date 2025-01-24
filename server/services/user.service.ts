import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

import { SECRET_KEY, TOKEN_EXPIRATION } from "../config/config";
import Logging from "../utils/logging";
import { ErrorMessages } from "constants/exporter";
/**
 * Service class to manage user registration, login, and retrieval operations.
 */
class UserService {
  /**
   * Registers a new user.
   * Throws an error if a user with the given email already exists.
   * @param username The desired username for the new user.
   * @param email The email of the new user (must be unique).
   * @param password The plain-text password for the new user.
   * @returns The newly created user model.
   */
  public async registerUser(username: string, email: string, password: string) {
    // Log attempt to register (using your translation strings)
    Logging.success("GENERAL", ErrorMessages.Functions.User.AttemptingToRegisterUser(email));

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // Log a warning
      Logging.warn("GENERAL", ErrorMessages.Functions.User.EmailAlreadyExists(email));
      throw new Error(ErrorMessages.Texts.User.AlreadyExists); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Log success
    Logging.success("GENERAL", ErrorMessages.Functions.User.RegisteredSuccesfully(email));
    return newUser;
  }

  /**
   * Logs in a user:
   * 1) Checks that the email and password are valid.
   * 2) Generates and returns a JWT access token if successful.
   * Throws an error if email or password is invalid.
   * @param email The email of the user.
   * @param password The plain-text password.
   * @returns An object containing { user, accessToken }.
   */
  public async loginUser(email: string, password: string) {
    // Log login attempt
    Logging.success("GENERAL", ErrorMessages.Functions.User.UserLoginAttempt(email));

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Log a warning if no user found
      Logging.warn("GENERAL", ErrorMessages.Functions.User.NoUserFoundWithEmail(email));
      throw new Error(ErrorMessages.Texts.User.IncorrectLoginOrPasswordError);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log a warning for invalid password
      Logging.warn("GENERAL", ErrorMessages.Functions.User.InvalidPassword(email));
      throw new Error(ErrorMessages.Texts.User.IncorrectLoginOrPasswordError);
    }

    // Generate JWT
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Log success
    Logging.success("GENERAL", ErrorMessages.Functions.User.LoggedInSuccesfully(email));
    return { user, accessToken };
  }

  /**
   * Retrieves a user by their ID, returning a minimal set of fields.
   * @param userId The ID of the user to retrieve.
   * @returns The user object (id, username, email) or null if not found.
   */
  public async getUserById(userId: number) {
    // Log attempt to retrieve user by ID
    Logging.success("GENERAL", ErrorMessages.Functions.User.RetrievingById(userId));

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email"],
    });

    if (!user) {
      // Log a warning if user is not found
      Logging.warn("GENERAL", ErrorMessages.Functions.User.NoUserFoundWithId(userId));
    }
    return user;
  }
}

export default new UserService();
