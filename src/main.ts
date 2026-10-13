/**
 * Félix Saucedo — Senior Software Engineer & Technical Lead
 * Architecture & High-Throughput Core Engineering
 * GitHub: [https://github.com/FelixSaucedo](https://github.com/FelixSaucedo)
 * Site: [felixsaucedo.com](https://felixsaucedo.com/)
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import NotFound from './components/NotFound.vue'

const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html'
if (!isHome) {
  const robots = document.querySelector('meta[name="robots"]')
  robots?.setAttribute('content', 'noindex, nofollow')
}
createApp(isHome ? App : NotFound).mount('#app')
