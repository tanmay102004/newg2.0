import './NewsShowcase.css'
import { buildAuthorHref, getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'
import { resolveFixedSocialHref } from '../utils/socialLinks'
import StorySectionChips from './StorySectionChips'

function HeadingText({ title, href }) {
  if (!href) {
    return <h2>{title}</h2>
  }

  return (
    <h2>
      <a href={href}>{title}</a>
    </h2>
  )
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 3H22l-6.77 7.74L23 21h-6.11l-4.8-6.29L6.59 21H3.47l7.24-8.28L1 3h6.27l4.34 5.73L18.9 3Z" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.57c0-.93.26-1.56 1.58-1.56h1.69V4.15c-.82-.09-1.64-.14-2.46-.13-2.43 0-4.1 1.48-4.1 4.22v2.36H7.46v3.2h2.75V22h3.29Z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5A3.95 3.95 0 0 0 7.75 20.2h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5A3.95 3.95 0 0 0 16.25 3.8h-8.5Zm8.95 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.15 5.15 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.35 3.35 0 0 0 12 8.66Z" />
    </svg>
  )
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23 12.01s0-3.12-.4-4.63a3.03 3.03 0 0 0-2.13-2.14C18.96 4.83 12 4.83 12 4.83s-6.96 0-8.47.41A3.03 3.03 0 0 0 1.4 7.38C1 8.89 1 12.01 1 12.01s0 3.13.4 4.63a3.03 3.03 0 0 0 2.13 2.14c1.51.41 8.47.41 8.47.41s6.96 0 8.47-.41a3.03 3.03 0 0 0 2.13-2.14c.4-1.5.4-4.63.4-4.63ZM9.04 15.47V8.55l6.02 3.46-6.02 3.46Z" />
    </svg>
  )
}

function MetaRow({ author, date }) {
  return (
    <div className="news-showcase__meta">
      {author ? (
        <span>
          <a href={buildAuthorHref(author)}>{author}</a>
        </span>
      ) : null}
      {date ? <span>{date}</span> : null}
    </div>
  )
}

function CardImage({ story, featured = false }) {
  return (
    <div
      className={`news-showcase__image ${story.imageClass}${featured ? ' is-featured' : ''}`}
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
  )
}

function OverlayCard({ story }) {
  const href = resolveArticleHref(story)
  const linkBehavior = getLinkBehavior(href)

  return (
    <a className="news-showcase__featured-card" href={href} {...linkBehavior}>
      <CardImage story={story} featured />
      <div className="news-showcase__featured-content">
        <StorySectionChips story={story} wrapperClassName="news-showcase__tags" itemClassName="news-showcase__tag" />
        <h3 className="news-showcase__featured-title">{story.title}</h3>
        <MetaRow author={story.author} date={story.date} />
      </div>
    </a>
  )
}

function InlineCard({ story }) {
  const href = resolveArticleHref(story)
  const linkBehavior = getLinkBehavior(href)

  return (
    <a className="news-showcase__inline-card" href={href} {...linkBehavior}>
      <CardImage story={story} />
      <div className="news-showcase__inline-content">
        <StorySectionChips story={story} wrapperClassName="news-showcase__tags" itemClassName="news-showcase__tag" />
        <h3 className="news-showcase__inline-title">{story.title}</h3>
        <MetaRow author={story.author} date={story.date} />
      </div>
    </a>
  )
}

function SidebarCard({ story }) {
  const href = resolveArticleHref(story)
  const linkBehavior = getLinkBehavior(href)

  return (
    <a className="news-showcase__sidebar-feature" href={href} {...linkBehavior}>
      <CardImage story={story} featured />
      <div className="news-showcase__sidebar-feature-content">
        <StorySectionChips story={story} wrapperClassName="news-showcase__tags" itemClassName="news-showcase__tag" />
        <h3 className="news-showcase__sidebar-feature-title">{story.title}</h3>
        <MetaRow author={story.author} date={story.date} />
      </div>
    </a>
  )
}

function SidebarListItem({ story }) {
  const href = resolveArticleHref(story)
  const linkBehavior = getLinkBehavior(href)

  return (
    <a className="news-showcase__sidebar-item" href={href} {...linkBehavior}>
      <h4 className="news-showcase__sidebar-item-title">{story.title}</h4>
      <MetaRow author={story.author} date={story.date} />
    </a>
  )
}

const socialIconMap = {
  x: IconX,
  facebook: IconFacebook,
  instagram: IconInstagram,
  youtube: IconYoutube,
}

function SocialConnectBox({ content }) {
  return (
    <section className="news-showcase__social-box" aria-label={content.title}>
      <div className="news-showcase__section-heading news-showcase__section-heading--compact">
        <span className="news-showcase__heading-accent" aria-hidden="true" />
        <h2>{content.title}</h2>
      </div>

      <div className="news-showcase__social-list">
        {content.platforms.map((platform) => {
          const Icon = socialIconMap[platform.icon]

          return (
            <a
              key={platform.label}
              className={`news-showcase__social-link ${platform.className}`}
              href={resolveFixedSocialHref(platform)}
              aria-label={platform.label}
              target="_blank"
              rel="noreferrer"
            >
              <Icon />
            </a>
          )
        })}
      </div>
    </section>
  )
}

function NewsShowcase({ ariaLabel, content }) {
  const { leftSection, rightSection, socialConnect } = content

  return (
    <section className="news-showcase" aria-label={ariaLabel}>
      <div className="news-showcase__main">
        <div className="news-showcase__section-heading">
          <span className="news-showcase__heading-accent" aria-hidden="true" />
          <HeadingText title={leftSection.title} href={leftSection.titleHref} />
        </div>

        <div className="news-showcase__overlay-grid">
          {leftSection.featuredStories.map((story) => (
            <OverlayCard key={story.id} story={story} />
          ))}
        </div>

        <div className="news-showcase__inline-grid">
          {leftSection.secondaryStories.map((story) => (
            <InlineCard key={story.id} story={story} />
          ))}
        </div>
      </div>

      <aside className="news-showcase__sidebar">
        <SidebarCard story={rightSection.featuredStory} />

        <div className="news-showcase__sidebar-list">
          {rightSection.listStories.map((story) => (
            <SidebarListItem key={story.id} story={story} />
          ))}
        </div>

        <SocialConnectBox content={socialConnect} />
      </aside>
    </section>
  )
}

export default NewsShowcase
