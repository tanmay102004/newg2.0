const PLACEHOLDER_HREFS = new Set(['', '#', '/'])

export function buildArticleHref(articleId = 'default') {
  return `/?article=${encodeURIComponent(articleId)}`
}

export function buildAuthorHref(authorName = '') {
  return `/?author=${encodeURIComponent(authorName)}`
}

export function buildTagHref(tagName = '') {
  return `/?tag=${encodeURIComponent(tagName)}`
}

export function isExternalHref(href = '') {
  return /^https?:\/\//i.test(href)
}

export function resolveArticleHref(item = {}) {
  const explicitHref = (item.href ?? item.url ?? '').trim()

  if (explicitHref && !PLACEHOLDER_HREFS.has(explicitHref)) {
    return explicitHref
  }

  const articleId = item.articleId ?? item.id ?? item.slug ?? 'default'

  return buildArticleHref(articleId)
}

export function getLinkBehavior(href = '') {
  if (isExternalHref(href)) {
    return {
      target: '_blank',
      rel: 'noreferrer',
    }
  }

  return {}
}
