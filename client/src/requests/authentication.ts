class Authorisation {
    static async login(email: string, password: string) {
        try {
            const response = await fetch(`/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
    
            const responseBody = await response.text();
    
            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseBody);
                    throw new Error(errorData.message || "Login failed");
                } catch {
                    throw new Error(responseBody || "Login failed");
                }
            }
    
            const data = JSON.parse(responseBody);
            console.log(data);
            await Authorisation.store(data.accessToken);
            return data; 
        } catch (error) {
            console.error("Login error:", error.message);
            throw error;
        }
    }

    static async logout() {
        try {
            await Authorisation.clear();
            console.log("Successfully logged out.");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    static async store(token: string) {
        localStorage.setItem("token", token);
    }

    static async get() {
        return localStorage.getItem("token");
    }

    static async clear() {
        localStorage.removeItem("token");
    }

    // Проверка, кто авторизован
    static async whoami() {
        try {
            const response = await fetch(`/user/whoami`, {
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
            return userData; 
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
