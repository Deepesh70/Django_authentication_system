<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auths'
import ThemeToggle from '../components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  new_password: '',
  new_password_confirm: '',
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const passwordMismatch = computed(() => {
  return form.new_password_confirm && form.new_password !== form.new_password_confirm
})

async function handleSubmit() {
  if (form.new_password !== form.new_password_confirm) return

  const result = await authStore.confirmPasswordReset(
    route.params.uidb64,
    route.params.token,
    {
      new_password: form.new_password,
      new_password_confirm: form.new_password_confirm,
    }
  )

  if (result.success) {
    router.push('/login')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🔐</div>
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">Enter your new password below</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="new_password">New Password</label>
          <div class="form-input-wrapper">
            <input
              id="new_password"
              v-model="form.new_password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Min. 8 characters"
              required
            />
            <span class="form-input-icon">🔒</span>
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="new_password_confirm">Confirm New Password</label>
          <div class="form-input-wrapper">
            <input
              id="new_password_confirm"
              v-model="form.new_password_confirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              class="form-input"
              :class="{ error: passwordMismatch }"
              placeholder="Repeat your new password"
              required
            />
            <span class="form-input-icon">🔒</span>
            <button type="button" class="password-toggle" @click="showPasswordConfirm = !showPasswordConfirm">
              {{ showPasswordConfirm ? '🙈' : '👁' }}
            </button>
          </div>
          <p v-if="passwordMismatch" class="form-error">Passwords do not match</p>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading" class="spinner"></span>
          <span v-else>Reset Password</span>
        </button>
      </form>

      <p class="auth-footer">
        <router-link to="/login">← Back to login</router-link>
      </p>

      <div style="position: absolute; top: 1rem; right: 1rem;">
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>