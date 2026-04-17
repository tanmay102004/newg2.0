import { useEffect, useMemo, useState } from 'react'
import FooterSection from '../Component/FooterSection'
import Navbar from '../Component/Navbar'
import SidebarWidgets from '../Component/SidebarWidgets'
import { getResolvedArticlePageContent } from '../data/articlePages'
import { createComment, getComments } from '../services/commentsService'
import { getResolvedNavItems } from '../utils/navigation'
import { buildAuthorHref, getLinkBehavior, resolveArticleHref } from '../utils/articleRouting'
import './ArticlePage.css'

function ShareIcon({ type }) {
  const paths = {
    facebook:
      'M13.5 22v-8.2h2.75l.41-3.2H13.5V8.57c0-.93.26-1.56 1.58-1.56h1.69V4.15c-.82-.09-1.64-.14-2.46-.13-2.43 0-4.1 1.48-4.1 4.22v2.36H7.46v3.2h2.75V22h3.29Z',
    x: 'M18.9 3H22l-6.77 7.74L23 21h-6.11l-4.8-6.29L6.59 21H3.47l7.24-8.28L1 3h6.27l4.34 5.73L18.9 3Z',
    linkedin:
      'M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.96 1.96 0 1 0 5.3 6.9 1.96 1.96 0 0 0 5.25 3Zm13.17 9.44c0-2.95-1.58-4.32-3.68-4.32-1.7 0-2.46.94-2.88 1.6V8.5H8.48c.04.8 0 11.5 0 11.5h3.38v-6.42c0-.34.03-.68.12-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.88 1.02 1.88 2.52V20h3.38l-.02-7.56Z',
    whatsapp:
      'M20.52 3.48A11.88 11.88 0 0 0 12.06 0C5.5 0 .18 5.33.18 11.88c0 2.1.55 4.15 1.6 5.95L0 24l6.33-1.66a11.83 11.83 0 0 0 5.73 1.47h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.43-8.45ZM12.07 21.8a9.88 9.88 0 0 1-5.03-1.38l-.36-.22-3.76.99 1-3.66-.24-.38A9.83 9.83 0 0 1 2.2 11.88C2.2 6.43 6.62 2 12.07 2c2.63 0 5.11 1.02 6.97 2.89a9.8 9.8 0 0 1 2.88 6.98c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.39-1.46-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.91-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.43s1.06 2.81 1.2 3.01c.15.2 2.08 3.17 5.04 4.45.7.3 1.25.49 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.77-.72 2.03-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z',
    email: 'M3 5h18a1 1 0 0 1 .8 1.6l-9 12a1 1 0 0 1-1.6 0l-9-12A1 1 0 0 1 3 5Zm1.98 2 7.02 9.36L19.02 7H4.98Z',
    telegram:
      'M21.45 4.53 18.3 19.4c-.24 1.05-.87 1.3-1.76.81l-4.87-3.6-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.98 9.06-8.19c.39-.35-.08-.54-.61-.19l-11.2 7.06-4.82-1.51c-1.05-.33-1.07-1.05.22-1.55L20 2.8c.9-.33 1.69.22 1.45 1.73Z',
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[type] ?? paths.facebook} />
    </svg>
  )
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

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9h1.99v1.85L8.32 15H20V6H4Z" />
    </svg>
  )
}

function ArticleBodyBlock({ block }) {
  if (block.type === 'heading') {
    return <h2 className="article-page__body-heading">{block.content}</h2>
  }

  if (block.type === 'ordered-list') {
    return (
      <ol className="article-page__ordered-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    )
  }

  if (block.type === 'embed') {
    return (
      <div className="article-page__embed-card">
      <div className="article-page__embed-top">
        <div>
            <a href={buildAuthorHref(block.authorName)} className="article-page__author-link">
              <strong>{block.authorName}</strong>
            </a>
            <span>{block.handle}</span>
          </div>
          <span className="article-page__embed-badge">{block.platform?.toUpperCase()}</span>
        </div>
        <p>{block.body}</p>
        {block.imageUrl ? (
          <div className="article-page__embed-image">
            <img src={block.imageUrl} alt={block.authorName} loading="lazy" />
          </div>
        ) : null}
        {block.caption ? <span className="article-page__embed-caption">{block.caption}</span> : null}
      </div>
    )
  }

  return <p className="article-page__paragraph">{block.content}</p>
}

function buildShareHref(link, pageUrl, articleTitle) {
  const safeUrl = encodeURIComponent(pageUrl)
  const safeTitle = encodeURIComponent(articleTitle)

  switch (link.type) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${safeUrl}`
    case 'x':
      return `https://x.com/intent/post?url=${safeUrl}&text=${safeTitle}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${safeUrl}`
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${pageUrl}`)}`
    case 'email':
      return `mailto:?subject=${safeTitle}&body=${encodeURIComponent(`${articleTitle}\n\n${pageUrl}`)}`
    case 'telegram':
      return `https://t.me/share/url?url=${safeUrl}&text=${safeTitle}`
    default:
      return link.href ?? pageUrl
  }
}

