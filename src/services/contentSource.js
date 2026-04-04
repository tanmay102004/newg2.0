import { homePageContent } from '../data/homePageContent'

const CONTENT_API_URL = import.meta.env.VITE_CONTENT_API_URL?.trim()

export async function loadHomePageContent() {
  if (!CONTENT_API_URL) {
    return homePageContent
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
  }
}

export { CONTENT_API_URL, homePageContent }
