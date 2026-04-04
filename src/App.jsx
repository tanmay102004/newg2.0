import { useEffect, useState } from 'react'
import Home from './Pages/Home'
import { homePageContent, loadHomePageContent } from './services/contentSource'

function App() {
  const [content, setContent] = useState(homePageContent)

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

  return <Home content={content} />
}

export default App
