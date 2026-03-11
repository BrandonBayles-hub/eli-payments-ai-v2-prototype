import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { createRequire } from 'module'

function workspaceApiPlugin(): PluginOption {
  return {
    name: 'workspace-api',
    configureServer(server) {
      const root = path.resolve(__dirname)
      const contextDir = path.join(root, 'context')
      const orgSkillsDir = path.resolve(root, '../product-spec-kit/.cursor/skills')
      const homeDir = process.env.HOME || process.env.USERPROFILE || ''
      const personalSkillsDir = path.join(homeDir, '.cursor', 'skills')
      const builtinSkillsDir = path.join(homeDir, '.cursor', 'skills-cursor')

      server.middlewares.use('/api/context/save', (req: any, res: any, next: any) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk: string) => { body += chunk })
        req.on('end', () => {
          const { filename, content } = JSON.parse(body)
          const allowed = ['me.md', 'product-area.md', 'memory.md', 'tasks.md']
          if (!allowed.includes(filename)) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid filename' }))
            return
          }
          fs.writeFileSync(path.join(contextDir, filename), content, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        })
      })

      server.middlewares.use('/api/context', (req: any, res: any, next: any) => {
        if (req.method !== 'GET') return next()
        const files = ['me.md', 'product-area.md', 'memory.md', 'tasks.md']
        const result: Record<string, string> = {}
        for (const file of files) {
          const fp = path.join(contextDir, file)
          if (fs.existsSync(fp)) result[file] = fs.readFileSync(fp, 'utf-8')
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      })

      function readSkillsFromDir(dir: string) {
        const skills: Array<{ id: string; name: string; description: string; disabled: boolean }> = []
        if (!fs.existsSync(dir)) return skills
        for (const entry of fs.readdirSync(dir)) {
          const skillPath = path.join(dir, entry, 'SKILL.md')
          if (!fs.existsSync(skillPath)) continue
          const raw = fs.readFileSync(skillPath, 'utf-8')
          const fm = raw.match(/^---\n([\s\S]*?)\n---/)
          let name = entry, description = '', disabled = false
          if (fm) {
            const block = fm[1]
            const n = block.match(/name:\s*(.+)/); if (n) name = n[1].trim()
            const d = block.match(/description:\s*(.+)/); if (d) description = d[1].trim()
            const dis = block.match(/disable-model-invocation:\s*(.+)/); if (dis) disabled = dis[1].trim() === 'true'
          }
          skills.push({ id: entry, name, description, disabled })
        }
        return skills
      }

      server.middlewares.use('/api/skills', (req: any, res: any, next: any) => {
        if (req.method !== 'GET') return next()
        const org = readSkillsFromDir(orgSkillsDir).filter(s => !s.disabled)
        const personal = readSkillsFromDir(personalSkillsDir)
        const builtin = readSkillsFromDir(builtinSkillsDir)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          org,
          personal,
          builtin,
          orgAvailable: fs.existsSync(orgSkillsDir),
        }))
      })

      server.middlewares.use('/api/prototypes', (req: any, res: any, next: any) => {
        if (req.method !== 'GET') return next()
        const prototypesDir = path.join(root, 'prototypes')
        const protos: Array<{ slug: string; name: string; hasIndex: boolean }> = []
        if (fs.existsSync(prototypesDir)) {
          for (const entry of fs.readdirSync(prototypesDir)) {
            const entryPath = path.join(prototypesDir, entry)
            if (!fs.statSync(entryPath).isDirectory()) continue
            const hasIndex = fs.existsSync(path.join(entryPath, 'index.tsx'))
            const metaPath = path.join(entryPath, 'metadata.json')
            let name = entry.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            if (fs.existsSync(metaPath)) {
              try { const m = JSON.parse(fs.readFileSync(metaPath, 'utf-8')); if (m.title) name = m.title } catch {}
            }
            protos.push({ slug: entry, name, hasIndex })
          }
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(protos))
      })

      server.middlewares.use('/api/git-info', (req: any, res: any, next: any) => {
        if (req.method !== 'GET') return next()
        try {
          const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: root, encoding: 'utf-8' }).trim()
          const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf-8' }).trim()
          const dirty = status.length > 0
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ branch, dirty, changedFiles: status.split('\n').filter(Boolean).length }))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ branch: 'unknown', dirty: false, changedFiles: 0 }))
        }
      })

      function checkRepoBehind(repoDir: string): { exists: boolean; behind: number; current: string; remote: string } {
        if (!fs.existsSync(path.join(repoDir, '.git'))) return { exists: false, behind: 0, current: '', remote: '' }
        try {
          execSync('git fetch origin --quiet 2>/dev/null', { cwd: repoDir, encoding: 'utf-8', timeout: 10000 })
          const current = execSync('git rev-parse HEAD', { cwd: repoDir, encoding: 'utf-8' }).trim()
          const remote = execSync('git rev-parse origin/main', { cwd: repoDir, encoding: 'utf-8' }).trim()
          if (current === remote) return { exists: true, behind: 0, current, remote }
          const behindCount = execSync(`git rev-list --count HEAD..origin/main`, { cwd: repoDir, encoding: 'utf-8' }).trim()
          return { exists: true, behind: parseInt(behindCount, 10) || 0, current, remote }
        } catch {
          return { exists: true, behind: 0, current: '', remote: '' }
        }
      }

      function checkUpstreamBehind(): { hasUpstream: boolean; behind: number } {
        try {
          const remotes = execSync('git remote', { cwd: root, encoding: 'utf-8' }).trim()
          if (!remotes.split('\n').includes('upstream')) return { hasUpstream: false, behind: 0 }
          execSync('git fetch upstream --quiet 2>/dev/null', { cwd: root, encoding: 'utf-8', timeout: 10000 })
          const current = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf-8' }).trim()
          const upstream = execSync('git rev-parse upstream/main', { cwd: root, encoding: 'utf-8' }).trim()
          if (current === upstream) return { hasUpstream: true, behind: 0 }
          const mergeBase = execSync('git merge-base HEAD upstream/main', { cwd: root, encoding: 'utf-8' }).trim()
          const behindCount = execSync(`git rev-list --count ${mergeBase}..upstream/main`, { cwd: root, encoding: 'utf-8' }).trim()
          return { hasUpstream: true, behind: parseInt(behindCount, 10) || 0 }
        } catch {
          return { hasUpstream: false, behind: 0 }
        }
      }

      server.middlewares.use('/api/sync-status', (req: any, res: any, next: any) => {
        if (req.method !== 'GET') return next()
        const specKitDir = path.resolve(root, '../product-spec-kit')
        const sandboxDir = path.resolve(root, '../prototype-sandbox')
        const specKit = checkRepoBehind(specKitDir)
        const sandbox = checkRepoBehind(sandboxDir)
        const workspace = checkUpstreamBehind()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          'product-spec-kit': { ...specKit, path: specKitDir },
          'prototype-sandbox': { ...sandbox, path: sandboxDir },
          'workspace-template': workspace,
        }))
      })

      server.middlewares.use('/onboarding-guide', (req: any, res: any, next: any) => {
        const guidePath = path.resolve(root, '../product-spec-kit/onboarding/pm-onboarding-guide.html')
        if (!fs.existsSync(guidePath)) {
          res.statusCode = 404
          res.end('Onboarding guide not found. Make sure product-spec-kit is cloned as a sibling folder.')
          return
        }
        res.setHeader('Content-Type', 'text/html')
        res.end(fs.readFileSync(guidePath, 'utf-8'))
      })
    },
  }
}