function buildTagHref(tag) {
  return `/?tag=${encodeURIComponent(tag)}`
}

function formatCommentDate(value) {
  try {
    return new Intl.DateTimeFormat('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

function ArticlePage({ content, articleId }) {
  const article = getResolvedArticlePageContent(articleId, content)
  const [commentForm, setCommentForm] = useState({
    comment: '',
    name: '',
    email: '',
    website: '',
    remember: false,
  })
  const [comments, setComments] = useState([])
  const pageUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.href) {
      return window.location.href
    }

    const fallbackBase = 'https://newgindia.com/'
    return articleId ? `${fallbackBase}?article=${articleId}` : fallbackBase
  }, [articleId])

  const shareLinks = useMemo(
    () =>
      article.shareLinks.map((link) => ({
        ...link,
        href: buildShareHref(link, pageUrl, article.title),
      })),
    [article.shareLinks, article.title, pageUrl],
  )

  useEffect(() => {
    document.title = `${article.seo?.metaTitle || article.title} | ${content.brand?.title ?? 'न्यूज़ी इंडिया'}`
  }, [article.seo?.metaTitle, article.title, content.brand?.title])

  useEffect(() => {
    let isMounted = true

    getComments(article.id)
      .then((loadedComments) => {
        if (isMounted) {
          setComments(loadedComments)
        }
      })
      .catch(() => {
        if (isMounted) {
          setComments([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [article.id])

  const totalCommentCount = article.commentCount + comments.length

  function handleCommentFieldChange(event) {
    const { name, value, type, checked } = event.target

    setCommentForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleCommentSubmit(event) {
    event.preventDefault()

    if (!commentForm.comment.trim() || !commentForm.name.trim() || !commentForm.email.trim()) {
      return
    }

    const nextComment = {
      body: commentForm.comment.trim(),
      name: commentForm.name.trim(),
      email: commentForm.email.trim(),
      website: commentForm.website.trim(),
      createdAt: new Date().toISOString(),
    }

    const savedComment = await createComment(article.id, nextComment)
    setComments((current) => [savedComment, ...current])

    setCommentForm((current) => ({
      ...current,
      comment: '',
      name: current.remember ? current.name : '',
      email: current.remember ? current.email : '',
      website: current.remember ? current.website : '',
    }))
  }

  return (
    <main className="article-shell" lang="hi">
      <div className="news-page article-shell__frame">
        <Navbar navItems={getResolvedNavItems(content.navbar.items)} brand={content.brand} labels={content.navbar} />

        <div className="article-page">
          <div className="article-page__layout">
            <article className="article-page__main">
              <div className="article-page__chips">
                {article.categoryChips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>

              <header className="article-page__header">
                <h1>{article.title}</h1>
                {article.dek ? <p className="article-page__dek">{article.dek}</p> : null}

                <div className="article-page__meta-bar">
                  <div className="article-page__meta">
                    <span>
                      <UserIcon />
                      <a href={buildAuthorHref(article.author.name)} className="article-page__author-link">
                        {article.author.name}
                      </a>
                    </span>
                    <span>
                      <CalendarIcon />
                      {article.date}
                    </span>
                    <a href="#article-comments" className="article-page__comment-link">
                      <CommentIcon />
                      {totalCommentCount}
                    </a>
                  </div>

                  <div className="article-page__share">
                    <span>Share This Article:</span>
                    <div className="article-page__share-links">
                      {shareLinks.map((link) => (
                        <a
                          key={`${link.type}-${link.href}`}
                          href={link.href}
                          className={`article-page__share-link is-${link.type}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={link.label}
                        >
                          <ShareIcon type={link.type} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </header>

              <div className={`article-page__hero ${article.heroImageClass ?? ''}`}>
                {article.heroImageUrl ? (
                  <img src={article.heroImageUrl} alt={article.title} loading="eager" />
                ) : (
                  <div className="article-page__hero-fallback" aria-hidden="true" />
                )}
              </div>

              <div className="article-page__body">
                {article.blocks.filter((block) => block.type !== 'embed').map((block, index) => (
                  <ArticleBodyBlock key={`${block.type}-${index}`} block={block} />
                ))}
              </div>

              <section className="article-page__taxonomies">
                <div className="article-page__tags-box">
                  <strong>Tags :</strong>
                  <div className="article-page__tags">
                    {article.tags.map((tag) => (
                      <a key={tag} href={buildTagHref(tag)}>
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="article-page__share-inline">
                  {shareLinks.map((link) => (
                    <a
                      key={`inline-${link.type}-${link.href}`}
                      href={link.href}
                      className={`article-page__share-link is-${link.type}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                    >
                      <ShareIcon type={link.type} />
                    </a>
                  ))}
                </div>
              </section>

              <nav className="article-page__pager" aria-label="Article navigation">
                {[article.previousArticle, article.nextArticle].map((item, index) => {
                  const href = resolveArticleHref(item)
                  const linkBehavior = getLinkBehavior(href)
                  const isNext = index === 1

                  return (
                    <a
                      key={item.id}
                      className="article-page__pager-item"
                      href={href}
                      {...linkBehavior}
                    >
                      {item.imageUrl ? (
                        <span className="article-page__pager-image">
                          <img src={item.imageUrl} alt={item.title} loading="lazy" />
                        </span>
                      ) : null}
                      <div>
                        <span>{isNext ? 'Next Article' : 'Previous Article'}</span>
                        <strong>{item.title}</strong>
                      </div>
                    </a>
                  )
                })}
              </nav>

              <section className="article-page__author-box">
                <div className="article-page__author-avatar">
                  {article.author.name
                    .split(' ')
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div className="article-page__author-copy">
                  <h3>
                    <a href={buildAuthorHref(article.author.name)} className="article-page__author-link">
                      {article.author.name}
                    </a>
                  </h3>
                  <p className="article-page__author-email">{article.author.email}</p>
                  <p>{article.author.bio}</p>
                </div>
              </section>

              <section className="article-page__comments" id="article-comments">
                <h3>Leave a Reply</h3>
                <form className="article-page__comment-form" onSubmit={handleCommentSubmit}>
                  <p>Your email address will not be published. Required fields are marked *</p>
                  <label>
                    Comment *
                    <textarea
                      rows="7"
                      name="comment"
                      value={commentForm.comment}
                      onChange={handleCommentFieldChange}
                    />
                  </label>
                  <div className="article-page__comment-grid">
                    <label>
                      Name *
                      <input
                        type="text"
                        name="name"
                        value={commentForm.name}
                        onChange={handleCommentFieldChange}
                      />
                    </label>
                    <label>
                      Email *
                      <input
                        type="email"
                        name="email"
                        value={commentForm.email}
                        onChange={handleCommentFieldChange}
                      />
                    </label>
                    <label>
                      Website
                      <input
                        type="text"
                        name="website"
                        value={commentForm.website}
                        onChange={handleCommentFieldChange}
                      />
                    </label>
                  </div>
                  <label className="article-page__comment-check">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={commentForm.remember}
                      onChange={handleCommentFieldChange}
                    />
                    <span>Save my name, email, and website in this browser for the next time I comment.</span>
                  </label>
                  <button type="submit">Post Comment</button>
                </form>

                {comments.length ? (
                  <div className="article-page__comment-list" aria-label="User comments">
                    {comments.map((comment) => (
                      <article key={comment.id} className="article-page__comment-card">
                        <div className="article-page__comment-card-top">
                          <div className="article-page__comment-avatar" aria-hidden="true">
                            {comment.name
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div className="article-page__comment-card-meta">
                            <strong>{comment.name}</strong>
                            <span>{formatCommentDate(comment.createdAt)}</span>
                            {comment.website ? (
                              <a href={comment.website} target="_blank" rel="noreferrer">
                                {comment.website}
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <p>{comment.body}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            </article>

            <aside className="article-page__sidebar">
              <SidebarWidgets
                sidebar={article.sidebar}
                categoryTitle="कैटेगरीज़"
                showCategoryCount={false}
              />
            </aside>
          </div>
        </div>

        <FooterSection content={content.footerSection} />
      </div>
    </main>
  )
}

export default ArticlePage
