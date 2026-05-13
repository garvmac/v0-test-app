'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskStatus, TaskPriority } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { TaskComments } from './task-comments'
import { TaskActivityLog } from './task-activity'
import { TaskSidebar } from './task-sidebar'

interface TaskDetailProps {
  initialTask: Task
  allTasks: Task[]
}

export function TaskDetail({ initialTask, allTasks }: TaskDetailProps) {
  const router = useRouter()
  const [task, setTask] = useState(initialTask)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [activityKey, setActivityKey] = useState(0)

  const logActivity = async (changes: { field: string; old_value: string | null; new_value: string | null }[]) => {
    await Promise.all(
      changes.map((change) =>
        fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_id: task.id, ...change }),
        })
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const newDueDate = dueDate ? new Date(dueDate).toISOString() : null

      const changes: { field: string; old_value: string | null; new_value: string | null }[] = []
      if (title !== task.title) changes.push({ field: 'title', old_value: task.title, new_value: title })
      if ((description || null) !== task.description) changes.push({ field: 'description', old_value: task.description, new_value: description || null })
      if (status !== task.status) changes.push({ field: 'status', old_value: task.status, new_value: status })
      if (priority !== task.priority) changes.push({ field: 'priority', old_value: task.priority, new_value: priority })
      const oldDueDateStr = task.due_date ? task.due_date.split('T')[0] : null
      const newDueDateStr = dueDate || null
      if (newDueDateStr !== oldDueDateStr) changes.push({ field: 'due_date', old_value: task.due_date, new_value: newDueDate })

      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          title,
          description: description || null,
          status,
          priority,
          due_date: newDueDate,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update task')
      }
      const updatedTask = await res.json()

      if (changes.length > 0) {
        await logActivity(changes)
        setTask(updatedTask)
        setActivityKey((k) => k + 1)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete task')
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-4">
        <Card className="h-fit">
          <CardContent className="pt-6">
            <TaskSidebar tasks={allTasks} currentTaskId={task.id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Button variant="ghost" size="icon" className="w-fit -ml-2 -mt-2 mb-2" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description (optional)"
                rows={4}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="invisible">Delete</Label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="h-9 w-9 p-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete task?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{task.title}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            <TaskComments taskId={task.id} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardContent className="pt-6">
            <TaskActivityLog key={activityKey} taskId={task.id} />
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
