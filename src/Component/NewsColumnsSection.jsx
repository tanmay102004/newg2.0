import { useMemo } from 'react'
import './NewsColumnsSection.css'
import { getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5a1 1 0 0 0 2 0c0-1.45 2.61-3 6-3s6 1.55 6 3a1 1 0 0 0 2 0c0-2.76-3.58-5-8-5Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8ZM6 6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1H6Z" />
    </svg>
  )
}

function normalizeStory(story = {}) {
  return {
    id: story.id ?? story.slug ?? story.title,
    title: story.title ?? story.headline ?? '',
    excerpt: story.excerpt ?? story.summary ?? story.description ?? '',
    author: story.author ?? story.writer ?? story.byline ?? '',
    date: story.date ?? story.publishedAt ?? '',
    href: story.href ?? story.url ?? '#',
    imageUrl: story.imageUrl ?? story.thumbnailUrl ?? story.image ?? '',
    imageAlt: story.imageAlt ?? story.title ?? '',
    tags: story.tags ?? [],
  }
}

function normalizeSidebarBlock(block = {}) {
  return {
    id: block.id ?? block.title,
    title: block.title ?? block.heading ?? '',
    story: normalizeStory(block.story ?? block.featuredStory ?? {}),
  }
}

function normalizeContent(content = {}) {
  return {
    ariaLabel: content.ariaLabel ?? 'मल्टी कॉलम न्यूज़ सेक्शन',
    leftTitle: content.leftTitle ?? content.mainTitle ?? 'खेल',
    stories: (content.stories ?? content.leftStories ?? []).map(normalizeStory).filter((item) => item.id),
    sidebarBlocks: (content.sidebarBlocks ?? content.rightBlocks ?? [])
      .map(normalizeSidebarBlock)
      .filter((item) => item.id),
  }
}

function MetaLine({ author, date }) {
  return (
    <div className="news-columns__meta">
      {author ? (
        <span>
          <UserIcon />
          {author}
        </span>
      ) : null}
      {date ? (
        <span>
          <CalendarIcon />
          {date}
        </span>
      ) : null}
    </div>
  )
}

function NewsColumnsSection({ content }) {
  const { ariaLabel, leftTitle, stories, sidebarBlocks } = useMemo(() => normalizeContent(content), [content])

  if (!stories.length && !sidebarBlocks.length) {
    return null
  }

  return (
    <section className="news-columns" aria-label={ariaLabel}>
      <div className="news-columns__main">
        <div className="news-columns__heading">
          <span className="news-columns__accent" aria-hidden="true" />
          <h2>{leftTitle}</h2>
        </div>

        <div className="news-columns__story-list">
          {stories.map((story) => {
            const href = resolveArticleHref(story)

            return (
              <a key={story.id} className="news-columns__story" href={href} {...getLinkBehavior(href)}>
                <div className="news-columns__story-media">
                  {story.imageUrl ? <img src={story.imageUrl} alt={story.imageAlt} loading="lazy" /> : null}
                  {story.tags?.length ? (
                    <div className="news-columns__tags">
                      {story.tags.slice(0, 2).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="news-columns__story-copy">
                  <h3>{story.title}</h3>
                  <MetaLine author={story.author} date={story.date} />
                  {story.excerpt ? <p>{story.excerpt}</p> : null}
                </div>
              </a>
            )
          })}
        </div>
      </div>

      <aside className="news-columns__sidebar">
        {sidebarBlocks.map((block) => (
          <section key={block.id} className="news-columns__sidebar-block">
            <div className="news-columns__sidebar-heading">
              <span className="news-columns__accent" aria-hidden="true" />
              <h3>{block.title}</h3>
            </div>

            {(() => {
              const href = resolveArticleHref(block.story)

              return (
                <a className="news-columns__sidebar-card" href={href} {...getLinkBehavior(href)}>
                  <div className="news-columns__sidebar-media">
                    {block.story.imageUrl ? (
                      <img src={block.story.imageUrl} alt={block.story.imageAlt} loading="lazy" />
                    ) : null}
                  </div>
                  <div className="news-columns__sidebar-copy">
                    <h4>{block.story.title}</h4>
                    {block.story.excerpt ? <p>{block.story.excerpt}</p> : null}
                    <MetaLine author={block.story.author} date={block.story.date} />
                  </div>
                </a>
              )
            })()}
          </section>
        ))}
      </aside>
    </section>
  )
}

export default NewsColumnsSection
