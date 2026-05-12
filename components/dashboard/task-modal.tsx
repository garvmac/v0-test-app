'use client'

import { Task, TaskStatus, TaskPriority } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Flag } from 'lucide-react'

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  if (!task) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">Task details</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex gap-3">
            <Badge variant="secondary" className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <Badge variant="secondary" className={priorityColors[task.priority]}>
              <Flag className="h-3 w-3 mr-1" />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
          </div>

          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{task.description}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span>{formatDate(task.due_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(task.created_at)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
