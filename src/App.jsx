import { useEffect, useState } from 'react'
import WebStoriesExperience from './Component/WebStoriesExperience'
import ArticlePage from './Pages/ArticlePage'
import BreakingPage from './Pages/BreakingPage'
import EpaperPage from './Pages/EpaperPage'
import ExplainerPage from './Pages/ExplainerPage'
import Home from './Pages/Home'
import { homePageContent, loadHomePageContent } from './services/contentSource'

function App() {
  const [content, setContent] = useState(homePageContent)
  const searchParams = new URLSearchParams(window.location.search)
  const articleId = searchParams.get('article')?.trim() ?? ''
  const storyId = searchParams.get('story')?.trim() ?? ''
  const isEpaperPage = searchParams.get('epaper') === '1'
  const isBreakingPage = searchParams.get('breaking') === '1'
  const isExplainerPage = searchParams.get('explainer') === '1'

  useEffect(() => {
    let isMounted = true

    loadHomePageContent()
      .then((nextContent) => {
        if (!isMounted) {
          return
        }

        setContent(nextContent)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setContent(homePageContent)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = content.locale
    document.title = content.pageTitle
  }, [content])

  if (articleId) {
    return <ArticlePage content={content} articleId={articleId} />
  }

  if (storyId) {
    return <WebStoriesExperience content={content.webStoriesSection} storyId={storyId} />
  }

  if (isEpaperPage) {
    return <EpaperPage content={content} query={searchParams} />
  }

  if (isBreakingPage) {
    return <BreakingPage content={content} query={searchParams} />
  }

  if (isExplainerPage) {
    return <ExplainerPage content={content} query={searchParams} />
  }

  return <Home content={content} />
}

export default App
