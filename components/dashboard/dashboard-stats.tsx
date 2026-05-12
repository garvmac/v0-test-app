import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Task } from '@/lib/types'
import { AlertTriangle, CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react'

interface DashboardStatsProps {
  tasks: Task[]
}

export function DashboardStats({ tasks }: DashboardStatsProps) {
  const totalTasks = tasks.length
  const todoTasks = tasks.filter(t => t.status === 'todo').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    return new Date(t.due_date) < new Date(new Date().toDateString())
  }).length

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-foreground',
      bgColor: 'bg-muted',
    },
    {
      title: 'To Do',
      value: todoTasks,
      icon: Circle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
