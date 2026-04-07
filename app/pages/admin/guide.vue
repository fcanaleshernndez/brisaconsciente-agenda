<script setup>
definePageMeta({
  layout: false
})

import { marked } from 'marked'

const mdContent = ref('')

onMounted(async () => {
  const storedToken = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  
  if (!storedToken || !user) {
    navigateTo('/admin/login')
    return
  }

  try {
    const response = await fetch('/docs/guia-usuario.md')
    mdContent.value = marked.parse(await response.text())
  } catch (e) {
    mdContent.value = '<p>Error al cargar la guía</p>'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-sm p-8 guide-content">
        <div v-html="mdContent"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-content :deep(h1) {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  margin-top: 0;
}
.guide-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.guide-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.guide-content :deep(p) {
  color: #4b5563;
  line-height: 1.75;
  margin-bottom: 1rem;
}
.guide-content :deep(ul), .guide-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.guide-content :deep(li) {
  color: #4b5563;
  line-height: 1.75;
  margin-bottom: 0.5rem;
}
.guide-content :deep(ul li) {
  list-style-type: disc;
}
.guide-content :deep(ol li) {
  list-style-type: decimal;
}
.guide-content :deep(code) {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #be185d;
}
.guide-content :deep(pre) {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}
.guide-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #1f2937;
}
.guide-content :deep(a) {
  color: #0891b2;
  text-decoration: underline;
}
.guide-content :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}
.guide-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.guide-content :deep(th), .guide-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.guide-content :deep(th) {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}
.guide-content :deep(strong) {
  font-weight: 600;
  color: #111827;
}
</style>
