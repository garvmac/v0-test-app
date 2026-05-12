'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'

import { TaskTable } from '@/components/dashboard/task-table'
import { useTasks } from '@/hooks/use-tasks'
import { Task } from '@/lib/types'

interface DashboardContentProps {
  userEmail: string
  initialTasks: Task[]
}

export function DashboardContent({ userEmail, initialTasks }: DashboardContentProps) {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTasks(initialTasks)

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader userEmail={userEmail} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your tasks and stay productive</p>
        </div>
        <TaskTable
          tasks={tasks}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onRefresh={fetchTasks}
        />
      </main>
    </div>
  )
}
