<script setup>
import { ref, computed, watch } from 'vue'
import Icon from './components/icon.vue'
import catalog from './catalog.json'

const styles = new Set(catalog.map(icon => icon.style))
const categories = new Set(catalog.map(icon => icon.category))

const currentStyle = ref('')
const currentCategory = ref('')
const search = ref('')
const batch = ref(1)

window.addEventListener('scroll', e => {
  if( document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight ) {
    batch.value = batch.value + 1
  }
})

watch(() => [currentStyle.value, currentCategory.value, search.value], () => {
  window.scrollTo(0, 0)
  batch.value = 1
})

const icons = computed(() => {
  return catalog.
    filter((icon) => (
      (!currentStyle.value || icon.style === currentStyle.value)
      && (
        !search.value || (
          new RegExp(search.value).test(icon.name)
          || icon.tags.some((tag) => new RegExp(search.value).test(tag))
        )
      ) && (
        !currentCategory.value || (
          icon.category === currentCategory.value
        )
      )
    ))
    .slice(0, 30 + (30 * batch.value))
})

const clear = () => {
  currentStyle.value = ''
  currentCategory.value = ''
  search.value = ''
}
</script>

<template>
  <div class="topstrip">
    <div class="logo">
      Waltz Icons
    </div>
    <input v-model="search"/>
    <div class="styles">
      <select v-model="currentStyle">
        <option value="">
          All
        </option>
        <option
          v-for="style in styles"
          :key="`style-${style}`"
          :value="style"
        >
          {{ style }}
        </option>
      </select>
    </div>

    <div class="categories">
      <select v-model="currentCategory">
        <option value="">
          All
        </option>
        <option
          v-for="category in categories"
          :key="`category-${category}`"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <button @click="clear">clear</button>
    <a href="https://github.com/sonata-api/waltz-icons" target="_blank">
      <icon name="github" width="32" height="32"></icon>
    </a>
  </div>

  <div class="icons-grid">
    <div
      v-for="icon in icons"
      :key="`${icon.style}-${icon.name}`"
      class="icon-container"
    >
      <icon
        v-bind="{
          name: icon.name,
          variant: icon.style
        }"
        fill="blue"
      ></icon>
      <div class="icon-info">
        <div>{{ icon.name }}</div>
        <div>{{ icon.style }}</div>
      </div>
    </div>
  </div>
</template>

<style src="./main.css"></style>
