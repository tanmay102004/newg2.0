import FooterSection from '../Component/FooterSection'
import Navbar from '../Component/Navbar'
import SidebarWidgets from '../Component/SidebarWidgets'
import { getResolvedArticlePageContent } from '../data/articlePages'
import { defaultRajnitiPage } from '../data/rajnitiPage'
import { getResolvedNavItems } from '../utils/navigation'
import { buildAuthorHref, getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'
import StorySectionChips from '../Component/StorySectionChips'
import './BreakingPage.css'

const STORIES_PER_PAGE = 10

function parseStoryDate(value) {
  const timestamp = Date.parse(value ?? '')
  return Number.isNaN(timestamp) ? 0 : timestamp
}

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

function RajnitiPage({ content, query }) {
  const section = content.rajnitiPage ?? defaultRajnitiPage
  const page = Number.parseInt(query.get('page') ?? '1', 10)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const stories = [...(section.stories ?? [])].sort(
    (left, right) => parseStoryDate(right.publishedAt ?? right.date) - parseStoryDate(left.publishedAt ?? left.date),
  )
  const totalPages = Math.max(1, Math.ceil(stories.length / STORIES_PER_PAGE))
  const currentPage = Math.min(safePage, totalPages)
  const visibleStories = stories.slice((currentPage - 1) * STORIES_PER_PAGE, currentPage * STORIES_PER_PAGE)
  const sidebar =
    section.sidebar ??
    content.articleDetailSidebar ??
    content.articlePageSidebar ??
    content.articleSidebar ??
    getResolvedArticlePageContent('default', content).sidebar

  return (
    <main className="news-page breaking-page-shell" lang="hi">
      <Navbar
        navItems={getResolvedNavItems(content.navbar.items)}
        brand={content.brand}
        labels={content.navbar}
        activeItem="राजनीति"
      />

      <div className="breaking-page">
        <div className="breaking-page__layout">
          <section className="breaking-page__main">
            <header className="breaking-page__header">
              <h1>{section.title ?? 'राजनीति'}</h1>
            </header>

            <div className="breaking-page__grid">
              {visibleStories.map((story) => {
                const href = resolveArticleHref(story)
                const linkBehavior = getLinkBehavior(href)

                return (
                  <article key={story.id} className="breaking-page__card">
                    <a className="breaking-page__card-link" href={href} {...linkBehavior}>
                      {story.imageUrl ? (
                        <div
                          className="breaking-page__image"
                          style={{ '--breaking-image': `url(${story.imageUrl})` }}
                        >
                          <img src={story.imageUrl} alt={story.title} loading="lazy" />
                        </div>
                      ) : null}

                      <StorySectionChips
                        story={story}
                        limit={2}
                        wrapperClassName="breaking-page__chips"
                        itemClassName="breaking-page__chip"
                      />

                      <h2>{story.title}</h2>

                      <div className="breaking-page__meta">
                        <span>
                          <UserIcon />
                          <a className="breaking-page__author-link" href={buildAuthorHref(story.author)}>{story.author}</a>
                        </span>
                        <span>
                          <CalendarIcon />
                          {story.date}
                        </span>
                      </div>

                      {story.summary ? <p>{story.summary}</p> : null}
                    </a>

                    <a className="breaking-page__read-more" href={href} {...linkBehavior}>
                      {section.readMoreLabel ?? 'Read More'}
                      <span aria-hidden="true">›</span>
                    </a>
                  </article>
                )
              })}
            </div>

            <nav className="breaking-page__pagination" aria-label="Rajniti page navigation">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <a
                  key={pageNumber}
                  href={`/?rajniti=1&page=${pageNumber}`}
                  className={`breaking-page__page-link${pageNumber === currentPage ? ' is-active' : ''}`}
                >
                  {pageNumber}
                </a>
              ))}
            </nav>
          </section>

          <aside className="breaking-page__sidebar">
            <SidebarWidgets
              sidebar={sidebar}
              categoryTitle={section.categoryTitle ?? 'कैटेगरीज़'}
              subscribeTitle={section.subscribeTitle}
              showCategoryCount={true}
            />
          </aside>
        </div>
      </div>

      <FooterSection content={content.footerSection} />
    </main>
  )
}

export default RajnitiPage
