<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300"
  >
    <router-view />
    <Toasts />
  </div>
</template>
<script setup>
import { Toasts } from 'frappe-ui'
</script>
