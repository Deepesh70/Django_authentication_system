<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismissToast } = useToast()
</script>


<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`, { leaving: toast.leaving }]"
    >
      <span class="toast-icon">
        {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ' }}
      </span>
      <span>{{ toast.message }}</span>
      <button class="toast-close" @click="dismissToast(toast.id)">×</button>
    </div>
  </div>
</template>


