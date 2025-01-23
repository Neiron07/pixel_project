class Authorisation {
    // Авторизация и сохранение токена
    static async login(email: string, password: string) {
        try {
            const response = await fetch(`/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            await Authorisation.store(data.token); // Сохранение токена
            return data; // Возвращаем данные о пользователе
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    // Выход (удаление токена)
    static async logout() {
        try {
            await Authorisation.clear();
            console.log("Successfully logged out.");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    // Сохранение токена в localStorage
    static async store(token: string) {
        localStorage.setItem("token", token);
    }

    // Получение токена из localStorage
    static async get() {
        return localStorage.getItem("token");
    }

    // Очистка токена из localStorage
    static async clear() {
        localStorage.removeItem("token");
    }

    // Проверка, кто авторизован
    static async whoami() {
        try {
            const response = await fetch(`/auth/whoami`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await Authorisation.get()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Unauthorized");
            }

            const userData = await response.json();
            return userData; // Возвращаем информацию о пользователе
        } catch (error) {
            console.error("Whoami error:", error);
            throw error;
        }
    }

    // Проверка авторизации
    static async isAuthenticated(): Promise<boolean> {
        const token = await Authorisation.get();
        if (!token) return false;

        // Опционально: проверка истечения срока токена
        try {
            const response = await Authorisation.whoami();
            return !!response; // Если успешно, пользователь авторизован
        } catch (error) {
            return false; // Ошибка говорит о том, что токен недействителен
        }
    }
}

export default Authorisation;
