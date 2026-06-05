import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vAutoResize } from './composables/useAutoResize'
import './assets/styles/base.css'
import './assets/styles/typography.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('auto-resize', vAutoResize)
app.mount('#app')
