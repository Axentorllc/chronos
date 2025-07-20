import { toast as frappeToast } from 'frappe-ui'

// Create a simplified toast wrapper that uses frappe-ui's toast properly
export const toast = {
  success: (message, duration = 3) => {
    return frappeToast({
      title: message,
      icon: 'check',
      iconClasses: 'text-green-500',
      timeout: duration,
      position: 'top-center'
    })
  },

  error: (message, duration = 5) => {
    return frappeToast({
      title: message,
      icon: 'alert-circle',
      iconClasses: 'text-red-500',
      timeout: duration,
      position: 'top-center'
    })
  },

  warning: (message, duration = 4) => {
    return frappeToast({
      title: message,
      icon: 'alert-triangle',
      iconClasses: 'text-yellow-500',
      timeout: duration,
      position: 'top-center'
    })
  },

  info: (message, duration = 3) => {
    return frappeToast({
      title: message,
      icon: 'info',
      iconClasses: 'text-blue-500',
      timeout: duration,
      position: 'top-center'
    })
  },

  // Create persistent toast (must be manually dismissed)
  persistent: (message, type = 'info') => {
    const iconMap = {
      info: { icon: 'info', iconClasses: 'text-blue-500' },
      success: { icon: 'check', iconClasses: 'text-green-500' },
      error: { icon: 'alert-circle', iconClasses: 'text-red-500' },
      warning: { icon: 'alert-triangle', iconClasses: 'text-yellow-500' }
    }
    
    return frappeToast({
      title: message,
      ...iconMap[type],
      timeout: 0,
      position: 'top-center'
    })
  }
}

// Also export the useToast function for compatibility
export function useToast() {
  return toast
}
