<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()

const isVerifying = ref(true)
const isVerified = ref(false)
const errorMessage = ref('The verification link is invalid or has expired.')

onMounted(async () => {
  try {
    const { uidb64, token } = route.params
    await api.get(`/verify-email/${uidb64}/${token}/`)
    isVerified.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'The verification link is invalid or has expired.'
  } finally {
    isVerifying.value = false
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card text-center">
      <!-- Loading State -->
      <div v-if="isVerifying">
        <div class="auth-logo">⏳</div>
        <h1 class="auth-title">Verifying your email...</h1>
        <p class="auth-subtitle">Please wait a moment</p>
        <div style="margin-top: 1.5rem; display: flex; justify-content: center;">
          <div class="spinner" style="border-color: var(--color-border); border-top-color: var(--color-accent); width: 32px; height: 32px;"></div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="isVerified">
        <div class="auth-logo" style="background: linear-gradient(135deg, #22c55e, #16a34a);">✓</div>
        <h1 class="auth-title">Email verified!</h1>
        <p class="auth-subtitle" style="margin-bottom: 1.5rem;">Your account is now fully activated</p>
        <router-link to="/dashboard" class="btn btn-primary" style="text-decoration: none;">
          Go to Dashboard
        </router-link>
      </div>

      <!-- Error State -->
      <div v-else>
        <div class="auth-logo" style="background: linear-gradient(135deg, #ef4444, #dc2626);">✕</div>
        <h1 class="auth-title">Verification failed</h1>
        <p class="auth-subtitle" style="margin-bottom: 1.5rem;">{{ errorMessage }}</p>
        <router-link to="/login" class="btn btn-primary" style="text-decoration: none;">
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>
