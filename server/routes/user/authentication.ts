import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import jwtauthenticator from "../../middleware/authenticator"; // Укажите корректный путь до вашего middleware
import User from "../../models/user";
import { SECRET_KEY, TOKEN_EXPIRATION } from "../../config/config";

const router = express.Router();

// Регистрация пользователя
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).withMessage("Имя пользователя должно содержать минимум 3 символа."),
    body("email").isEmail().withMessage("Некорректный email."),
    body("password").isLength({ min: 6 }).withMessage("Пароль должен быть минимум 6 символов."),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Проверка на уникальность email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Пользователь с таким email уже существует." });
      }

      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Сохранение пользователя
      const newUser = await User.create({ username, email, password: hashedPassword });

      res.status(201).json({
        message: "Пользователь успешно зарегистрирован.",
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
      });
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера." });
    }
  }
);

// Авторизация пользователя
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Некорректный email."),
    body("password").exists().withMessage("Пароль обязателен."),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Поиск пользователя
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Неверный email или пароль." });
      }

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Неверный email или пароль." });
      }

      // Создание JWT
      const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: TOKEN_EXPIRATION,
      });

      res.status(200).json({ message: "Авторизация успешна.", accessToken });
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера." });
    }
  }
);

// Получение текущего пользователя
router.get("/whoami", jwtauthenticator, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.id; // Берем id из токена, добавленного middleware

    if (!userId) {
      return res.status(401).json({ error: "Пользователь не авторизован." });
    }

    // Используем findByPk для поиска пользователя по id
    const user = await User.findByPk(userId, { attributes: ["id", "username", "email"] });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка получения данных пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});


export { router as authenticationRouter };