const sandboxDir = path.resolve(__dirname, '../prototype-sandbox')
const workspaceNodeModules = path.resolve(__dirname, 'node_modules')

/**
 * Ensures that bare module imports (e.g. @radix-ui/react-slot) from sandbox
 * source files resolve against the workspace's node_modules, not the sandbox's.
 */
const _require = createRequire(import.meta.url)

const sandboxSrc = path.resolve(sandboxDir, 'src')
const workspaceSrc = path.resolve(__dirname, 'src')

/**
 * Resolves imports from sandbox files so they find the right modules:
 * - `@/` imports → sandbox's own src/ (not the workspace's src/)
 * - bare module imports (e.g. @radix-ui/*) → workspace's node_modules via Vite's ESM resolver
 */
function sandboxResolverPlugin(): PluginOption {
  function tryResolveFile(base: string): string | null {
    for (const ext of ['', '.tsx', '.ts', '.js', '.jsx', '/index.tsx', '/index.ts', '/index.js']) {
      if (fs.existsSync(base + ext)) return base + ext
    }
    return null
  }

  const fakeWorkspaceImporter = path.join(workspaceSrc, '__sandbox_bridge__.ts')

  return {
    name: 'sandbox-resolver',
    enforce: 'pre',
    resolveId: {
      order: 'pre',
      async handler(source, importer) {
        if (source.startsWith('@/')) {
          const fromSandbox = importer?.includes('prototype-sandbox')
          const root = fromSandbox ? sandboxSrc : workspaceSrc
          const resolved = tryResolveFile(path.resolve(root, source.slice(2)))
          return resolved
        }

        if (!importer || !importer.includes('prototype-sandbox')) return null
        if (source.startsWith('.') || source.startsWith('/') || source.startsWith('@sandbox')) return null

        const result = await this.resolve(source, fakeWorkspaceImporter, { skipSelf: true })
        return result
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sandboxResolverPlugin(), workspaceApiPlugin()],
  resolve: {
    alias: {
      '@sandbox': path.resolve(sandboxDir, 'src'),
      '@sandbox-components': path.resolve(sandboxDir, 'src/components'),
      '@sandbox-lib': path.resolve(sandboxDir, 'src/lib'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    entries: ['src/main.tsx'],
  },
  server: {
    port: 5174,
    fs: {
      allow: (() => {
        const dirs = ['.', sandboxDir]
        try { dirs.push(fs.realpathSync(sandboxDir)) } catch {}
        return [...new Set(dirs)]
      })(),
    },
  },
})
