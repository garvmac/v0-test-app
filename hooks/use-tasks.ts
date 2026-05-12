'use client'

import { Task, TaskStatus, TaskPriority } from '@/lib/types'
import { useState, useCallback } from 'react'

interface CreateTaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
}

interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
}

interface UseTasksReturn {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (input: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export function useTasks(initialTasks: Task[] = []): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch tasks')
      }
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create task')
      }
      const newTask = await res.json()
      setTasks((prev) => [newTask, ...prev])
      return newTask
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateTask = useCallback(async (input: UpdateTaskInput): Promise<Task> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update task')
      }
      const updatedTask = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
      return updatedTask
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete task')
      }
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setTasks,
  }
}
