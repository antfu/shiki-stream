import { createApp, h, Suspense } from 'vue'
import App from './App.vue'
import './style.css'

createApp({
  render() {
    return h(Suspense, null, {
      default() {
        return h(App)
      },
    })
  },
}).mount('#app')
