<template>
    <BaseModal :modal-name="'login'" :heading="'Login'" @submit="loginSubmit">
        <div class="form-container flex-column gap-1">
            <div class="form-item">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" />
            </div>
            <div class="form-item">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" />
            </div>
        </div>
        <p class="error">{{ errorMessage }}</p>
        <button type="submit">Login</button>
    </BaseModal>
</template>
<script setup lang="ts">
import { ref, onMounted, inject } from "vue";
import BaseModal from "./BaseModal.vue";

// Импорт запросов
import authorisation from "../../requests/authentication";

// Переменные состояния
const dialog = ref<HTMLDialogElement | null>(null);
const errorMessage = ref("");

// Внедрение функции проверки авторизации
const checkLogin: () => void = inject("checkLogin")!;

onMounted(() => {
    dialog.value = document.querySelector("dialog") as HTMLDialogElement;
});

async function loginSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Проверка обязательных полей
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!email || !password) {
        errorMessage.value = "Email and password are required";
        return;
    }

    try {
        const response = await authorisation.login(email, password);

        const data = await response.json();

        if (data.accessToken) {
            errorMessage.value = "";

            localStorage.setItem("token", data.accessToken);
            form.reset();
            dialog.value?.close();
            checkLogin();
        } else if (response.status === 401) {
            errorMessage.value = "Invalid email or password";
        } 
    } catch (error) {
        console.error("Login failed:", error);
        form.reset();
        dialog.value?.close();
        checkLogin();
    }
}
</script>
<style scoped>
.form-item {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 1rem;
    align-items: center;
}

input[type="text"],
input[type="password"] {
    padding: 0.5rem;
    border: 1px solid var(--secondary-color);
    border-radius: 5px;
}
button[type="submit"] {
    padding: 0.5rem;
    background-color: var(--accent-color);
    color: var(--white);
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
button[type="submit"]:hover {
    background-color: var(--accent-color-hover);
}

.error {
    color: red;
}

@media screen and (max-width: 600px) {
    .form-item {
        grid-template-columns: 1fr;
        gap: 0;
    }
}
</style>
