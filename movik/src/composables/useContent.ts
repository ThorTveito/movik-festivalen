import { supabase } from '@/config/supabase'

export interface ContentSection {
  key: string
  title: string
  body: string
}

export async function fetchContent(): Promise<ContentSection[]> {
  const { data, error } = await supabase
    .from('content')
    .select('key, title, body')
    .order('key')

  if (error) throw error
  return data ?? []
}

export async function updateSection(key: string, title: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('content')
    .update({ title, body })
    .eq('key', key)

  if (error) throw error
}
