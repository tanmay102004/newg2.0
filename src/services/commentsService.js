const COMMENTS_API_URL = import.meta.env.VITE_COMMENTS_API_URL?.trim() ?? ''

function buildCommentStorageKey(articleId = 'default') {
  return `newg-comments-${articleId}`
}

function normalizeComment(comment = {}) {
  return {
    id: comment.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    body: comment.body ?? comment.comment ?? '',
    name: comment.name ?? comment.authorName ?? '',
    email: comment.email ?? '',
    website: comment.website ?? '',
    createdAt: comment.createdAt ?? comment.created_at ?? new Date().toISOString(),
  }
}

function loadLocalComments(articleId) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const savedComments = window.localStorage.getItem(buildCommentStorageKey(articleId))
    const parsedComments = savedComments ? JSON.parse(savedComments) : []
    return Array.isArray(parsedComments) ? parsedComments.map(normalizeComment) : []
  } catch {
    return []
  }
}

function saveLocalComments(articleId, comments) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(buildCommentStorageKey(articleId), JSON.stringify(comments))
}

async function loadApiComments(articleId) {
  const response = await fetch(`${COMMENTS_API_URL}?articleId=${encodeURIComponent(articleId)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch comments')
  }

  const data = await response.json()
  const items = Array.isArray(data?.comments) ? data.comments : Array.isArray(data) ? data : []
  return items.map(normalizeComment)
}

async function postApiComment(articleId, comment) {
  const response = await fetch(COMMENTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      articleId,
      ...comment,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit comment')
  }

  const data = await response.json()
  return normalizeComment(data?.comment ?? data)
}

export async function getComments(articleId) {
  if (!COMMENTS_API_URL) {
    return loadLocalComments(articleId)
  }

  try {
    return await loadApiComments(articleId)
  } catch {
    return loadLocalComments(articleId)
  }
}

export async function createComment(articleId, comment) {
  const normalizedComment = normalizeComment(comment)

  if (!COMMENTS_API_URL) {
    const nextComments = [normalizedComment, ...loadLocalComments(articleId)]
    saveLocalComments(articleId, nextComments)
    return normalizedComment
  }

  try {
    return await postApiComment(articleId, normalizedComment)
  } catch {
    const nextComments = [normalizedComment, ...loadLocalComments(articleId)]
    saveLocalComments(articleId, nextComments)
    return normalizedComment
  }
}
