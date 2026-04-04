import { useEffect, useMemo, useState } from 'react'
import './VideoSection.css'

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15a4 4 0 0 0 4-4V5a4 4 0 1 0-8 0v6a4 4 0 0 0 4 4Zm7-4a1 1 0 1 0-2 0 5 5 0 1 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.7 3.9-6.7 3.9Z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.3-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
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

function extractStartTime(value = '') {
  if (!value) {
    return 0
  }

  const tMatch = value.match(/[?&]t=(\d+)/)
  if (tMatch?.[1]) {
    return Number(tMatch[1])
  }

  const startMatch = value.match(/[?&]start=(\d+)/)
  if (startMatch?.[1]) {
    return Number(startMatch[1])
  }

  return 0
}

function normalizeVideoItem(video, fallback = {}) {
  const rawLine =
    video?.line ??
    video?.description ??
    video?.summary ??
    video?.excerpt ??
    video?.subtitle ??
    video?.subheading ??
    fallback.line ??
    ''

  const rawSummary =
    video?.summary ??
    video?.description ??
    video?.excerpt ??
    video?.line ??
    video?.subtitle ??
    video?.subheading ??
    video?.content ??
    fallback.summary ??
    rawLine

  const id = String(
    video?.id ??
      video?.videoId ??
      extractYouTubeId(video?.watchUrl) ??
      extractYouTubeId(video?.youtubeUrl) ??
      extractYouTubeId(video?.url) ??
      extractYouTubeId(video?.embedUrl) ??
      fallback.id ??
      '',
  )

  const watchUrl =
    video?.watchUrl ??
    video?.youtubeUrl ??
    video?.url ??
    (id ? `https://youtu.be/${id}` : fallback.watchUrl ?? '')

  const embedUrl =
    video?.embedUrl ??
    video?.embed ??
    (id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : fallback.embedUrl ?? '')

  const thumbnailUrl =
    video?.thumbnailUrl ??
    video?.thumbnail ??
    video?.image ??
    video?.poster ??
    video?.thumb ??
    (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : fallback.thumbnailUrl ?? '')

  return {
    id: id || fallback.id || '',
    title:
      video?.title ??
      video?.headline ??
      video?.name ??
      video?.heading ??
      video?.label ??
      fallback.title ??
      '',
    line: rawLine,
    summary: rawSummary,
    watchUrl,
    embedUrl,
    thumbnailUrl,
    startTime:
      video?.startTime ??
      video?.start ??
      extractStartTime(video?.watchUrl) ??
      extractStartTime(video?.embedUrl) ??
      0,
    thumbnailLabel:
      video?.thumbnailLabel ?? video?.label ?? video?.category ?? fallback.thumbnailLabel ?? 'न्यूजी वीडियो',
    ctaLabel: video?.ctaLabel ?? fallback.ctaLabel ?? '',
  }
}

function normalizeVideoSectionContent(content = {}) {
  const rawFeatured =
    content.featuredVideo ??
    content.featured ??
    content.mainVideo ??
    content.main ??
    content.heroVideo ??
    {}

  const rawTopVideos =
    content.topVideos ??
    content.videos ??
    content.sidebarVideos ??
    content.latestVideos ??
    content.items ??
    []

  const explicitFeatured = normalizeVideoItem(rawFeatured)
  const topVideos = rawTopVideos
    .map((video) => normalizeVideoItem(video))
    .filter((video) => video.id || video.watchUrl || video.thumbnailUrl || video.title)

  const featuredVideo =
    explicitFeatured.id || explicitFeatured.watchUrl || explicitFeatured.title
      ? explicitFeatured
      : topVideos[0]

  return {
    heading: content.heading ?? content.title ?? 'वीडियो',
    channelLabel: content.channelLabel ?? content.channelText ?? 'यूट्यूब चैनल देखें',
    channelUrl: content.channelUrl ?? content.youtubeChannelUrl ?? content.channelLink ?? '#',
    channelCtaLabel: content.channelCtaLabel ?? 'हमसे यू-ट्यूब पर जुड़ें',
    featuredVideo,
    topVideos,
  }
}

