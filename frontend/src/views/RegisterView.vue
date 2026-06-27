<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auths'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
})

const errors = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const passwordStrength = ref('')

/**
 * Password strength checker.
 * Evaluates: length, uppercase, lowercase, numbers, special chars.
 */
function checkPasswordStrength() {
  const password = form.password
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) passwordStrength.value = 'weak'
  else if (score <= 3) passwordStrength.value = 'fair'
  else if (score <= 4) passwordStrength.value = 'good'
  else passwordStrength.value = 'strong'
}

function validate() {
  let isValid = true
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!form.first_name.trim()) {
    errors.first_name = 'First name is required'
    isValid = false
  }
  if (!form.last_name.trim()) {
    errors.last_name = 'Last name is required'
    isValid = false
  }
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  }
  if (form.password !== form.password_confirm) {
    errors.password_confirm = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

async function handleRegister() {
  if (!validate()) return

  const result = await authStore.register({
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    password: form.password,
    password_confirm: form.password_confirm,
  })

  if (result.success) {
    router.push('/dashboard')
  } else if (result.errors) {
    // Map server errors to form fields
    Object.keys(result.errors).forEach((key) => {
      if (errors.hasOwnProperty(key)) {
        errors[key] = Array.isArray(result.errors[key])
          ? result.errors[key][0]
          : result.errors[key]
      }
    })
  }
}
</script>


<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">✨</div>
        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start your journey with us today</p>
      </div>

      <form @submit.prevent="handleRegister">
        <!-- Name Fields (side by side) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label" for="first_name">First Name</label>
            <div class="form-input-wrapper">
              <input
                id="first_name"
                v-model="form.first_name"
                type="text"
                class="form-input"
                :class="{ error: errors.first_name }"
                placeholder="John"
                required
              />
              <span class="form-input-icon">👤</span>
            </div>
            <p v-if="errors.first_name" class="form-error">{{ errors.first_name }}</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="last_name">Last Name</label>
            <div class="form-input-wrapper">
              <input
                id="last_name"
                v-model="form.last_name"
                type="text"
                class="form-input"
                :class="{ error: errors.last_name }"
                placeholder="Doe"
                required
              />
              <span class="form-input-icon">👤</span>
            </div>
            <p v-if="errors.last_name" class="form-error">{{ errors.last_name }}</p>
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <div class="form-input-wrapper">
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="you@example.com"
              required
            />
            <span class="form-input-icon">✉</span>
          </div>
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div class="form-input-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Min. 8 characters"
              required
              @input="checkPasswordStrength"
            />
            <span class="form-input-icon">🔒</span>
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>

          <!-- Password Strength Meter -->
          <div v-if="form.password" class="password-strength">
            <div class="strength-bar">
              <div :class="['strength-fill', passwordStrength]"></div>
            </div>
            <span :class="['strength-text', passwordStrength]">
              {{ passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'fair' ? 'Fair' : passwordStrength === 'good' ? 'Good' : 'Strong' }}
            </span>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label class="form-label" for="password_confirm">Confirm Password</label>
          <div class="form-input-wrapper">
            <input
              id="password_confirm"
              v-model="form.password_confirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              class="form-input"
              :class="{ error: errors.password_confirm }"
              placeholder="Repeat your password"
              required
            />
            <span class="form-input-icon">🔒</span>
            <button
              type="button"
              class="password-toggle"
              @click="showPasswordConfirm = !showPasswordConfirm"
            >
              {{ showPasswordConfirm ? '🙈' : '👁' }}
            </button>
          </div>
          <p v-if="errors.password_confirm" class="form-error">{{ errors.password_confirm }}</p>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>

      <div style="position: absolute; top: 1rem; right: 1rem;">
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>
