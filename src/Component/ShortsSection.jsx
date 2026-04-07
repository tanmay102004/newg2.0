import { useEffect, useMemo, useRef, useState } from 'react'
import TopStoriesBar from './TopStoriesBar'
import './ShortsSection.css'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.3-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

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

function extractYouTubeId(value = '') {
  if (!value) {
    return ''
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value
  }

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  return ''
}

function normalizeShortItem(item = {}) {
  const id = String(
    item.id ??
      item.shortId ??
      item.videoId ??
      item.youtubeId ??
      extractYouTubeId(item.watchUrl) ??
      extractYouTubeId(item.shortUrl) ??
      extractYouTubeId(item.youtubeUrl) ??
      extractYouTubeId(item.url) ??
      extractYouTubeId(item.embedUrl) ??
      '',
  )

  const embedUrl =
    item.embedUrl ??
    item.embed ??
    (id
      ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&playlist=${id}&loop=1`
      : '')

  return {
    id,
    title: item.title ?? item.headline ?? item.name ?? item.label ?? '',
    line: item.line ?? item.summary ?? item.description ?? item.excerpt ?? '',
    watchUrl:
      item.watchUrl ??
      item.shortUrl ??
      item.youtubeUrl ??
      item.url ??
      (id ? `https://www.youtube.com/shorts/${id}` : ''),
    embedUrl,
    thumbnailUrl:
      item.thumbnailUrl ??
      item.thumbnail ??
      item.poster ??
      item.posterUrl ??
      item.imageUrl ??
      item.coverImageUrl ??
      item.image ??
      (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''),
  }
}

function normalizeShortsSectionContent(content = {}) {
  return {
    tickerLabel: content.tickerLabel ?? content.stripLabel ?? 'शॉर्ट अपडेट',
    tickerAriaLabel: content.tickerAriaLabel ?? content.stripAriaLabel ?? 'शॉर्ट अपडेट',
    tickerStories: content.tickerStories ?? content.stripStories ?? [],
    heading: content.heading ?? 'शॉर्ट वीडियो',
    channelUrl: content.channelUrl ?? content.shortsUrl ?? content.sourceUrl ?? '#',
    channelLabel: content.channelLabel ?? 'सभी शॉर्ट्स देखें',
    items: (content.items ?? content.shorts ?? content.videos ?? []).map(normalizeShortItem).filter((item) => item.id),
  }
}

function ShortsCard({ item, isPlaying, onPlay }) {
  const embedSrc = `${item.embedUrl}${item.embedUrl.includes('?') ? '&' : '?'}autoplay=1`

  return (
    <article className="shorts-section__card">
      <div className="shorts-section__media">
        {isPlaying ? (
          <iframe
            key={item.id}
            title={item.title}
            src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="shorts-section__poster"
            onClick={() => onPlay(item.id)}
            aria-label={`${item.title} चलाएँ`}
          >
            <img src={item.thumbnailUrl} alt={item.title} loading="lazy" />
            <span className="shorts-section__play">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
    </article>
  )
}

function ShortsSection({ content }) {
  const { tickerLabel, tickerAriaLabel, tickerStories, heading, channelUrl, channelLabel, items } =
    useMemo(() => normalizeShortsSectionContent(content), [content])
  const [playingId, setPlayingId] = useState('')
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(items.length > 1)
  const railRef = useRef(null)

  useEffect(() => {
    setPlayingId('')
  }, [items.map((item) => item.id).join('|')])

  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return undefined
    }

    const updateScrollState = () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth
      setCanScrollLeft(rail.scrollLeft > 8)
      setCanScrollRight(maxScrollLeft - rail.scrollLeft > 8)
    }

    updateScrollState()
    rail.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      rail.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [items.map((item) => item.id).join('|')])

  if (!items.length) {
    return null
  }

  const scrollRail = (direction) => {
    if (!railRef.current) {
      return
    }

    railRef.current.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    })
  }

  return (
    <section className="shorts-section" aria-label={content?.ariaLabel ?? 'शॉर्ट वीडियो सेक्शन'}>
      <TopStoriesBar label={tickerLabel} ariaLabel={tickerAriaLabel} stories={tickerStories} />

      <div className="shorts-section__shell">
        <div className="shorts-section__header">
          <div className="shorts-section__title-block">
            <span className="shorts-section__accent" aria-hidden="true" />
            <h2>{heading}</h2>
          </div>

          <div className="shorts-section__actions">
            <a href={channelUrl} target="_blank" rel="noreferrer">
              {channelLabel}
            </a>
          </div>
        </div>

        <div className="shorts-section__rail-wrap">
          {canScrollLeft ? (
            <button
              type="button"
              className="shorts-section__edge-control is-left"
              onClick={() => scrollRail('left')}
              aria-label="बाएँ स्क्रोल करें"
            >
              <ArrowIcon direction="left" />
            </button>
          ) : null}

          <div className="shorts-section__rail" ref={railRef}>
            {items.map((item) => (
              <ShortsCard
                key={item.id}
                item={item}
                isPlaying={playingId === item.id}
                onPlay={setPlayingId}
              />
            ))}
          </div>

          {canScrollRight ? (
            <button
              type="button"
              className="shorts-section__edge-control is-right"
              onClick={() => scrollRail('right')}
              aria-label="दाएँ स्क्रोल करें"
            >
              <ArrowIcon direction="right" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default ShortsSection
