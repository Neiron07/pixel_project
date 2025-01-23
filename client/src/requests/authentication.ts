class Authorisation {
    static async login(email: string, password: string) {
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
        return response;
    }
    static async logout() {
        // TODO: implement logout
    }

    static async store(token: string) {
        localStorage.setItem("token", token);
    }

    static async get() {
        return localStorage.getItem("token");
    }

    static async whoami() {
        const response = await fetch(`/auth/whoami`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await Authorisation.get()}`,
            },
        });
        return response;
    }
}

export default Authorisation;
