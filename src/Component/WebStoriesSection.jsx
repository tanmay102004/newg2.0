import { useEffect, useMemo, useRef, useState } from 'react'
import './WebStoriesSection.css'
import { normalizeWebStoriesContent } from './WebStoriesExperience'

function StoryCardImage({ story }) {
  const imageCandidates = useMemo(
    () =>
      [
        story.coverImageUrl,
        ...(story.pages ?? []).map((page) => page.imageUrl),
      ].filter(Boolean),
    [story],
  )
  const fallbackMarkup = <div className="web-stories__image-fallback" aria-hidden="true" />
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [imageCandidates])

  if (!imageCandidates.length) {
    return fallbackMarkup
  }

  return (
    <img
      src={imageCandidates[Math.min(activeImage, imageCandidates.length - 1)]}
      alt={story.title}
      loading="lazy"
      onError={() => {
        setActiveImage((current) =>
          current < imageCandidates.length - 1 ? current + 1 : current,
        )
      }}
    />
  )
}

function WebStoriesSection({ content }) {
  const { ariaLabel, title, stories } = useMemo(() => normalizeWebStoriesContent(content), [content])
  const railRef = useRef(null)

  const openStory = (storyId) => {
    const url = new URL(window.location.href)
    url.searchParams.set('story', storyId)
    url.searchParams.delete('page')
    window.open(`${url.pathname}${url.search}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    const rail = railRef.current

    if (!rail || stories.length < 2) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      const nextLeft = rail.scrollLeft + 260
      const maxLeft = rail.scrollWidth - rail.clientWidth

      rail.scrollTo({
        left: nextLeft >= maxLeft - 4 ? 0 : nextLeft,
        behavior: 'smooth',
      })
    }, 2000)

    return () => window.clearInterval(intervalId)
  }, [stories.length])

  if (!stories.length) {
    return null
  }

  return (
    <section className="web-stories" aria-label={ariaLabel}>
      <div className="web-stories__heading">
        <span className="web-stories__accent" aria-hidden="true" />
        <h2>{title}</h2>
      </div>

      <div className="web-stories__rail" ref={railRef}>
        {stories.map((story) => (
          <button key={story.id} type="button" className="web-stories__card" onClick={() => openStory(story.id)}>
            <div className="web-stories__image">
              <StoryCardImage story={story} />
            </div>
            <div className="web-stories__title">{story.title}</div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default WebStoriesSection
