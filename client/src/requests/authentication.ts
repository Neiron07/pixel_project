class Authorisation {
    static async register(username: string, email: string, password: string ) {
        console.log(username, email, password)
        const response = await fetch(`/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        console.log(response)
        return await this.handleResponse(response);
    }

    static async login(email: string, password: string) {
        try {
            const response = await fetch(`/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await this.handleResponse(response);
            console.log("Login successful:", data);

            await this.store(data.accessToken);

            return data;
        } catch (error) {
            console.error("Login error:", error.message);
            throw error;
        }
    }

    static async logout() {
        try {
            await this.clear();
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
    static async whoami() {
        try {
            const response = await fetch(`/user/whoami`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await this.get()}`,
                },
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error("Whoami error:", error);
            throw error;
        }
    }

    static async isAuthenticated(): Promise<boolean> {
        const token = await this.get();
        if (!token) return false;

        try {
            const user = await this.whoami();
            return !!user;
        } catch {
            return false;
        }
    }

    private static async handleResponse(response: Response) {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
    
        const text = await response.text();
        
        // If the response is empty (204 No Content), return an empty object
        if (!text) return {};
    
        try {
            return JSON.parse(text);
        } catch {
            console.error("Invalid JSON response:", text);
            throw new Error(text || "An unexpected error occurred.");
        }
    }
    
}

export default Authorisation;
