<script setup lang="ts">
import { readPreference } from '../lib/preferences'

const isEnglish = readPreference('site_lang') === 'en'
document.title = isEnglish ? 'Page not found — Félix Saucedo' : 'Página no encontrada — Félix Saucedo'
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center max-w-md">
      <p class="text-sky-500 font-mono text-sm">404</p>
      <h1 class="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {{ isEnglish ? 'Page not found' : 'Página no encontrada' }}
      </h1>
      <p class="mt-4 text-slate-600 dark:text-slate-400">
        {{ isEnglish ? 'The page you requested does not exist.' : 'La página que buscas no existe.' }}
      </p>
      <a href="/" class="inline-block mt-8 px-6 py-3 rounded-full bg-sky-500 text-white font-semibold hover:bg-sky-600">
        {{ isEnglish ? 'Back to home' : 'Volver al inicio' }}
      </a>
    </div>
  </main>
</template>
