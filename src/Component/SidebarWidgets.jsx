import { buildArticleHref, buildAuthorHref, getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'
import './SidebarWidgets.css'

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

function SidebarWidgets({
  sidebar,
  categoryTitle = 'कैटेगरीज़',
  subscribeTitle,
  showCategoryCount = false,
}) {
  const resolvedSidebar = sidebar ?? {}
  const relatedStories = resolvedSidebar.relatedStories ?? []
  const categories = resolvedSidebar.categories ?? []
  const subscribeBox = resolvedSidebar.subscribeBox ?? {}

  return (
    <>
      <div className="sidebar-widgets__group">
        {relatedStories.map((story) => {
          const href = resolveArticleHref(story)
          const linkBehavior = getLinkBehavior(href)

          return (
            <a key={story.id} className="sidebar-widgets__card" href={href} {...linkBehavior}>
              {story.imageUrl ? (
                <div className="sidebar-widgets__image">
                  <img src={story.imageUrl} alt={story.title} loading="lazy" />
                </div>
              ) : null}
              <div>
                <h4>{story.title}</h4>
                <p>
                  <span>
                    <UserIcon />
                    <a href={buildAuthorHref(story.author)}>{story.author}</a>
                  </span>
                  <span>
                    <CalendarIcon />
                    {story.date}
                  </span>
                </p>
              </div>
            </a>
          )
        })}
      </div>

      <section className="sidebar-widgets__subscribe">
        <h3>{subscribeTitle ?? subscribeBox.title}</h3>
        <input type="email" placeholder={subscribeBox.placeholder} />
        <button type="button">{subscribeBox.buttonLabel}</button>
      </section>

      <section className="sidebar-widgets__category-widget">
        <h3>{categoryTitle}</h3>
        <div className="sidebar-widgets__category-list">
          {categories.map((category) => (
            <a
              key={category.label}
              href={category.href ?? buildArticleHref(category.articleId ?? 'default')}
              className="sidebar-widgets__category-item"
            >
              {category.imageUrl ? (
                <div className="sidebar-widgets__category-image">
                  <img src={category.imageUrl} alt={category.label} loading="lazy" />
                </div>
              ) : null}
              <span className="sidebar-widgets__category-label">{category.label}</span>
              {showCategoryCount && category.count ? (
                <span className="sidebar-widgets__category-count">{category.count}</span>
              ) : null}
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

export default SidebarWidgets
