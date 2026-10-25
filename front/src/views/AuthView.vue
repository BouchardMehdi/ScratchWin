<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const mode = ref("login");
const errorMessage = ref("");

const loginForm = reactive({
  emailOrUsername: "",
  password: "",
});

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
});

async function submitLogin() {
  errorMessage.value = "";

  try {
    await authStore.login(loginForm);
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function submitRegister() {
  errorMessage.value = "";

  try {
    await authStore.register(registerForm);
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>

<template>
  <section class="auth-layout">
    <div class="auth-intro">
      <p class="eyebrow">Authentification</p>
      <h1>Connecte-toi pour commencer a jouer.</h1>
      <p>
        Cree ton compte pour recevoir 50 credits, choisir un ticket et retrouver tes parties.
      </p>
    </div>

    <div class="auth-card">
      <div class="auth-tabs">
        <button type="button" class="tab-button" :class="{ active: mode === 'login' }" @click="mode = 'login'">
          Connexion
        </button>
        <button type="button" class="tab-button" :class="{ active: mode === 'register' }" @click="mode = 'register'">
          Inscription
        </button>
      </div>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <form v-if="mode === 'login'" class="form-grid" @submit.prevent="submitLogin">
        <label>
          Email ou pseudo
          <input v-model="loginForm.emailOrUsername" type="text" placeholder="jules" />
        </label>
        <label>
          Mot de passe
          <input v-model="loginForm.password" required autocomplete="current-password" type="password" placeholder="******" />
        </label>
        <button type="submit" class="button button-primary" :disabled="authStore.loading">
          {{ authStore.loading ? "Connexion..." : "Se connecter" }}
        </button>
      </form>

      <form v-else class="form-grid" @submit.prevent="submitRegister">
        <label>
          Nom d'utilisateur
          <input v-model="registerForm.username" type="text" placeholder="jules" />
        </label>
        <label>
          Email
          <input v-model="registerForm.email" type="email" placeholder="jules@mail.com" />
        </label>
        <label>
          Mot de passe
          <input v-model="registerForm.password" type="password" minlength="10" required autocomplete="new-password" placeholder="Au moins 10 caracteres" />
        </label>
        <button type="submit" class="button button-primary" :disabled="authStore.loading">
          {{ authStore.loading ? "Creation..." : "Creer mon compte" }}
        </button>
      </form>
    </div>
  </section>
</template>
