import type { ComponentType } from 'react'

interface PrototypeMetadata {
  title?: string
  description?: string
  section?: string
  tags?: string[]
}

export interface PrototypeEntry {
  slug: string
  name: string
  description: string
  path: string
  component: () => Promise<{ default: ComponentType }>
}

const prototypeModules = import.meta.glob('../../prototypes/*/index.tsx')
const metadataModules = import.meta.glob('../../prototypes/*/metadata.json', {
  eager: true,
}) as Record<string, { default?: PrototypeMetadata } & PrototypeMetadata>

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function discoverPrototypes(): PrototypeEntry[] {
  return Object.entries(prototypeModules).map(([modulePath, loader]) => {
    const folderMatch = modulePath.match(/\.\.\/\.\.\/prototypes\/([^/]+)\/index\.tsx$/)
    const slug = folderMatch ? folderMatch[1] : 'unknown'

    const metaKey = `../../prototypes/${slug}/metadata.json`
    const meta = metadataModules[metaKey]
    const metaData: PrototypeMetadata = meta?.default ?? meta ?? {}

    return {
      slug,
      name: metaData.title ?? slugToTitle(slug),
      description: metaData.description ?? `Prototype: ${slugToTitle(slug)}`,
      path: `/prototypes/${slug}`,
      component: loader as () => Promise<{ default: ComponentType }>,
    }
  })
}
