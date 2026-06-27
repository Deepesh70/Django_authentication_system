<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)
function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
}

function applyTheme(){
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark': 'light')
    localStorage.setItem('theme', isDark.value ? 'dark': 'light')

}
onMounted(() => {
    const saved = localStorage.getItem('theme')
    if(saved){
        isDark.value = saved === 'dark'
    }else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
})
</script>


<template>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'switch to Dark mode'">
        {{isDark ? '🌞': '🌙' }}
    </button>
</template>

 