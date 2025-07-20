import { createResource } from 'frappe-ui'
import { computed, reactive } from 'vue'
import router from '@/router'
import { session } from './session'

let usersByName = reactive({})
export let users = createResource({
  url: 'frappe.auth.get_logged_user',
  cache: 'Users',
  initialData: [],
  transform(userData) {
    const user = userData || { name: 'Guest', email: 'guest@example.com', full_name: 'Guest', enabled: 1 }
    user.isGuest = user.name === 'Guest'
    user.isNotGuest = !user.isGuest
    user.isDisabled = user.enabled === 0
    usersByName[user.name] = user
    return [user]
  },
  onError(error) {
    if (error && error.exc_type === 'AuthenticationError') {
      router.push('/login')
    }
  },
})

export function getUser(email) {
  if (!email || email === 'sessionUser') {
    email = session.user
  }
  if (!usersByName[email]) {
    usersByName[email] = {
      name: email,
      email: email,
      full_name: email.split('@')[0],
      user_image: null,
      role: null,
    }
  }
  return usersByName[email]
}

export let activeUsers = computed(() => {
  return users.data.filter((user) => user.enabled)
})