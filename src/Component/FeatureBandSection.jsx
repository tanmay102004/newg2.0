import { useMemo } from 'react'
import './FeatureBandSection.css'
import { buildAuthorHref, getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'

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

function normalizeCard(card = {}) {
  return {
    id: card.id ?? card.slug ?? card.title,
    title: card.title ?? card.headline ?? '',
    author: card.author ?? card.writer ?? card.byline ?? '',
    date: card.date ?? card.publishedAt ?? card.publishDate ?? '',
    href: card.href ?? card.url ?? '#',
    imageUrl: card.imageUrl ?? card.thumbnailUrl ?? card.image ?? card.poster ?? '',
    imageAlt: card.imageAlt ?? card.title ?? '',
  }
}

function normalizeContent(content = {}) {
  return {
    ariaLabel: content.ariaLabel ?? 'Feature band section',
    title: content.title ?? content.heading ?? 'मनोरंजन',
    titleHref: content.titleHref ?? content.href ?? '',
    items: (content.items ?? content.cards ?? []).map(normalizeCard).filter((item) => item.id),
  }
}

function FeatureBandSection({ content }) {
  const { ariaLabel, title, titleHref, items } = useMemo(() => normalizeContent(content), [content])

  if (!items.length) {
    return null
  }

  return (
    <section className="feature-band" aria-label={ariaLabel}>
      <div className="feature-band__inner">
        <div className="feature-band__heading">
          <span className="feature-band__accent" aria-hidden="true" />
          <h2>{titleHref ? <a href={titleHref}>{title}</a> : title}</h2>
        </div>

        <div className="feature-band__grid">
          {items.map((item) => {
            const href = resolveArticleHref(item)

            return (
              <a key={item.id} className="feature-band__card" href={href} {...getLinkBehavior(href)}>
                <div className="feature-band__media">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.imageAlt} loading="lazy" /> : null}
                </div>

                <div className="feature-band__copy">
                  <h3>{item.title}</h3>
                  <div className="feature-band__meta">
                    {item.author ? (
                      <span>
                        <UserIcon />
                        <a href={buildAuthorHref(item.author)}>{item.author}</a>
                      </span>
                    ) : null}
                    {item.date ? (
                      <span>
                        <CalendarIcon />
                        {item.date}
                      </span>
                    ) : null}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureBandSection
