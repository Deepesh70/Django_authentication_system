<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auths'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  new_password_confirm: '',
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

async function handleChangePassword() {
  const result = await authStore.changePassword({
    old_password: passwordForm.old_password,
    new_password: passwordForm.new_password,
    new_password_confirm: passwordForm.new_password_confirm,
  })

  if (result.success) {
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.new_password_confirm = ''
  }
}
</script>

<template>
  <div class="dashboard">
    <!-- Navigation Bar -->
    <nav class="dashboard-nav">
      <div class="nav-brand">
        <div class="nav-brand-icon">🛡</div>
        <span>AuthApp</span>
      </div>
      <div class="nav-actions">
        <ThemeToggle />
        <button class="btn btn-secondary" @click="handleLogout" style="padding: 0.5rem 1rem; font-size: 0.8125rem;">
          Sign Out
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="dashboard-content">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--color-text-primary);">
        Your Profile
      </h2>

      <!-- Profile Card -->
      <div class="profile-card" v-if="authStore.user">
        <div class="profile-avatar">
          {{ authStore.userInitials }}
        </div>
        <h3 class="profile-name">{{ authStore.user.full_name || 'No name set' }}</h3>
        <p class="profile-email">{{ authStore.user.email }}</p>

        <!-- Verification Badge -->
        <span :class="['profile-badge', authStore.user.is_email_verified ? 'badge-verified' : 'badge-unverified']">
          {{ authStore.user.is_email_verified ? '✓ Email Verified' : '⚠ Email Not Verified' }}
        </span>

        <!-- Profile Details -->
        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">First Name</span>
            <span class="detail-value">{{ authStore.user.first_name || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Name</span>
            <span class="detail-value">{{ authStore.user.last_name || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Member Since</span>
            <span class="detail-value">{{ formatDate(authStore.user.date_joined) }}</span>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="profile-card" style="margin-top: 1.5rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--color-text-primary);">
          Change Password
        </h3>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label class="form-label" for="old_password">Current Password</label>
            <div class="form-input-wrapper">
              <input
                id="old_password"
                v-model="passwordForm.old_password"
                type="password"
                class="form-input"
                placeholder="Enter current password"
                required
              />
              <span class="form-input-icon">🔒</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="new_password">New Password</label>
            <div class="form-input-wrapper">
              <input
                id="new_password"
                v-model="passwordForm.new_password"
                type="password"
                class="form-input"
                placeholder="Min. 8 characters"
                required
              />
              <span class="form-input-icon">🔒</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="new_password_confirm">Confirm New Password</label>
            <div class="form-input-wrapper">
              <input
                id="new_password_confirm"
                v-model="passwordForm.new_password_confirm"
                type="password"
                class="form-input"
                placeholder="Repeat new password"
                required
              />
              <span class="form-input-icon">🔒</span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading" style="max-width: 200px;">
            <span v-if="authStore.isLoading" class="spinner"></span>
            <span v-else>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