function getVideoThumbnailCandidates(video = {}) {
  const customThumb =
    video.thumbnailUrl ?? video.thumbnail ?? video.image ?? video.poster ?? video.thumb ?? ''
  const id = video.id ?? ''

  const candidates = []

  if (customThumb) {
    candidates.push(customThumb)
  }

  if (id) {
    candidates.push(
      `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`,
      `https://i.ytimg.com/vi_webp/${id}/sddefault.webp`,
      `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp`,
      `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    )
  }

  return [...new Set(candidates.filter(Boolean))]
}

function VideoThumbnail({ video, className }) {
  const candidates = getVideoThumbnailCandidates(video)
  const [thumbIndex, setThumbIndex] = useState(0)

  useEffect(() => {
    setThumbIndex(0)
  }, [video?.id, video?.thumbnailUrl, video?.watchUrl])

  if (!candidates.length) {
    return <div className={`${className} video-section__thumb-fallback`} aria-hidden="true" />
  }

  const currentThumb = candidates[Math.min(thumbIndex, candidates.length - 1)]

  return (
    <img
      src={currentThumb}
      alt={video.title}
      className={className}
      loading="eager"
      decoding="async"
      referrerPolicy="strict-origin-when-cross-origin"
      onError={() => {
        setThumbIndex((currentIndex) =>
          currentIndex < candidates.length - 1 ? currentIndex + 1 : currentIndex,
        )
      }}
    />
  )
}

function SidebarVideoPreview({ video }) {
  return (
    <div className="video-section__thumb-shell" aria-hidden="true">
      <VideoThumbnail video={video} className="video-section__thumb" />
      <span className="video-section__thumb-overlay">
        <PlayIcon />
      </span>
    </div>
  )
}

function SidebarVideoItem({ video, isActive, onPreview }) {
  const cardLine = video.line || video.summary || ''

  if (video.watchUrl) {
    return (
      <article className={`video-section__item ${isActive ? 'is-active' : ''}`}>
        <a
          className="video-section__item-card"
          href={video.watchUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => onPreview(video)}
          aria-label={`${video.title} का वीडियो यूट्यूब पर खोलें`}
        >
          <SidebarVideoPreview video={video} />
          <div className="video-section__item-copy">
            <span className="video-section__item-title-button">{video.title}</span>
            {cardLine ? <span>{cardLine}</span> : null}
          </div>
        </a>
      </article>
    )
  }

  return (
    <article className={`video-section__item ${isActive ? 'is-active' : ''}`}>
      <button
        type="button"
        className="video-section__item-card"
        onClick={() => onPreview(video)}
        aria-label={`${video.title} का वीडियो देखें`}
      >
        <SidebarVideoPreview video={video} />
        <div className="video-section__item-copy">
          <span className="video-section__item-title-button">{video.title}</span>
          {cardLine ? <span>{cardLine}</span> : null}
        </div>
      </button>
    </article>
  )
}

function VideoSection({ ariaLabel, content }) {
  const { heading, channelLabel, channelUrl, channelCtaLabel, featuredVideo, topVideos } = useMemo(
    () => normalizeVideoSectionContent(content),
    [content],
  )
  const [activeVideo, setActiveVideo] = useState(featuredVideo)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!featuredVideo?.id && !featuredVideo?.title && !topVideos.length) {
    return null
  }

  useEffect(() => {
    setActiveVideo(featuredVideo)
    setIsPlaying(false)
  }, [featuredVideo?.id, featuredVideo?.watchUrl, featuredVideo?.title])

  const handleSelectVideo = (video) => {
    setActiveVideo(video)
    setIsPlaying(true)
  }

  return (
    <section className="video-section" aria-label={ariaLabel}>
      <div className="video-section__header">
        <div className="video-section__title-wrap">
          <MicrophoneIcon />
          <h2>{heading}</h2>
        </div>

        <a href={channelUrl} target="_blank" rel="noreferrer" className="video-section__channel-link">
          {channelLabel}
        </a>
      </div>

      <div className="video-section__body">
        <div className="video-section__featured">
          <div className="video-section__player-wrap">
            {isPlaying && activeVideo.embedUrl ? (
              <iframe
                key={activeVideo.id}
                title={activeVideo.title}
                src={`${activeVideo.embedUrl}${activeVideo.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <button
                type="button"
                className="video-section__poster"
                onClick={() => setIsPlaying(true)}
                aria-label={`${activeVideo.title} का वीडियो चलाएँ`}
              >
                <VideoThumbnail video={activeVideo} className="video-section__poster-image" />
                <span className="video-section__poster-play">
                  <PlayIcon />
                </span>
              </button>
            )}
          </div>

          <div className="video-section__featured-copy">
            <h3>{activeVideo.title}</h3>
            {activeVideo.summary ? <p>{activeVideo.summary}</p> : null}
            <a href={channelUrl} target="_blank" rel="noreferrer">
              <YouTubeIcon />
              {channelCtaLabel}
            </a>
          </div>
        </div>

        <aside className="video-section__sidebar">
          {topVideos.map((video) => (
            <SidebarVideoItem
              key={video.id}
              video={video}
              isActive={activeVideo.id === video.id}
              onPreview={handleSelectVideo}
            />
          ))}
        </aside>
      </div>
    </section>
  )
}

export default VideoSection
