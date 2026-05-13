'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskStatus, TaskPriority } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, PlayCircle, CheckCircle2, RotateCcw } from 'lucide-react'
import { TaskFormModal } from './task-form-modal'

interface TaskTableProps {
  tasks: Task[]
  onCreateTask: (input: {
    title: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    due_date?: string | null
  }) => Promise<Task>
  onUpdateTask: (input: { id: string } & Partial<{
    title: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    due_date?: string | null
  }>) => Promise<Task>
  onDeleteTask: (id: string) => Promise<void>
  onRefresh: () => Promise<void>
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-400',
}

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'completed', title: 'Completed', color: 'text-emerald-700 dark:text-emerald-400' },
  { status: 'in_progress', title: 'In Progress', color: 'text-amber-700 dark:text-amber-400' },
  { status: 'todo', title: 'To Do', color: 'text-blue-700 dark:text-blue-400' },
]

export function TaskTable({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: TaskTableProps) {
  const router = useRouter()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const nextStatus: Record<TaskStatus, { status: TaskStatus; label: string; icon: React.ReactNode; className: string }> = {
    todo: {
      status: 'in_progress',
      label: 'Start',
      icon: <PlayCircle className="h-3.5 w-3.5" />,
      className: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:border-amber-800',
    },
    in_progress: {
      status: 'completed',
      label: 'Mark Complete',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:border-emerald-800',
    },
    completed: {
      status: 'in_progress',
      label: 'Reopen',
      icon: <RotateCcw className="h-3.5 w-3.5" />,
      className: 'text-muted-foreground bg-muted hover:bg-muted/80 border border-border',
    },
  }

  const handleAdvanceStatus = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    await onUpdateTask({ id: task.id, status: nextStatus[task.status].status })
  }

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed') return false
    return new Date(task.due_date) < new Date(new Date().toDateString())
  }

  const handleAddTask = () => {
    setIsFormModalOpen(true)
  }

  const handleTaskSaved = async () => {
    setIsFormModalOpen(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.status)
            return (
              <Card key={col.status} className="flex flex-col">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className={`text-sm font-semibold ${col.color}`}>
                        {col.title}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground font-medium">
                        {columnTasks.length}
                      </span>
                    </div>
                    {col.status === 'todo' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddTask}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-1.5 pt-0 px-3 pb-3">
                  {columnTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No tasks
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-sm border bg-card p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push(`/dashboard/task/${task.id}`)}
                      >
                        <h3 className="font-medium text-sm leading-snug">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          {task.due_date && (
                            <span className={`text-xs ${isOverdue(task) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                              {formatDate(task.due_date)}
                              {isOverdue(task) && ' (Overdue)'}
                            </span>
                          )}
                        </div>
                        <button
                          className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors ${nextStatus[task.status].className}`}
                          onClick={(e) => handleAdvanceStatus(e, task)}
                        >
                          {nextStatus[task.status].icon}
                          {nextStatus[task.status].label}
                        </button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <TaskFormModal
        task={null}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onCreateTask={onCreateTask}
        onUpdateTask={onUpdateTask}
        onSaved={handleTaskSaved}
      />
    </>
  )
}
