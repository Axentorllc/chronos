import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './index.css'

// Import frappe-ui components and utilities
import {
  Button,
  Input,
  FormControl,
  TextInput,
  Textarea,
  Select,
  Autocomplete,
  DatePicker,
  Checkbox,
  Switch,
  Badge,
  Avatar,
  Tooltip,
  Popover,
  Dropdown,
  Dialog,
  Toast,
  LoadingIndicator,
  Progress,
  Tabs,
  Card,
  ListItem,
  ErrorMessage,
  FeatherIcon,
  FileUploader,
  Link,
  Breadcrumbs,
  ListView,
  ListHeader,
  ListHeaderItem,
  ListEmptyState,
  ListRows,
  ListRow,
  ListRowItem,
  setConfig,
  frappeRequest,
  call
} from 'frappe-ui'

// Import date utilities
import { dayjs } from './utils/dateUtils'

// Create Vue app
const app = createApp(App)

// Configure frappe-ui
setConfig('resourceFetcher', frappeRequest)

// Register frappe-ui components globally
const components = {
  Button,
  Input,
  FormControl,
  TextInput,
  Textarea,
  Select,
  Autocomplete,
  DatePicker,
  Checkbox,
  Switch,
  Badge,
  Avatar,
  Tooltip,
  Popover,
  Dropdown,
  Dialog,
  Toast,
  LoadingIndicator,
  Progress,
  Tabs,
  Card,
  ListItem,
  ErrorMessage,
  FeatherIcon,
  FileUploader,
  Link,
  Breadcrumbs,
  ListView,
  ListHeader,
  ListHeaderItem,
  ListEmptyState,
  ListRows,
  ListRow,
  ListRowItem
}

// Register all components
Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

// Global properties
app.config.globalProperties.$dayjs = dayjs
app.config.globalProperties.$call = call

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
}

// Global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Global warning:', msg)
  console.warn('Component instance:', instance)
  console.warn('Trace:', trace)
}

// Performance monitoring (development only)
if (import.meta.env.DEV) {
  app.config.performance = true
}

// Use router
app.use(router)

// Mount the app
app.mount('#app')

// Export app instance for potential use in other modules
export default app

// Export utilities for use in components
export { call, dayjs }

// Global CSS custom properties for theming
const setThemeProperties = () => {
  const root = document.documentElement
  
  // Primary colors
  root.style.setProperty('--primary-50', '#eff6ff')
  root.style.setProperty('--primary-100', '#dbeafe')
  root.style.setProperty('--primary-200', '#bfdbfe')
  root.style.setProperty('--primary-300', '#93c5fd')
  root.style.setProperty('--primary-400', '#60a5fa')
  root.style.setProperty('--primary-500', '#3b82f6')
  root.style.setProperty('--primary-600', '#2563eb')
  root.style.setProperty('--primary-700', '#1d4ed8')
  root.style.setProperty('--primary-800', '#1e40af')
  root.style.setProperty('--primary-900', '#1e3a8a')
  
  // Gray colors
  root.style.setProperty('--gray-50', '#f9fafb')
  root.style.setProperty('--gray-100', '#f3f4f6')
  root.style.setProperty('--gray-200', '#e5e7eb')
  root.style.setProperty('--gray-300', '#d1d5db')
  root.style.setProperty('--gray-400', '#9ca3af')
  root.style.setProperty('--gray-500', '#6b7280')
  root.style.setProperty('--gray-600', '#4b5563')
  root.style.setProperty('--gray-700', '#374151')
  root.style.setProperty('--gray-800', '#1f2937')
  root.style.setProperty('--gray-900', '#111827')
  
  // Success colors
  root.style.setProperty('--success-50', '#ecfdf5')
  root.style.setProperty('--success-100', '#d1fae5')
  root.style.setProperty('--success-500', '#10b981')
  root.style.setProperty('--success-600', '#059669')
  
  // Warning colors
  root.style.setProperty('--warning-50', '#fffbeb')
  root.style.setProperty('--warning-100', '#fef3c7')
  root.style.setProperty('--warning-500', '#f59e0b')
  root.style.setProperty('--warning-600', '#d97706')
  
  // Error colors
  root.style.setProperty('--error-50', '#fef2f2')
  root.style.setProperty('--error-100', '#fee2e2')
  root.style.setProperty('--error-500', '#ef4444')
  root.style.setProperty('--error-600', '#dc2626')
  
  // Border radius
  root.style.setProperty('--radius-sm', '0.25rem')
  root.style.setProperty('--radius-md', '0.375rem')
  root.style.setProperty('--radius-lg', '0.5rem')
  root.style.setProperty('--radius-xl', '0.75rem')
  
  // Shadows
  root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)')
  root.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)')
}

// Apply theme properties
setThemeProperties()

// Dark mode detection and handling
const initializeDarkMode = () => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('darkMode')) {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })
}

// Initialize dark mode
initializeDarkMode()

// Utility function to toggle dark mode
window.toggleDarkMode = () => {
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  } else {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  }
}

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K for global search (if implemented)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    // Trigger global search
    console.log('Global search triggered')
  }
  
  // Ctrl/Cmd + D for dark mode toggle
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault()
    window.toggleDarkMode()
  }
  
  // Escape key to close modals/dialogs
  if (e.key === 'Escape') {
    // This will be handled by individual components
    document.dispatchEvent(new CustomEvent('escape-pressed'))
  }
})

// Global click outside handler for dropdowns/popovers
document.addEventListener('click', (e) => {
  // This will be used by components that need click-outside functionality
  document.dispatchEvent(new CustomEvent('click-outside', { detail: e.target }))
})

// Resize handler for responsive components
let resizeTimeout
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    document.dispatchEvent(new CustomEvent('window-resized', {
      detail: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }))
  }, 100)
})

// Console welcome message
if (import.meta.env.DEV) {
  console.log(
    '%c🚀 Chronos App %c- Enhanced with Frappe UI',
    'color: #3b82f6; font-weight: bold; font-size: 16px;',
    'color: #6b7280; font-size: 14px;'
  )
  console.log('Available global utilities:', {
    $dayjs: dayjs,
    $call: call,
    toggleDarkMode: window.toggleDarkMode
  })
}
