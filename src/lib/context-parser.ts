export interface MeContext {
  name: string
  role: string
  productArea: string
  team: string
  focusAreas: string[]
  howIWork: string[]
}

export interface ProductAreaContext {
  productArea: string
  primaryUsers: string
  keyRepos: string
  metrics: Array<{ metric: string; current: string; target: string; why: string }>
  currentState: string
  competitiveLandscape: string
}

function extractField(text: string, label: string): string {
  const regex = new RegExp(`\\*\\*${label}\\*\\*:\\s*(.+)`, 'i')
  const match = text.match(regex)
  if (!match) return ''
  const val = match[1].trim()
  if (val.startsWith('<!--') || val.startsWith('[Your') || val.startsWith('<!-- ')) return ''
  return val
}

function extractListItems(text: string, sectionHeader: string): string[] {
  const sectionRegex = new RegExp(`## ${sectionHeader}[\\s\\S]*?(?=\\n## |$)`, 'i')
  const section = text.match(sectionRegex)
  if (!section) return []
  const items: string[] = []
  const lines = section[0].split('\n')
  for (const line of lines) {
    const match = line.match(/^- (.+)/)
    if (match) {
      const val = match[1].trim()
      if (val.startsWith('<!--') || val.startsWith('**')) continue
      items.push(val)
    }
  }
  return items
}

function extractParagraph(text: string, sectionHeader: string): string {
  const sectionRegex = new RegExp(`## ${sectionHeader}[\\s\\S]*?(?=\\n## |$)`, 'i')
  const section = text.match(sectionRegex)
  if (!section) return ''
  const lines = section[0].split('\n').slice(1)
  const paragraphs: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('>') || trimmed.startsWith('#') || trimmed === '') continue
    if (trimmed.startsWith('<!--')) continue
    paragraphs.push(trimmed)
  }
  return paragraphs.join('\n').trim()
}

export function parseMe(raw: string): MeContext {
  return {
    name: extractField(raw, 'Name'),
    role: extractField(raw, 'Role'),
    productArea: extractField(raw, 'Product Area'),
    team: extractField(raw, 'Team'),
    focusAreas: extractListItems(raw, 'Focus Areas'),
    howIWork: extractListItems(raw, 'How I Work'),
  }
}

export function serializeMe(ctx: MeContext): string {
  const focus = ctx.focusAreas.length > 0
    ? ctx.focusAreas.map(f => `- ${f}`).join('\n')
    : '- <!-- e.g., Improving the renewal flow to increase retention -->'
  const work = ctx.howIWork.length > 0
    ? ctx.howIWork.map(w => `- ${w}`).join('\n')
    : '- <!-- e.g., Keep explanations PM-friendly, avoid deep technical jargon -->'

  return `# About Me

## Identity

- **Name**: ${ctx.name || '<!-- Your full name -->'}
- **Role**: ${ctx.role || '<!-- Your title -->'}
- **Product Area**: ${ctx.productArea || '<!-- Your product area -->'}
- **Team**: ${ctx.team || '<!-- Your team -->'}

## Focus Areas

${focus}

## How I Work

${work}
`
}

export function parseProductArea(raw: string): ProductAreaContext {
  const tableRegex = /\|(.+)\|(.+)\|(.+)\|(.+)\|/g
  const metrics: ProductAreaContext['metrics'] = []
  let match
  let rowIndex = 0
  while ((match = tableRegex.exec(raw)) !== null) {
    rowIndex++
    if (rowIndex <= 2) continue
    const metric = match[1].trim()
    if (metric.startsWith('<!--')) continue
    metrics.push({
      metric,
      current: match[2].trim(),
      target: match[3].trim(),
      why: match[4].trim(),
    })
  }

  return {
    productArea: extractField(raw, 'Product Area'),
    primaryUsers: extractField(raw, 'Primary Users'),
    keyRepos: extractField(raw, 'Key Engineering Repos'),
    metrics,
    currentState: extractParagraph(raw, 'Current State'),
    competitiveLandscape: extractParagraph(raw, 'Competitive Landscape'),
  }
}

export function serializeProductArea(ctx: ProductAreaContext): string {
  const metricRows = ctx.metrics.length > 0
    ? ctx.metrics.map(m => `| ${m.metric} | ${m.current} | ${m.target} | ${m.why} |`).join('\n')
    : '| <!-- Metric --> | <!-- Current --> | <!-- Target --> | <!-- Why --> |'

  return `# My Product Area

## Domain

- **Product Area**: ${ctx.productArea || '<!-- Your product area -->'}
- **Primary Users**: ${ctx.primaryUsers || '<!-- Who uses your area? -->'}
- **Key Engineering Repos**: ${ctx.keyRepos || '<!-- Main repos -->'}

## Key Metrics

| Metric | Current | Target | Why It Matters |
|--------|---------|--------|----------------|
${metricRows}

## Current State

${ctx.currentState || '<!-- Describe current state -->'}

## Competitive Landscape

${ctx.competitiveLandscape || '<!-- Describe competitive landscape -->'}
`
}


export function isPlaceholder(me: MeContext): boolean {
  return !me.name || me.name.startsWith('<!--') || me.name.startsWith('[')
}

export function isUnconfigured(me: MeContext): boolean {
  return isPlaceholder(me) && !me.role && !me.productArea
}
