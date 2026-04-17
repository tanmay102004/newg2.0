import { useEffect, useState } from 'react'
import WebStoriesExperience from './Component/WebStoriesExperience'
import ArticlePage from './Pages/ArticlePage'
import AuthorPage from './Pages/AuthorPage'
import BreakingPage from './Pages/BreakingPage'
import DeshPage from './Pages/DeshPage'
import DharmaCulturePage from './Pages/DharmaCulturePage'
import EducationPage from './Pages/EducationPage'
import EpaperPage from './Pages/EpaperPage'
import EmagazinePage from './Pages/EmagazinePage'
import ElectionPage from './Pages/ElectionPage'
import EntertainmentPage from './Pages/EntertainmentPage'
import ExplainerPage from './Pages/ExplainerPage'
import KhelPage from './Pages/KhelPage'
import NewsPage from './Pages/NewsPage'
import NewsKhidkiPage from './Pages/NewsKhidkiPage'
import PodcastPage from './Pages/PodcastPage'
import RajnitiPage from './Pages/RajnitiPage'
import RajyaPage from './Pages/RajyaPage'
import SampadkiyaPage from './Pages/SampadkiyaPage'
import SehatPage from './Pages/SehatPage'
import SpecialPage from './Pages/SpecialPage'
import TechnologyPage from './Pages/TechnologyPage'
import TagPage from './Pages/TagPage'
import VideshPage from './Pages/VideshPage'
import EmployeeDashboardPage from './Pages/EmployeeDashboardPage'
import EmployeeLoginPage from './Pages/EmployeeLoginPage'
import Home from './Pages/Home'
import { homePageContent, loadHomePageContent } from './services/contentSource'
import { getEmployeeSession } from './services/employeeAuth'
import { HOMEPAGE_PLACEMENTS_CHANGE_EVENT } from './services/homepagePlacements'
import { STORY_SUBMISSIONS_CHANGE_EVENT } from './services/storySubmissions'

