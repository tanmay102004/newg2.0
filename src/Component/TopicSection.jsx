import './TopicSection.css'

function MetaRow({ author, date }) {
  return (
    <div className="topic-section__meta">
      {author ? <span>{author}</span> : null}
      {date ? <span>{date}</span> : null}
    </div>
  )
}

function TagList({ tags }) {
  if (!tags?.length) {
    return null
  }

  return (
    <div className="topic-section__tags">
      {tags.map((tag) => (
        <span className="topic-section__tag" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  )
}

function StoryImage({ story, featured = false }) {
  return (
    <div className={`topic-section__image-wrap${featured ? ' is-featured' : ''}`}>
      <div
        className={`topic-section__image ${story.imageClass}${featured ? ' is-featured' : ''}`}
        aria-hidden="true"
      />
      <div className="topic-section__image-tags">
        <TagList tags={story.tags} />
      </div>
    </div>
  )
}

function FeaturedStory({ story }) {
  return (
    <article className="topic-section__featured-story">
      <StoryImage story={story} featured />
      <div className="topic-section__featured-content">
        <div className="topic-section__featured-copy">
          <h3 className="topic-section__featured-title">{story.title}</h3>
          {story.summary ? <p className="topic-section__summary">{story.summary}</p> : null}
          <MetaRow author={story.author} date={story.date} />
        </div>
      </div>
    </article>
  )
}

function CompactStory({ story }) {
  return (
    <article className="topic-section__compact-story">
      <StoryImage story={story} />
      <div className="topic-section__compact-content">
        <h4 className="topic-section__compact-title">{story.title}</h4>
        <MetaRow author={story.author} date={story.date} />
      </div>
    </article>
  )
}

function Column({ section, singleColumnList = false }) {
  const visibleStories = singleColumnList ? section.stories.slice(0, 2) : section.stories

  return (
    <div className="topic-section__column">
      <div className="topic-section__heading">
        <span className="topic-section__heading-accent" aria-hidden="true" />
        <h2>{section.title}</h2>
      </div>

      <FeaturedStory story={section.featuredStory} />

      <div
        className={`topic-section__compact-grid${singleColumnList ? ' topic-section__compact-grid--single' : ''}`}
      >
        {visibleStories.map((story) => (
          <CompactStory key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
}

function TopicSection({ ariaLabel, content }) {
  return (
    <section className="topic-section" aria-label={ariaLabel}>
      <Column section={content.leftSection} />
      <Column section={content.rightSection} singleColumnList />
    </section>
  )
}

export default TopicSection
