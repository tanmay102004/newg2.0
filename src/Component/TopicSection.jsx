import './TopicSection.css'
import { buildAuthorHref, getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'
import StorySectionChips from './StorySectionChips'

function MetaRow({ author, date }) {
  return (
    <div className="topic-section__meta">
      {author ? (
        <span>
          <a href={buildAuthorHref(author)}>{author}</a>
        </span>
      ) : null}
      {date ? <span>{date}</span> : null}
    </div>
  )
}

function StoryImage({ story, featured = false }) {
  return (
    <div className={`topic-section__image-wrap${featured ? ' is-featured' : ''}`}>
      <div
        className={`topic-section__image ${story.imageClass}${featured ? ' is-featured' : ''}`}
        aria-hidden="true"
      >
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={story.imageAlt ?? story.title ?? ''}
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="topic-section__image-tags">
        <StorySectionChips story={story} wrapperClassName="topic-section__tags" itemClassName="topic-section__tag" />
      </div>
    </div>
  )
}

function FeaturedStory({ story }) {
  const href = resolveArticleHref(story)
  const linkBehavior = getLinkBehavior(href)

  return (
    <a className="topic-section__featured-story" href={href} {...linkBehavior}>
      <StoryImage story={story} featured />
      <div className="topic-section__featured-content">
        <div className="topic-section__featured-copy">
          <h3 className="topic-section__featured-title">{story.title}</h3>
          {story.summary ? <p className="topic-section__summary">{story.summary}</p> : null}
          <MetaRow author={story.author} date={story.date} />
        </div>
      </div>
    </a>
  )
}

function CompactStory({ story }) {
  const href = resolveArticleHref(story)
  const linkBehavior = getLinkBehavior(href)

  return (
    <a className="topic-section__compact-story" href={href} {...linkBehavior}>
      <StoryImage story={story} />
      <div className="topic-section__compact-content">
        <h4 className="topic-section__compact-title">{story.title}</h4>
        <MetaRow author={story.author} date={story.date} />
      </div>
    </a>
  )
}

function Column({ section, singleColumnList = false }) {
  const visibleStories = singleColumnList ? section.stories.slice(0, 2) : section.stories

  return (
    <div className="topic-section__column">
      <div className="topic-section__heading">
        <span className="topic-section__heading-accent" aria-hidden="true" />
        <h2>{section.titleHref ? <a href={section.titleHref}>{section.title}</a> : section.title}</h2>
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
