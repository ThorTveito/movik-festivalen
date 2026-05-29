import { ref, readonly } from 'vue'
import { supabase } from '@/config/supabase'

const currentUser = ref<string | null>(localStorage.getItem('auth_user'))

export function useAuth() {
  async function signIn(username: string, password: string): Promise<void> {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !data) throw new Error('Feil brukernavn eller passord.')

    currentUser.value = data.username
    localStorage.setItem('auth_user', data.username)
  }

  function signOut() {
    currentUser.value = null
    localStorage.removeItem('auth_user')
  }

  return {
    currentUser: readonly(currentUser),
    signIn,
    signOut,
  }
}
