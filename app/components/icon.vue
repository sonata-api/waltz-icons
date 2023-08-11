<template>
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
  >
    <use :href="`assets/icons.svg#${variant}:${name}`"></use>
  </svg>
</template>

<script setup>
defineProps({
  name: String,
  variant: {
    type: String,
    default: 'line'
  }
})
</script>
