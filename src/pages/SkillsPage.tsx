import { useState, useEffect } from 'react'
import { Sparkles, User, Cpu, ExternalLink, FolderOpen, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Skill {
  id: string
  name: string
  description: string
  disabled: boolean
}

interface SkillsResponse {
  org: Skill[]
  personal: Skill[]
  builtin: Skill[]
  orgAvailable: boolean
}

export default function SkillsPage() {
  const [data, setData] = useState<SkillsResponse>({ org: [], personal: [], builtin: [], orgAvailable: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/skills')
      .then((r) => r.json())
      .then((d: SkillsResponse) => {
        setData({
          org: d.org.filter(s => !s.disabled),
          personal: d.personal.filter(s => !s.disabled),
          builtin: d.builtin.filter(s => !s.disabled),
          orgAvailable: d.orgAvailable,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-surface-900">Skills</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Invoke by name in Cursor chat (e.g., <span className="font-mono text-brand-500">/create-prototype</span>), or just describe what you need.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-surface-400">Loading skills...</div>
      ) : (
        <>
          {/* Shared Organization Skills — always visible */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg p-1.5 bg-gradient-to-br from-brand-500 to-accent text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-surface-900">Shared Organization Skills</h2>
                <a href="https://github.com/entrata-product/product-spec-kit" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                  Pulled from Product Spec Kit <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              {data.org.length > 0 && (
                <span className="ml-auto rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500">
                  {data.org.length}
                </span>
              )}
            </div>

            {!data.orgAvailable ? (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Product Spec Kit not found</p>
                    <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                      Shared organization skills come from <span className="font-mono">product-spec-kit</span>, which should be a sibling folder next to this workspace. Pull it down:
                    </p>
                    <div className="mt-2 rounded-lg bg-amber-100/80 px-3 py-2 font-mono text-xs text-amber-800">
                      cd your-projects-folder && git clone git@github.com:entrata-product/product-spec-kit.git
                    </div>
                  </div>
                </div>
              </div>
            ) : data.org.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-white/60 p-5">
                <p className="text-sm text-surface-400">Product Spec Kit found but no active skills detected. Try pulling the latest: Source Control &gt; ... &gt; Pull.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {data.org.map((skill) => (
                  <div key={skill.id} className="card card-hover rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-surface-900 font-mono">/{skill.name}</h3>
                    {skill.description && (
                      <p className="text-xs text-surface-400 mt-2 line-clamp-3">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-surface-300 mt-2 px-1">
              These skills are governed by the Product Spec Kit. Pull regularly to get new ones.
            </p>
          </section>

          {/* Personal Skills — always visible */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-surface-900">Personal Skills</h2>
                <p className="text-xs text-surface-400 font-mono">~/.cursor/skills/</p>
              </div>
              {data.personal.length > 0 && (
                <span className="ml-auto rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500">
                  {data.personal.length}
                </span>
              )}
            </div>

            {data.personal.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {data.personal.map((skill) => (
                  <div key={skill.id} className="card card-hover rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-surface-900 font-mono">/{skill.name}</h3>
                    {skill.description && (
                      <p className="text-xs text-surface-400 mt-2 line-clamp-3">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-white/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-surface-100 p-2.5 text-surface-400">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700">No personal skills yet</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      Create your own at <span className="font-mono text-brand-500">~/.cursor/skills/skill-name/SKILL.md</span> — they work across all your projects and are backed up in your workspace.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Cursor Built-in — only if found */}
          {data.builtin.length > 0 && (
            <SkillSection
              title="Cursor Built-in"
              subtitle="Bundled with Cursor"
              icon={<Cpu className="h-4 w-4" />}
              iconColor="bg-surface-700 text-white"
              skills={data.builtin}
            />
          )}
        </>
      )}
    </div>
  )
}

function SkillSection({ title, subtitle, subtitleLink, icon, iconColor, skills, hint }: {
  title: string; subtitle: string; subtitleLink?: string; icon: React.ReactNode; iconColor: string; skills: Skill[]; hint?: string
}) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className={cn('rounded-lg p-1.5', iconColor)}>{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-surface-900">{title}</h2>
          {subtitleLink ? (
            <a href={subtitleLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              {subtitle} <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <p className="text-xs text-surface-400 font-mono">{subtitle}</p>
          )}
        </div>
        <span className="ml-auto rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500">
          {skills.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill) => (
          <div key={skill.id} className="card card-hover rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-surface-900 font-mono">
              /{skill.name}
            </h3>
            {skill.description && (
              <p className="text-xs text-surface-400 mt-2 line-clamp-3">{skill.description}</p>
            )}
          </div>
        ))}
      </div>
      {hint && <p className="text-[11px] text-surface-300 mt-2 px-1">{hint}</p>}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-white/60 backdrop-blur-sm py-16 px-6 text-center">
      <Sparkles className="h-8 w-8 text-surface-300 mb-4" />
      <h3 className="text-base font-semibold text-surface-900">No skills found</h3>
      <p className="text-sm text-surface-400 mt-2 max-w-sm">
        Make sure <span className="font-mono">product-spec-kit</span> is a sibling directory, or add personal skills to <span className="font-mono">~/.cursor/skills/</span>.
      </p>
    </div>
  )
}
