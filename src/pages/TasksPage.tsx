import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, GripVertical, Trash2, Save, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

type Column = 'todo' | 'in_progress' | 'blocked' | 'done'

interface Task {
  id: string
  text: string
  column: Column
}

const columns: { id: Column; label: string; color: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-surface-300', accent: 'bg-surface-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-brand-400', accent: 'bg-brand-500' },
  { id: 'blocked', label: 'Blocked', color: 'border-red-300', accent: 'bg-red-500' },
  { id: 'done', label: 'Done', color: 'border-emerald-400', accent: 'bg-emerald-500' },
]

function parseTasks(md: string): Task[] {
  const tasks: Task[] = []
  let currentColumn: Column = 'todo'
  const columnMap: Record<string, Column> = {
    'to do': 'todo',
    'in progress': 'in_progress',
    'blocked': 'blocked',
    'done': 'done',
  }

  for (const line of md.split('\n')) {
    const heading = line.match(/^##\s+(.+)/)
    if (heading) {
      const key = heading[1].trim().toLowerCase()
      if (columnMap[key]) currentColumn = columnMap[key]
      continue
    }
    const item = line.match(/^-\s+(.+)/)
    if (item && item[1].trim()) {
      tasks.push({
        id: crypto.randomUUID(),
        text: item[1].trim(),
        column: currentColumn,
      })
    }
  }
  return tasks
}

function serializeTasks(tasks: Task[]): string {
  const lines = ['# Tasks', '', '> Your daily scratchpad. Track what you\'re working on today, what\'s next, and what\'s done.', '> Drag tasks between columns in the Control Center, or edit this file directly.', '']
  for (const col of columns) {
    lines.push(`## ${col.label}`, '')
    const colTasks = tasks.filter(t => t.column === col.id)
    if (colTasks.length === 0) {
      lines.push('- ', '')
    } else {
      for (const t of colTasks) lines.push(`- ${t.text}`)
      lines.push('')
    }
  }
  return lines.join('\n')
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<Column | null>(null)
  const [newTaskCol, setNewTaskCol] = useState<Column | null>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/context')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data['tasks.md']) setTasks(parseTasks(data['tasks.md']))
      })
      .catch(() => {})
  }, [])

  const save = useCallback(async (updated: Task[]) => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/context/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'tasks.md', content: serializeTasks(updated) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const addTask = (column: Column, text: string) => {
    if (!text.trim()) return
    const updated = [...tasks, { id: crypto.randomUUID(), text: text.trim(), column }]
    setTasks(updated)
    setNewTaskCol(null)
    save(updated)
  }

  const removeTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    save(updated)
  }

  const moveTask = (id: string, to: Column) => {
    const updated = tasks.map(t => t.id === id ? { ...t, column: to } : t)
    setTasks(updated)
    save(updated)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, col: Column) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(col)
  }

  const handleDrop = (e: React.DragEvent, col: Column) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) moveTask(id, col)
    setDraggedId(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDropTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Tasks</h1>
          <p className="text-sm text-surface-400 mt-0.5">Your daily scratchpad. Drag tasks between columns.</p>
        </div>
        <div className="flex items-center gap-2">
          {(saving || saved) && (
            <span className={cn('flex items-center gap-1 text-xs font-medium', saved ? 'text-emerald-600' : 'text-surface-400')}>
              {saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3 animate-pulse" />}
              {saved ? 'Saved' : 'Saving...'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.column === col.id)
          const isDropping = dropTarget === col.id && draggedId && tasks.find(t => t.id === draggedId)?.column !== col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                'rounded-2xl border-2 p-3 transition-all min-h-[300px]',
                isDropping ? 'border-brand-300 bg-brand-50/50 ring-2 ring-brand-200' : 'border-surface-200 bg-surface-50/50',
              )}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2.5 w-2.5 rounded-full', col.accent)} />
                  <h2 className="text-sm font-semibold text-surface-700">{col.label}</h2>
                  <span className="text-xs text-surface-400 font-mono bg-surface-100 rounded-full px-1.5 py-0.5">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => { setNewTaskCol(col.id); setTimeout(() => newInputRef.current?.focus(), 50) }}
                  className="p-1 rounded-lg text-surface-300 hover:text-brand-500 hover:bg-brand-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'flex items-start gap-2 bg-white rounded-xl border border-surface-200 px-3 py-2.5 group cursor-grab active:cursor-grabbing transition-all hover:border-brand-200 hover:shadow-sm',
                      draggedId === task.id && 'opacity-40 scale-95',
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-surface-200 group-hover:text-surface-400 shrink-0 mt-0.5" />
                    <span className={cn('text-sm flex-1', col.id === 'done' ? 'text-surface-400 line-through' : col.id === 'blocked' ? 'text-red-700' : 'text-surface-800')}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="p-0.5 rounded text-surface-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {newTaskCol === col.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const input = newInputRef.current
                      if (input) { addTask(col.id, input.value); input.value = '' }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={newInputRef}
                      type="text"
                      placeholder="What needs to happen?"
                      onBlur={(e) => { if (!e.target.value.trim()) setNewTaskCol(null) }}
                      onKeyDown={(e) => { if (e.key === 'Escape') setNewTaskCol(null) }}
                      className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm placeholder:text-surface-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none"
                    />
                  </form>
                )}

                {colTasks.length === 0 && newTaskCol !== col.id && (
                  <div className="text-center py-8 text-xs text-surface-300 border border-dashed border-surface-200 rounded-xl">
                    {col.id === 'todo' ? 'What do you need to do today?' : col.id === 'in_progress' ? 'Drag tasks here when you start' : col.id === 'blocked' ? 'Waiting on someone or something?' : 'Drag tasks here when done'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
