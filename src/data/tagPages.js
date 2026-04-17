import {
  buildStoryFromArticle,
  collectSummaryStories,
  getResolvedArticlePageContent,
} from './articlePages'
import { defaultBreakingPage } from './breakingPage'
import { defaultDeshPage } from './deshPage'
import { defaultDharmaCulturePage } from './dharmaCulturePage'
import { defaultEducationPage } from './educationPage'
import { defaultElectionPage } from './electionPage'
import { defaultEntertainmentPage } from './entertainmentPage'
import { defaultExplainerPage } from './explainerPage'
import { defaultKhelPage } from './khelPage'
import { defaultNewsKhidkiPage } from './newsKhidkiPage'
import { defaultNewsPage } from './newsPage'
import { defaultPodcastPage } from './podcastPage'
import { defaultRajnitiPage } from './rajnitiPage'
import { defaultRajyaPage } from './rajyaPage'
import { defaultSampadkiyaPage } from './sampadkiyaPage'
import { defaultSehatPage } from './sehatPage'
import { defaultSpecialPage } from './specialPage'
import { defaultTechnologyPage } from './technologyPage'
import { defaultVideshPage } from './videshPage'
import { buildTagHref } from '../utils/articleRouting'

const DEFAULT_TAG_PAGE = {
  readMoreLabel: 'Read More',
  categoryTitle: 'कैटेगरीज़',
  subscribeTitle: 'न्यूज़लेटर के लिए सब्सक्राइब करें',
}

const PAGE_DEFAULTS = [
  ['breakingPage', defaultBreakingPage],
  ['deshPage', defaultDeshPage],
  ['dharmaCulturePage', defaultDharmaCulturePage],
  ['educationPage', defaultEducationPage],
  ['electionPage', defaultElectionPage],
  ['entertainmentPage', defaultEntertainmentPage],
  ['explainerPage', defaultExplainerPage],
  ['khelPage', defaultKhelPage],
  ['newsPage', defaultNewsPage],
  ['newsKhidkiPage', defaultNewsKhidkiPage],
  ['podcastPage', defaultPodcastPage],
  ['rajnitiPage', defaultRajnitiPage],
  ['rajyaPage', defaultRajyaPage],
  ['sampadkiyaPage', defaultSampadkiyaPage],
  ['sehatPage', defaultSehatPage],
  ['specialPage', defaultSpecialPage],
  ['technologyPage', defaultTechnologyPage],
  ['videshPage', defaultVideshPage],
]

function normalizeTagKey(value = '') {
  return value.trim().toLowerCase()
}

function normalizeTagLabel(value) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  return String(value.label ?? value.name ?? value.title ?? '').trim()
}

function parseStoryDate(value) {
  const timestamp = Date.parse(value ?? '')
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function buildTagStory(story = {}) {
  if (!story) {
    return null
  }

  const storySections = story.storySections ?? story.publishedIn ?? story.sections ?? []
  const tags = story.tags ?? []
  const mergedTags = [...storySections, ...tags]

  return {
    ...story,
    id: story.id ?? story.articleId ?? story.slug ?? '',
    title: story.title ?? story.headline ?? '',
    summary: story.summary ?? story.excerpt ?? story.description ?? '',
    author: story.author ?? story.writer ?? story.byline ?? '',
    date: story.date ?? story.publishedAt ?? '',
    imageUrl: story.imageUrl ?? story.thumbnailUrl ?? story.image ?? '',
    tags: mergedTags.map(normalizeTagLabel).filter(Boolean),
  }
}

function collectPageStories(content = {}) {
  const storyMap = new Map()

  const pushStory = (story) => {
    const normalized = buildTagStory(story)

    if (!normalized?.id) {
      return
    }

    if (!storyMap.has(normalized.id)) {
      storyMap.set(normalized.id, normalized)
      return
    }

    const current = storyMap.get(normalized.id)
    storyMap.set(normalized.id, {
      ...current,
      ...normalized,
      summary: current.summary || normalized.summary,
      imageUrl: current.imageUrl || normalized.imageUrl,
      tags: [...new Set([...(current.tags ?? []), ...(normalized.tags ?? [])])],
    })
  }

  collectSummaryStories(content).forEach(pushStory)
  Object.values(content.articlePages ?? {}).map(buildStoryFromArticle).forEach(pushStory)
  PAGE_DEFAULTS.forEach(([key, defaultPage]) => {
    const page = content[key] ?? defaultPage
    ;(page.stories ?? []).forEach(pushStory)
  })

  return [...storyMap.values()]
}

function mergeSidebar(baseSidebar = {}, overrideSidebar = {}) {
  return {
    relatedStories:
      overrideSidebar.relatedStories?.length
        ? overrideSidebar.relatedStories
        : baseSidebar.relatedStories ?? [],
    subscribeBox:
      Object.keys(overrideSidebar.subscribeBox ?? {}).length
        ? overrideSidebar.subscribeBox
        : baseSidebar.subscribeBox ?? {},
    categories:
      overrideSidebar.categories?.length
        ? overrideSidebar.categories
        : baseSidebar.categories ?? [],
  }
}

function resolveSharedSidebar(content = {}) {
  const articleSidebar = getResolvedArticlePageContent('default', content).sidebar ?? {}
  const breakingSidebar = defaultBreakingPage.sidebar ?? {}
  const contentSidebar =
    content.articleDetailSidebar ??
    content.articlePageSidebar ??
    content.articleSidebar ??
    {}

  return mergeSidebar(mergeSidebar(articleSidebar, breakingSidebar), contentSidebar)
}

export function getResolvedTagPageContent(tagName, content = {}) {
  const requestedTag = tagName?.trim() ?? ''
  const normalizedTag = normalizeTagKey(requestedTag)
  const configuredTagPages = content.tagPages ?? {}
  const configuredPage =
    configuredTagPages[requestedTag] ??
    configuredTagPages[normalizedTag] ??
    null

  const allStories = collectPageStories(content)
  const stories = (
    configuredPage?.stories?.length
      ? configuredPage.stories.map(buildTagStory).filter(Boolean)
      : allStories.filter((story) =>
          (story.tags ?? []).some((tag) => normalizeTagKey(String(tag)) === normalizedTag),
        )
  ).sort(
    (left, right) =>
      parseStoryDate(right.publishedAt ?? right.date) - parseStoryDate(left.publishedAt ?? left.date),
  )

  return {
    ...DEFAULT_TAG_PAGE,
    ...configuredPage,
    title: configuredPage?.title ?? requestedTag,
    intro:
      configuredPage?.intro ??
      (requestedTag ? `${requestedTag} टैग से जुड़ी सभी स्टोरीज़` : 'टैग से जुड़ी स्टोरीज़'),
    sidebar: mergeSidebar(resolveSharedSidebar(content), configuredPage?.sidebar ?? {}),
    stories,
  }
}

export function getResolvedTrendingTagItems(content = {}, limit = 10) {
  const configuredItems = content?.meta?.trendingTags

  if (configuredItems?.length) {
    return configuredItems
  }

  const tagCounts = new Map()

  collectPageStories(content).forEach((story) => {
    ;(story.tags ?? []).forEach((tag) => {
      const label = normalizeTagLabel(tag)
      const key = normalizeTagKey(label)

      if (!label || !key) {
        return
      }

      const current = tagCounts.get(key) ?? { label, count: 0 }
      tagCounts.set(key, {
        label: current.label,
        count: current.count + 1,
      })
    })
  })

  return [...tagCounts.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit)
    .map((item) => ({
      label: item.label,
      href: buildTagHref(item.label),
      count: item.count,
    }))
}
