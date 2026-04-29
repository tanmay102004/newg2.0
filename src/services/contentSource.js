import { defaultArticlePages } from '../data/articlePages'
import { homePageContent } from '../data/homePageContent'
import { applyHomepagePlacements } from './homepagePlacements'
import { applyPublicationIssuesToContent } from './publicationIssues'
import { getPublishedStorySubmissions } from './storySubmissions'

const CONTENT_API_URL = import.meta.env.VITE_CONTENT_API_URL?.trim()

function buildResolvedHomePageContent(baseContent, remoteContent = {}) {
  const mergedContent = {
    ...baseContent,
    ...remoteContent,
    articlePages: {
      ...defaultArticlePages,
      ...(remoteContent.articlePages ?? {}),
    },
  }

  return applyPublicationIssuesToContent(
    applyHomepagePlacements(mergedContent, getPublishedStorySubmissions()),
  )
}

export async function loadHomePageContent() {
  if (!CONTENT_API_URL) {
    return buildResolvedHomePageContent(homePageContent)
  }

  const response = await fetch(CONTENT_API_URL, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Content API request failed with status ${response.status}`)
  }

  const remoteContent = await response.json()

  return buildResolvedHomePageContent(homePageContent, remoteContent)
}

export { CONTENT_API_URL, homePageContent }
