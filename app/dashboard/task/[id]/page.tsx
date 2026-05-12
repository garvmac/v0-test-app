import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TaskDetail } from '@/components/dashboard/task-detail'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!task) {
    redirect('/dashboard')
  }

  return <TaskDetail initialTask={task} />
}
