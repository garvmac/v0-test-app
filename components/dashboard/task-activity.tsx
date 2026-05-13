'use client'

import { useState, useEffect } from 'react'
import { TaskActivity } from '@/lib/types'
import { History } from 'lucide-react'

interface TaskActivityLogProps {
  taskId: string
}

const fieldLabels: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  status: 'Status',
  priority: 'Priority',
  due_date: 'Due Date',
}

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
}

function formatValue(field: string, value: string | null): string {
  if (!value) return 'none'
  if (field === 'status') return statusLabels[value] || value
  if (field === 'due_date') {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (field === 'description' && value.length > 30) return value.slice(0, 30) + '...'
  return value
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskActivityLog({ taskId }: TaskActivityLogProps) {
  const [activity, setActivity] = useState<TaskActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [taskId])

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/activity?task_id=${taskId}`)
      if (!res.ok) throw new Error('Failed to fetch activity')
      const data = await res.json()
      setActivity(data)
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        Activity
      </h3>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : activity.length === 0 ? (
        <p className="text-xs text-muted-foreground">No changes yet.</p>
      ) : (
        <div className="space-y-2">
          {activity.map((item) => (
            <div key={item.id} className="text-xs border-l-2 border-muted-foreground/20 pl-3 py-1">
              <p className="text-muted-foreground">
                Changed <span className="font-medium text-foreground">{fieldLabels[item.field] || item.field}</span>
              </p>
              <p className="text-muted-foreground">
                {formatValue(item.field, item.old_value)} &rarr; {formatValue(item.field, item.new_value)}
              </p>
              <p className="text-muted-foreground/60 mt-0.5">{formatDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
