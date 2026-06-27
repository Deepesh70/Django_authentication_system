<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auths'
import ThemeToggle from '../components/ThemeToggle.vue'

const authStore = useAuthStore()
const email = ref('')
const emailSent = ref(false)

async function handleSubmit() {
  const result = await authStore.requestPasswordReset(email.value)
  if (result.success) {
    emailSent.value = true
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🔑</div>
        <h1 class="auth-title">Forgot password?</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
      </div>

      <form v-if="!emailSent" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <div class="form-input-wrapper">
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              required
            />
            <span class="form-input-icon">✉</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading" class="spinner"></span>
          <span v-else>Send Reset Link</span>
        </button>
      </form>

      <!-- Success State -->
      <div v-else class="text-center">
        <p style="font-size: 3rem; margin-bottom: 1rem;">📧</p>
        <p style="font-size: 0.9375rem; color: var(--color-text-primary); font-weight: 600; margin-bottom: 0.5rem;">
          Check your inbox
        </p>
        <p style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-bottom: 1.5rem;">
          If an account exists for <strong>{{ email }}</strong>, you'll receive a password reset link shortly.
        </p>
        <button class="btn btn-secondary" @click="emailSent = false" style="width: 100%;">
          Try another email
        </button>
      </div>

      <p class="auth-footer">
        <router-link to="/login">← Back to login</router-link>
      </p>

      <div style="position: absolute; top: 1rem; right: 1rem;">
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>