function App() {
  const [content, setContent] = useState(homePageContent)
  const [pathname, setPathname] = useState(window.location.pathname)
  const [employeeSession, setEmployeeSession] = useState(getEmployeeSession())
  const searchParams = new URLSearchParams(window.location.search)
  const articleId = searchParams.get('article')?.trim() ?? ''
  const authorName = searchParams.get('author')?.trim() ?? ''
  const tagName = searchParams.get('tag')?.trim() ?? ''
  const storyId = searchParams.get('story')?.trim() ?? ''
  const isEpaperPage = searchParams.get('epaper') === '1'
  const isEmagazinePage = searchParams.get('emagazine') === '1'
  const isBreakingPage = searchParams.get('breaking') === '1'
  const isDeshPage = searchParams.get('desh') === '1'
  const isDharmaCulturePage = searchParams.get('dharmaCulture') === '1'
  const isEducationPage = searchParams.get('education') === '1'
  const isEntertainmentPage = searchParams.get('entertainment') === '1'
  const isKhelPage = searchParams.get('khel') === '1'
  const isNewsPage = searchParams.get('news') === '1'
  const isNewsKhidkiPage = searchParams.get('newsKhidki') === '1'
  const isSampadkiyaPage = searchParams.get('sampadkiya') === '1'
  const isSehatPage = searchParams.get('sehat') === '1'
  const isSpecialPage = searchParams.get('special') === '1'
  const isTechnologyPage = searchParams.get('technology') === '1'
  const isVideshPage = searchParams.get('videsh') === '1'
  const isRajyaPage = searchParams.get('rajya') === '1'
  const isRajnitiPage = searchParams.get('rajniti') === '1'
  const isExplainerPage = searchParams.get('explainer') === '1'
  const isElectionPage = searchParams.get('election') === '1'
  const isPodcastPage = searchParams.get('podcast') === '1'

  useEffect(() => {
    let isMounted = true
    const loadContent = () => {
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
    }

    const handlePublicContentChange = () => {
      loadContent()
    }

    const handleStorageChange = (event) => {
      if (
        event.key === 'newgindia.story.submissions' ||
        event.key === 'newgindia.homepage.placements'
      ) {
        loadContent()
      }
    }

    loadContent()
    window.addEventListener(STORY_SUBMISSIONS_CHANGE_EVENT, handlePublicContentChange)
    window.addEventListener(HOMEPAGE_PLACEMENTS_CHANGE_EVENT, handlePublicContentChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      isMounted = false
      window.removeEventListener(STORY_SUBMISSIONS_CHANGE_EVENT, handlePublicContentChange)
      window.removeEventListener(HOMEPAGE_PLACEMENTS_CHANGE_EVENT, handlePublicContentChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = content.locale
    document.title = content.pageTitle
  }, [content])

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname)
    }

    const handleEmployeeSessionChange = (event) => {
      setEmployeeSession(event.detail ?? getEmployeeSession())
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('employee-auth-change', handleEmployeeSessionChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('employee-auth-change', handleEmployeeSessionChange)
    }
  }, [])

  if (pathname === '/login') {
    return (
      <EmployeeLoginPage
        employeeSession={employeeSession}
        onAuthenticated={setEmployeeSession}
      />
    )
  }

  if (pathname === '/dashboard') {
    return employeeSession ? (
      <EmployeeDashboardPage
        employeeSession={employeeSession}
        onLogout={setEmployeeSession}
      />
    ) : (
      <EmployeeLoginPage onAuthenticated={setEmployeeSession} redirectToLogin />
    )
  }

  if (articleId) {
    return <ArticlePage content={content} articleId={articleId} />
  }

  if (authorName) {
    return <AuthorPage content={content} query={searchParams} />
  }

  if (tagName) {
    return <TagPage content={content} query={searchParams} />
  }

  if (storyId) {
    return <WebStoriesExperience content={content.webStoriesSection} storyId={storyId} />
  }

  if (isEpaperPage) {
    return <EpaperPage content={content} query={searchParams} />
  }

  if (isEmagazinePage) {
    return <EmagazinePage content={content} query={searchParams} />
  }

  if (isBreakingPage) {
    return <BreakingPage content={content} query={searchParams} />
  }

  if (isDeshPage) {
    return <DeshPage content={content} query={searchParams} />
  }

  if (isDharmaCulturePage) {
    return <DharmaCulturePage content={content} query={searchParams} />
  }

  if (isEducationPage) {
    return <EducationPage content={content} query={searchParams} />
  }

  if (isEntertainmentPage) {
    return <EntertainmentPage content={content} query={searchParams} />
  }

  if (isKhelPage) {
    return <KhelPage content={content} query={searchParams} />
  }

  if (isNewsPage) {
    return <NewsPage content={content} query={searchParams} />
  }

  if (isNewsKhidkiPage) {
    return <NewsKhidkiPage content={content} query={searchParams} />
  }

  if (isSampadkiyaPage) {
    return <SampadkiyaPage content={content} query={searchParams} />
  }

  if (isSehatPage) {
    return <SehatPage content={content} query={searchParams} />
  }

  if (isSpecialPage) {
    return <SpecialPage content={content} query={searchParams} />
  }

  if (isTechnologyPage) {
    return <TechnologyPage content={content} query={searchParams} />
  }

  if (isVideshPage) {
    return <VideshPage content={content} query={searchParams} />
  }

  if (isRajyaPage) {
    return <RajyaPage content={content} query={searchParams} />
  }

  if (isRajnitiPage) {
    return <RajnitiPage content={content} query={searchParams} />
  }

  if (isExplainerPage) {
    return <ExplainerPage content={content} query={searchParams} />
  }

  if (isElectionPage) {
    return <ElectionPage content={content} query={searchParams} />
  }

  if (isPodcastPage) {
    return <PodcastPage content={content} query={searchParams} />
  }

  return <Home content={content} />
}

export default App
