import { defaultArticlePages } from '../data/articlePages'
import { homePageContent } from '../data/homePageContent'

const CONTENT_API_URL = import.meta.env.VITE_CONTENT_API_URL?.trim()

export async function loadHomePageContent() {
  if (!CONTENT_API_URL) {
    return {
      ...homePageContent,
      articlePages: defaultArticlePages,
    }
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

  return {
    ...homePageContent,
    ...remoteContent,
    articlePages: {
      ...defaultArticlePages,
      ...(remoteContent.articlePages ?? {}),
    },
  }
}

export { CONTENT_API_URL, homePageContent }
