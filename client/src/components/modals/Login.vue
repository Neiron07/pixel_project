<template>
    <BaseModal ref="dialog" :modal-name="'login'" :heading="isLogin ? 'Login' : 'Register'" @submit="submitHandler">
        <div class="form-container flex-column gap-1">
            <div v-if="!isLogin" class="form-item">
                <label for="username">Username</label>
                <input type="text" name="username" id="username" v-model="username" />
            </div>
            <div class="form-item">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" v-model="email" />
            </div>
            <div class="form-item">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" v-model="password" />
            </div>
        </div>
        <p class="error">{{ errorMessage }}</p>
        <button type="submit">{{ isLogin ? 'Login' : 'Register' }}</button>
        <button type="button" class="switch-button" @click="switchMode">
            Switch to {{ isLogin ? 'Register' : 'Login' }}
        </button>
    </BaseModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "./BaseModal.vue";

const email = ref("");
const password = ref("");
const username = ref("");
const errorMessage = ref("");
const isLogin = ref(true);

function switchMode() {
    isLogin.value = !isLogin.value;
}

async function submitHandler(event: Event) {
    event.preventDefault();

    if (!email.value || !password.value || (!isLogin.value && !username.value)) {
        errorMessage.value = "All fields are required.";
        return;
    }
    //особо не заморачивался
    const url = isLogin.value ? "http://localhost:5000/user/login" : "http://localhost:5000/user/register";
    const body = isLogin.value
        ? { email: email.value, password: password.value }
        : { username: username.value, email: email.value, password: password.value };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            errorMessage.value = "";
            localStorage.setItem("token", data.accessToken);
            window.location.reload();
        } else {
            // Обработка ошибки API
            errorMessage.value = data.error || "An error occurred.";
        }
    } catch (error) {
        console.error("Authentication failed:", error);
        errorMessage.value = "An error occurred, please try again later.";
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
input[type="email"],
input[type="password"] {
    padding: 0.5rem;
    border: 1px solid var(--secondary-color);
    border-radius: 5px;
}

button[type="submit"],
.switch-button {
    padding: 0.5rem;
    background-color: var(--accent-color);
    color: var(--white);
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button[type="submit"]:hover,
.switch-button:hover {
    background-color: var(--accent-color-hover);
}

.error {
    color: red;
    margin-top: 1rem;
}

.switch-button {
    margin-top: 1rem;
    background-color: var(--secondary-color);
}
</style>
