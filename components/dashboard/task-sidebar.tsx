'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskSidebarProps {
  tasks: Task[]
  currentTaskId: string
}

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const priorityColor: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

export function TaskSidebar({ tasks, currentTaskId }: TaskSidebarProps) {
  const router = useRouter()
  const [statusIndex, setStatusIndex] = useState(() => {
    const currentTask = tasks.find((t) => t.id === currentTaskId)
    return currentTask ? statuses.findIndex((s) => s.value === currentTask.status) : 0
  })

  const currentStatus = statuses[statusIndex]
  const filteredTasks = tasks.filter((t) => t.status === currentStatus.value)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={statusIndex === 0}
          onClick={() => setStatusIndex((i) => i - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{currentStatus.label}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={statusIndex === statuses.length - 1}
          onClick={() => setStatusIndex((i) => i + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {filteredTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No tasks</p>
        ) : (
          filteredTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => router.push(`/dashboard/task/${task.id}`)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                task.id === currentTaskId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full shrink-0', priorityColor[task.priority])} />
                <span className="truncate">{task.title}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
