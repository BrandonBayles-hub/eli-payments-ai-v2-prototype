import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import PrototypesPage from '@/pages/PrototypesPage'
import PrototypeView from '@/pages/PrototypeView'
import ContextPage from '@/pages/ContextPage'
import SkillsPage from '@/pages/SkillsPage'
import TasksPage from '@/pages/TasksPage'
import { discoverPrototypes, type PrototypeEntry } from '@/lib/prototype-discovery'
import { parseMe, type MeContext } from '@/lib/context-parser'

interface GitInfo {
  branch: string
  dirty: boolean
  changedFiles: number
}

interface RepoSyncInfo {
  exists: boolean
  behind: number
  current: string
  remote: string
  path: string
}

interface WorkspaceSyncInfo {
  hasUpstream: boolean
  behind: number
}

export interface SyncStatus {
  'product-spec-kit': RepoSyncInfo
  'prototype-sandbox': RepoSyncInfo
  'workspace-template': WorkspaceSyncInfo
}

export default function App() {
  const [prototypes] = useState<PrototypeEntry[]>(() => discoverPrototypes())
  const [me, setMe] = useState<MeContext>({
    name: '', role: '', productArea: '', team: '',
    focusAreas: [], howIWork: [],
  })
  const [git, setGit] = useState<GitInfo>({ branch: '', dirty: false, changedFiles: 0 })
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)

  useEffect(() => {
    fetch('/api/context')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data['me.md']) setMe(parseMe(data['me.md']))
      })
      .catch(() => {})

    fetch('/api/git-info')
      .then((r) => r.json())
      .then(setGit)
      .catch(() => {})

    fetch('/api/sync-status')
      .then((r) => r.json())
      .then(setSyncStatus)
      .catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* `/*` lets prototypes (e.g. eli-onboarding-hybrid) own nested client routes without a nested HashRouter */}
        <Route path="prototypes/:name/*" element={<PrototypeView prototypes={prototypes} />} />
        <Route element={<AppLayout name={me.name} prototypeCount={prototypes.length} branch={git.branch} dirty={git.dirty} syncStatus={syncStatus} />}>
          <Route index element={<HomePage me={me} prototypes={prototypes} git={git} syncStatus={syncStatus} />} />
          <Route path="prototypes" element={<PrototypesPage prototypes={prototypes} branch={git.branch} />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="context" element={<ContextPage />} />
          <Route path="skills" element={<SkillsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
