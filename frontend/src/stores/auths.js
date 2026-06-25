import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { useToast } from '../composables/useToast'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userInitials = computed(() => {
    if (!user.value) return '?'
    const first = user.value.first_name?.[0] || ''
    const last = user.value.last_name?.[0] || ''
    return (first + last).toUpperCase() || user.value.email[0].toUpperCase()
  })

  const { showToast } = useToast()


  /**
   * Initialize auth state on app load.
   * Checks if tokens exist in localStorage and fetches user profile.
   */
  async function initAuth() {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      try {
        await fetchProfile()
      } catch {
        // Token is invalid/expired — interceptor will handle refresh
        // If refresh also fails, interceptor redirects to login
      }
    }
    isInitialized.value = true
  }

  /**
   * Register a new user.
   * Stores tokens and user data on success.
   */
  async function register(userData) {
    isLoading.value = true
    try {
      const response = await api.post('/register/', userData)
      const { tokens, user: userData2 } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      user.value = userData2

      showToast('Account created successfully! Check your email to verify.', 'success')
      return { success: true }
    } catch (error) {
      const errors = error.response?.data
      let message = 'Registration failed. Please try again.'

      if (errors) {
        // Extract first error message from DRF's error format
        const firstKey = Object.keys(errors)[0]
        const firstError = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]
        if (typeof firstError === 'string') message = firstError
      }

      showToast(message, 'error')
      return { success: false, errors: errors }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Log in with email and password.
   * Stores tokens and user data on success.
   */
  async function login(credentials) {
    isLoading.value = true
    try {
      const response = await api.post('/login/', credentials)
      const { tokens, user: userData } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      user.value = userData

      showToast('Welcome back!', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please check your credentials.'
      showToast(message, 'error')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Log out — blacklist the refresh token on the server,
   * then clear local state.
   */
  async function logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken })
      }
    } catch {
      // Even if the API call fails, we still clear local state
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      user.value = null
      showToast('Logged out successfully.', 'info')
    }
  }

  /**
   * Fetch the current user's profile from the server.
   */
  async function fetchProfile() {
    const response = await api.get('/profile/')
    user.value = response.data
  }

  /**
   * Update user profile (first_name, last_name).
   */
  async function updateProfile(data) {
    isLoading.value = true
    try {
      const response = await api.patch('/profile/', data)
      user.value = response.data
      showToast('Profile updated successfully.', 'success')
      return { success: true }
    } catch (error) {
      showToast('Failed to update profile.', 'error')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change password while logged in.
   */
  async function changePassword(data) {
    isLoading.value = true
    try {
      await api.post('/change-password/', data)
      showToast('Password changed successfully.', 'success')
      return { success: true }
    } catch (error) {
      const errors = error.response?.data
      let message = 'Failed to change password.'
      if (errors) {
        const firstKey = Object.keys(errors)[0]
        const firstError = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]
        if (typeof firstError === 'string') message = firstError
      }
      showToast(message, 'error')
      return { success: false, errors }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request a password reset email.
   */
  async function requestPasswordReset(email) {
    isLoading.value = true
    try {
      await api.post('/password-reset/', { email })
      showToast('If an account exists with this email, a reset link has been sent.', 'success')
      return { success: true }
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Confirm password reset with token from email.
   */
  async function confirmPasswordReset(uidb64, token, passwords) {
    isLoading.value = true
    try {
      await api.post(`/password-reset-confirm/${uidb64}/${token}/`, passwords)
      showToast('Password reset successful! You can now log in.', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Invalid or expired reset link.'
      showToast(message, 'error')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    userInitials,
    initAuth,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
  }
})