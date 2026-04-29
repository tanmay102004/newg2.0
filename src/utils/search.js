import { collectPageStories, getResolvedTrendingTagItems } from '../data/tagPages'
import { buildArticleHref, buildTagHref, resolveArticleHref } from './articleRouting'
import { getResolvedNavItems } from './navigation'

const PAGE_LINKS = [
  { label: 'Home', href: '/', keywords: ['home', 'homepage'] },
  { label: 'Breaking', href: '/?breaking=1', keywords: ['breaking', 'latest'] },
  { label: 'Desh', href: '/?desh=1', keywords: ['desh', 'country', 'india'] },
  { label: 'Videsh', href: '/?videsh=1', keywords: ['videsh', 'world', 'international'] },
  { label: 'Rajya', href: '/?rajya=1', keywords: ['rajya', 'state'] },
  { label: 'Rajniti', href: '/?rajniti=1', keywords: ['rajniti', 'politics'] },
  { label: 'Dharma Culture', href: '/?dharmaCulture=1', keywords: ['dharma', 'culture', 'religion'] },
  { label: 'Entertainment', href: '/?entertainment=1', keywords: ['entertainment'] },
  { label: 'Education', href: '/?education=1', keywords: ['education'] },
  { label: 'Khel', href: '/?khel=1', keywords: ['khel', 'sports'] },
  { label: 'News', href: '/?news=1', keywords: ['news'] },
  { label: 'Technology', href: '/?technology=1', keywords: ['technology', 'tech'] },
  { label: 'News Khidki', href: '/?newsKhidki=1', keywords: ['khidki'] },
  { label: 'Special', href: '/?special=1', keywords: ['special'] },
  { label: 'Sehat', href: '/?sehat=1', keywords: ['sehat', 'health'] },
  { label: 'Sampadkiya', href: '/?sampadkiya=1', keywords: ['sampadkiya', 'editorial'] },
  { label: 'Explainer', href: '/?explainer=1', keywords: ['explainer'] },
  { label: 'Election', href: '/?election=1', keywords: ['election', 'chunav'] },
  { label: 'Podcast', href: '/?podcast=1', keywords: ['podcast'] },
  { label: 'E-paper', href: '/?epaper=1', keywords: ['epaper', 'paper'] },
  { label: 'E-magazine', href: '/?emagazine=1', keywords: ['emagazine', 'magazine'] },
]

function normalize(value = '') {
  return String(value).trim().toLowerCase()
}

function getTagLabel(tag) {
  if (!tag) {
    return ''
  }

  if (typeof tag === 'string') {
    return tag
  }

  return tag.label ?? tag.name ?? tag.title ?? ''
}

function includesQuery(values, query) {
  return values.some((value) => normalize(value).includes(query))
}

function uniqueByHref(items) {
  const seen = new Set()

  return items.filter((item) => {
    if (!item.href || seen.has(item.href)) {
      return false
    }

    seen.add(item.href)
    return true
  })
}

function buildPageItems(content = {}) {
  const navItems = [
    ...getResolvedNavItems(content.navbar?.items ?? []),
    ...(content.navbar?.moreItems ?? []),
  ]
    .filter((item) => typeof item === 'object' && item.label)
    .map((item) => ({
      type: 'Page',
      title: item.label,
      description: 'Open section page',
      href: item.href ?? '/',
      keywords: [item.label, item.href],
    }))

  return uniqueByHref([
    ...navItems,
    ...PAGE_LINKS.map((item) => ({
      type: 'Page',
      title: item.label,
      description: 'Open section page',
      href: item.href,
      keywords: [item.label, item.href, ...(item.keywords ?? [])],
    })),
  ])
}

function buildTagItems(content = {}) {
  const tagMap = new Map()

  getResolvedTrendingTagItems(content, 40).forEach((tag) => {
    const label = getTagLabel(tag)
    if (label) {
      tagMap.set(normalize(label), label)
    }
  })

  collectPageStories(content).forEach((story) => {
    ;(story.tags ?? []).forEach((tag) => {
      const label = getTagLabel(tag)
      if (label) {
        tagMap.set(normalize(label), label)
      }
    })
  })

  return [...tagMap.values()].map((label) => ({
    type: 'Tag',
    title: label,
    description: 'Stories with this tag',
    href: buildTagHref(label),
    keywords: [label],
  }))
}

function buildStoryItems(content = {}) {
  return uniqueByHref(
    collectPageStories(content).map((story) => ({
      type: 'Story',
      title: story.title,
      description: story.summary || story.author || 'Open story',
      href: resolveArticleHref({
        ...story,
        articleId: story.articleId ?? story.id ?? story.slug ?? buildArticleHref('default'),
      }),
      keywords: [
        story.title,
        story.summary,
        story.author,
        story.date,
        ...(story.tags ?? []).map(getTagLabel),
      ],
    })),
  )
}

export function buildSearchResults(content = {}, query = '', limit = 8) {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    return []
  }

  const items = [
    ...buildPageItems(content),
    ...buildTagItems(content),
    ...buildStoryItems(content),
  ]

  return items
    .map((item) => {
      const title = normalize(item.title)
      const score =
        title === normalizedQuery
          ? 100
          : title.startsWith(normalizedQuery)
            ? 80
            : includesQuery(item.keywords ?? [], normalizedQuery)
              ? 50
              : 0

      return { ...item, score }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit)
}
