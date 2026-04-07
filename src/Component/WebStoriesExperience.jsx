import { useEffect, useMemo, useState } from 'react'
import './WebStoriesSection.css'

function ArrowIcon({ direction = 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={
          direction === 'left'
            ? 'M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11l4.29 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z'
            : 'M9.3 18.7a1 1 0 0 1 0-1.4l4.29-4.3-4.29-4.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0Z'
        }
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.7 5.3a1 1 0 0 0-1.4 1.4L10.59 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.41l5.3 5.3a1 1 0 0 0 1.4-1.42L13.41 12l5.3-5.3a1 1 0 1 0-1.42-1.4L12 10.59 6.7 5.3Z" />
    </svg>
  )
}

function normalizePage(page = {}, fallback = {}) {
  return {
    id: page.id ?? page.slug ?? page.title ?? fallback.id,
    title: page.title ?? page.headline ?? fallback.title ?? '',
    subtitle: page.subtitle ?? page.description ?? page.summary ?? fallback.subtitle ?? '',
    kicker: page.kicker ?? page.label ?? '',
    imageUrl: page.imageUrl ?? page.image ?? page.thumbnailUrl ?? fallback.imageUrl ?? '',
    ctaLabel: page.ctaLabel ?? '',
    ctaHref: page.ctaHref ?? page.href ?? '',
  }
}

function normalizeStory(story = {}) {
  const pages = (story.pages ?? story.slides ?? story.storyPages ?? [])
    .map((page, index) =>
      normalizePage(page, {
        id: `${story.id ?? story.slug ?? story.title}-${index}`,
        title: story.title,
        subtitle: story.subtitle ?? story.summary ?? '',
        imageUrl: story.coverImageUrl ?? story.imageUrl ?? story.thumbnailUrl ?? '',
      }),
    )
    .filter((page) => page.id)

  return {
    id: story.id ?? story.slug ?? story.title,
    title: story.title ?? story.headline ?? '',
    coverImageUrl:
      story.coverImageUrl ?? story.thumbnailUrl ?? story.imageUrl ?? story.image ?? pages[0]?.imageUrl ?? '',
    href: story.href ?? story.url ?? '#',
    pages,
  }
}

export function normalizeWebStoriesContent(content = {}) {
  return {
    ariaLabel: content.ariaLabel ?? 'वेब स्टोरीज सेक्शन',
    title: content.title ?? content.heading ?? 'वेब स्टोरीज',
    stories: (content.stories ?? content.items ?? []).map(normalizeStory).filter((story) => story.id),
  }
}

function getHomeUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('story')
  url.searchParams.delete('page')
  return `${url.pathname}${url.search}`
}

function WebStoriesExperience({ content, storyId, embedded = false }) {
  const { stories } = useMemo(() => normalizeWebStoriesContent(content), [content])
  const initialStory = stories.find((story) => story.id === storyId) ?? stories[0]
  const [activeStoryId, setActiveStoryId] = useState(initialStory?.id ?? '')
  const [pageIndex, setPageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [transitionDirection, setTransitionDirection] = useState('forward')
  const activeStory = stories.find((story) => story.id === activeStoryId) ?? initialStory

  useEffect(() => {
    if (!activeStory) {
      return undefined
    }

    document.title = `${activeStory.title} | वेब स्टोरी`
  }, [activeStory])

  useEffect(() => {
    if (!activeStory) {
      setProgress(0)
      return undefined
    }

    setProgress(0)

    const intervalId = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          if (pageIndex < activeStory.pages.length - 1) {
            setPageIndex((value) => value + 1)
            return 0
          }

          return 100
        }

        return current + 2
      })
    }, 120)

    return () => window.clearInterval(intervalId)
  }, [activeStory, pageIndex])

  useEffect(() => {
    if (!activeStory) {
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set('story', activeStory.id)
    url.searchParams.set('page', String(pageIndex))
    window.history.replaceState({}, '', `${url.pathname}${url.search}`)
  }, [activeStory, pageIndex])

  useEffect(() => {
    if (!activeStory) {
      return
    }

    setActiveStoryId(activeStory.id)
    setPageIndex(0)
    setProgress(0)
  }, [storyId])

  if (!activeStory) {
    return null
  }

  const page = activeStory.pages[pageIndex]

  const handleClose = () => {
    if (embedded) {
      window.location.href = getHomeUrl()
      return
    }

    window.location.href = getHomeUrl()
  }

  const handleNext = () => {
    if (pageIndex < activeStory.pages.length - 1) {
      setTransitionDirection('forward')
      setPageIndex((value) => value + 1)
      setProgress(0)
    }
  }

  const handlePrev = () => {
    if (pageIndex > 0) {
      setTransitionDirection('backward')
      setPageIndex((value) => value - 1)
      setProgress(0)
    }
  }

  const handleOpenLink = () => {
    const link = page?.ctaHref || activeStory.href

    if (link && link !== '#') {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <main className="web-stories-page" aria-label={activeStory.title}>
      <div className="web-stories-page__shell">
        <div className="web-stories-viewer web-stories-viewer--page">
          <div className="web-stories-viewer__panel">
            <div className="web-stories-viewer__progress">
              {activeStory.pages.map((item, index) => (
                <span key={item.id} className="web-stories-viewer__progress-track">
                  <span
                    className="web-stories-viewer__progress-fill"
                    style={{
                      transform: `scaleX(${
                        index < pageIndex ? 1 : index === pageIndex ? progress / 100 : 0
                      })`,
                    }}
                  />
                </span>
              ))}
            </div>

            <button type="button" className="web-stories-viewer__close" onClick={handleClose} aria-label="स्टोरी बंद करें">
              <CloseIcon />
            </button>

            <div className="web-stories-viewer__story">
              <div
                key={page?.id}
                className={`web-stories-viewer__media web-stories-viewer__media--${transitionDirection}`}
              >
                {page?.imageUrl ? <img src={page.imageUrl} alt={page.title} loading="eager" /> : null}
                <div className="web-stories-viewer__overlay" />
                <div className="web-stories-viewer__copy">
                  {page?.kicker ? <span className="web-stories-viewer__kicker">{page.kicker}</span> : null}
                  <h3>{page?.title}</h3>
                  {page?.subtitle ? <p>{page.subtitle}</p> : null}
                  {page?.ctaHref || activeStory.href ? (
                    <button type="button" className="web-stories-viewer__cta" onClick={handleOpenLink}>
                      {page?.ctaLabel || 'पूरी खबर पढ़ें'}
                    </button>
                  ) : null}
                </div>
              </div>

              <button type="button" className="web-stories-viewer__nav is-left" onClick={handlePrev} aria-label="पिछली स्लाइड">
                <ArrowIcon direction="left" />
              </button>
              <button type="button" className="web-stories-viewer__nav is-right" onClick={handleNext} aria-label="अगली स्लाइड">
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default WebStoriesExperience
