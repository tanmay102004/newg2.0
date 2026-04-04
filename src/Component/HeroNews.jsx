import './HeroNews.css'

function LiveBadge({ label }) {
  return (
    <span className="hero-news__live-badge">
      <span className="hero-news__live-dot" aria-hidden="true" />
      {label}
    </span>
  )
}

function StoryMedia({ story, large = false }) {
  if (story.type === 'video') {
    return (
      <div className={`hero-news__video-frame${large ? ' is-large' : ''}`}>
        <iframe
          src={story.videoEmbedUrl}
          title={story.videoTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        {story.duration ? <span className="hero-news__video-duration">{story.duration}</span> : null}
      </div>
    )
  }

  return (
    <div
      className={`hero-news__image ${story.imageClass}${large ? ' is-large' : ''}`}
      aria-hidden="true"
    />
  )
}

function SecondaryStory({ story }) {
  return (
    <article className="hero-news__story-card" key={story.id}>
      <StoryMedia story={story} />
      <div className="hero-news__story-content">
        {story.type === 'live' ? <LiveBadge label={story.liveLabel} /> : null}
        <h2 className="hero-news__story-title">{story.title}</h2>
        {story.summary ? <p className="hero-news__story-summary">{story.summary}</p> : null}
        {story.time ? <p className="hero-news__story-time">{story.time}</p> : null}
      </div>
    </article>
  )
}

function HeroNews({ ariaLabel, content }) {
  const { leadStory, sideStories } = content

  return (
    <section className="hero-news" aria-label={ariaLabel}>
      <article className="hero-news__lead">
        <StoryMedia story={leadStory} large />
        <div className="hero-news__lead-content">
          <h1 className="hero-news__lead-title">{leadStory.title}</h1>
          <p className="hero-news__lead-summary">{leadStory.summary}</p>
          <p className="hero-news__story-time">{leadStory.time}</p>
        </div>
      </article>

      <div className="hero-news__grid">
        {sideStories.map((story) => (
          <SecondaryStory key={story.id} story={story} />
        ))}
      </div>
    </section>
  )
}

export default HeroNews
