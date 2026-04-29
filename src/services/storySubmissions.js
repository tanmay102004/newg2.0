import { clearHomepagePlacementsForSubmission } from './homepagePlacements'
import { clearSidebarPlacementsForSubmission } from './sidebarPlacements'

const STORY_SUBMISSIONS_KEY = 'newgindia.story.submissions'
export const STORY_SUBMISSIONS_CHANGE_EVENT = 'newgindia-story-submissions-change'
const PAGE_LABELS = {
  breaking: 'Breaking',
  desh: 'Desh',
  explainer: 'Explainer',
  election: 'Election',
  podcast: 'Podcast',
  videsh: 'Videsh',
  rajya: 'Rajya',
  rajniti: 'Rajniti',
  entertainment: 'Entertainment',
  education: 'Education',
  khel: 'Khel',
  news: 'News',
  technology: 'Technology',
  newsKhidki: 'News Khidki',
  special: 'Special',
  sehat: 'Sehat',
  sampadkiya: 'Sampadkiya',
  dharmaCulture: 'Dharma Culture',
}

function buildStorySlug(title = '') {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || `story-${Date.now()}`
}

function parseListItems(content = '') {
  return String(content)
    .split('\n')
    .map((item) => item.replace(/^[-*•\d.\s]+/, '').trim())
    .filter(Boolean)
}

function parseTableRows(content = '') {
  return String(content)
    .split('\n')
    .map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length)
}

function buildPublicBlocksFromDocumentBlocks(documentBlocks = []) {
  return documentBlocks.flatMap((block) => {
    if (block.type === 'title' || block.type === 'summary' || block.type === 'image') {
      return []
    }

    if (block.type === 'list') {
      const items = parseListItems(block.content)
      return items.length ? [{ type: 'list', items }] : []
    }

    if (block.type === 'table') {
      const rows = parseTableRows(block.content)
      return rows.length ? [{ type: 'table', rows }] : []
    }

    if (block.type === 'quote' || block.type === 'code' || block.type === 'details') {
      return [{ type: block.type, content: block.content }]
    }

    return [
      {
        type: block.type === 'heading' ? 'heading' : 'paragraph',
        content: block.content,
      },
    ]
  })
}

function normalizeDocumentBlocks(documentBlocks = []) {
  return documentBlocks
    .map((block, index) => {
      const nextType = String(block?.type ?? '').trim()

      if (!nextType) {
        return null
      }

      if (nextType === 'image') {
        const previewUrl = String(
          block?.image?.previewUrl ?? block?.previewUrl ?? block?.content ?? '',
        ).trim()

        if (!previewUrl) {
          return null
        }

        return {
          id: block?.id ?? `document-block-${index + 1}`,
          type: 'image',
          image: {
            type: block?.image?.type ?? block?.imageType ?? 'upload',
            name: block?.image?.name ?? block?.name ?? '',
            mimeType: block?.image?.mimeType ?? block?.mimeType ?? '',
            size: block?.image?.size ?? block?.size ?? 0,
            previewUrl,
          },
          caption: String(block?.caption ?? '').trim(),
        }
      }

      const normalizedContent = String(block?.content ?? '').trim()

      if (!normalizedContent) {
        return null
      }

      return {
        id: block?.id ?? `document-block-${index + 1}`,
        type: nextType,
        content: normalizedContent,
      }
    })
    .filter(Boolean)
}

function buildDocumentBlocksFromLegacy(submission = {}) {
  const documentBlocks = []

  if (submission.title) {
    documentBlocks.push({
      id: 'legacy-title-block',
      type: 'title',
      content: submission.title,
    })
  }

  if (submission.summary) {
    documentBlocks.push({
      id: 'legacy-summary-block',
      type: 'summary',
      content: submission.summary,
    })
  }

  if (submission.image?.previewUrl) {
    documentBlocks.push({
      id: 'legacy-image-block',
      type: 'image',
      image: {
        type: submission.image.type ?? 'upload',
        name: submission.image.name ?? '',
        mimeType: submission.image.mimeType ?? '',
        size: submission.image.size ?? 0,
        previewUrl: submission.image.previewUrl,
      },
      caption: submission.image.caption ?? '',
    })
  }

  ;(submission.contentBlocks ?? []).forEach((block, index) => {
    documentBlocks.push({
      id: block.id ?? `legacy-body-block-${index + 1}`,
      type: block.type === 'heading' ? 'heading' : 'paragraph',
      content: block.content ?? '',
    })
  })

  return normalizeDocumentBlocks(documentBlocks)
}

function deriveSubmissionFields(documentBlocks = [], fallbackSubmission = {}) {
  const normalizedBlocks = normalizeDocumentBlocks(documentBlocks)
  const titleBlock = normalizedBlocks.find((block) => block.type === 'title')
  const summaryBlock = normalizedBlocks.find((block) => block.type === 'summary')
  const imageBlock = normalizedBlocks.find((block) => block.type === 'image')
  const contentBlocks = normalizedBlocks
    .filter((block) => block.type !== 'title' && block.type !== 'summary' && block.type !== 'image')
    .map((block) => ({
      id: block.id,
      type: block.type,
      content: block.content,
    }))
  const fallbackBodySummary =
    contentBlocks.find((block) => block.type === 'paragraph' || block.type === 'quote')?.content ?? ''
  const normalizedFallbackSummary = String(fallbackSubmission.summary ?? '').trim()
  const derivedSummarySource =
    summaryBlock?.content || normalizedFallbackSummary || fallbackBodySummary
  const derivedSummary =
    derivedSummarySource && derivedSummarySource.length > 220
      ? `${derivedSummarySource.slice(0, 217).trim()}...`
      : derivedSummarySource

  return {
    documentBlocks: normalizedBlocks,
    title: titleBlock?.content ?? String(fallbackSubmission.title ?? '').trim(),
    summary: derivedSummary || fallbackBodySummary,
    image: imageBlock?.image
      ? {
          ...imageBlock.image,
          caption: imageBlock.caption ?? '',
        }
      : fallbackSubmission.image?.previewUrl
        ? {
            type: fallbackSubmission.image.type ?? 'upload',
            name: fallbackSubmission.image.name ?? '',
            mimeType: fallbackSubmission.image.mimeType ?? '',
            size: fallbackSubmission.image.size ?? 0,
            previewUrl: String(fallbackSubmission.image.previewUrl).trim(),
            caption: fallbackSubmission.image.caption ?? '',
          }
        : null,
    contentBlocks,
  }
}

function buildStorySections(targetPages = []) {
  return targetPages.map((page) => ({
    label: PAGE_LABELS[page] ?? page,
    href: `/?${page}=1`,
  }))
}

function nowIsoString() {
  return new Date().toISOString()
}

function normalizeSeoData(seo = {}, submission = {}) {
  return {
    metaTitle: String(seo.metaTitle ?? '').trim(),
    metaDescription: String(seo.metaDescription ?? '').trim(),
    canonicalUrl: String(seo.canonicalUrl ?? '').trim(),
    focusKeyword: String(seo.focusKeyword ?? '').trim(),
    ogTitle: String(seo.ogTitle ?? '').trim(),
    ogDescription: String(seo.ogDescription ?? '').trim(),
    ogImageUrl: String(seo.ogImageUrl ?? submission.image?.previewUrl ?? '').trim(),
    updatedAt: seo.updatedAt ?? null,
    updatedBy: seo.updatedBy ?? null,
  }
}

function isScheduledSubmissionDue(submission) {
  if (submission.status !== 'scheduled') {
    return false
  }

  const scheduledFor = submission.publishing?.scheduledFor

  if (!scheduledFor) {
    return false
  }

  return Date.parse(scheduledFor) <= Date.now()
}

function normalizeSubmission(submission) {
  const documentBlocksSource =
    Array.isArray(submission.documentBlocks) && submission.documentBlocks.length
      ? submission.documentBlocks
      : buildDocumentBlocksFromLegacy(submission)
  const derivedSubmissionFields = deriveSubmissionFields(documentBlocksSource, submission)

  const nextSubmission = {
    ...submission,
    title: derivedSubmissionFields.title,
    summary: derivedSubmissionFields.summary,
    tags: Array.isArray(submission.tags)
      ? submission.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    image: derivedSubmissionFields.image,
    contentBlocks: derivedSubmissionFields.contentBlocks,
    documentBlocks: derivedSubmissionFields.documentBlocks,
    editorReview: {
      state: submission.editorReview?.state ?? 'pending',
      reviewedAt: submission.editorReview?.reviewedAt ?? null,
      reviewer: submission.editorReview?.reviewer ?? null,
      notes: submission.editorReview?.notes ?? '',
    },
    publishing: {
      mode: submission.publishing?.mode ?? null,
      scheduledFor: submission.publishing?.scheduledFor ?? null,
      publishedAt: submission.publishing?.publishedAt ?? null,
    },
    seo: normalizeSeoData(submission.seo, submission),
  }

  if (isScheduledSubmissionDue(nextSubmission)) {
    nextSubmission.status = 'published'
    nextSubmission.publishing = {
      mode: 'scheduled',
      scheduledFor: nextSubmission.publishing.scheduledFor,
      publishedAt: nowIsoString(),
    }
    nextSubmission.editorReview = {
      ...nextSubmission.editorReview,
      state: 'approved',
      reviewedAt: nextSubmission.editorReview.reviewedAt ?? nowIsoString(),
    }
  }

  nextSubmission.publicArticle = buildPublicArticlePayload(nextSubmission)
  nextSubmission.publicStory = buildPublicStorySummary(nextSubmission)

  return nextSubmission
}

export function buildPublicArticlePayload(submission) {
  const storySections = buildStorySections(submission.targetPages)

  return {
    id: submission.id,
    articleId: submission.id,
    slug: submission.slug,
    title: submission.title,
    dek: submission.summary,
    summary: submission.summary,
    author: {
      name: submission.reporter.name || submission.reporter.email,
      email: submission.reporter.email,
      bio: submission.reporter.bio ?? '',
    },
    date: new Date(submission.submittedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    publishedAt: submission.submittedAt,
    heroImageUrl: submission.image?.previewUrl ?? '',
    heroImageClass: '',
    blocks: buildPublicBlocksFromDocumentBlocks(submission.documentBlocks ?? []),
    tags: submission.tags,
    categoryChips: storySections.slice(0, 2).map((section) => section.label),
    storySections,
    publishedIn: storySections,
    seo: {
      metaTitle: submission.seo?.metaTitle ?? '',
      metaDescription: submission.seo?.metaDescription ?? '',
      canonicalUrl: submission.seo?.canonicalUrl ?? '',
      ogTitle: submission.seo?.ogTitle ?? '',
      ogDescription: submission.seo?.ogDescription ?? '',
      ogImageUrl: submission.seo?.ogImageUrl ?? '',
    },
  }
}

export function buildPublicStorySummary(submission) {
  const storySections = buildStorySections(submission.targetPages)

  return {
    id: submission.id,
    articleId: submission.id,
    slug: submission.slug,
    title: submission.title,
    summary: submission.summary,
    author: submission.reporter.name || submission.reporter.email,
    authorBio: submission.reporter.bio ?? '',
    date: submission.submittedAt,
    publishedAt: submission.submittedAt,
    imageUrl: submission.image?.previewUrl ?? '',
    imageClass: '',
    tags: submission.tags,
    storySections,
    seo: {
      metaTitle: submission.seo?.metaTitle ?? '',
    },
  }
}

function getSeedStorySubmissions() {
  const seededSubmission = {
    id: 'story-seed-reporter-01',
    articleId: 'story-seed-reporter-01',
    slug: 'delhi-rain-waterlogging',
    reporter: {
      name: 'Riya Sharma',
      email: 'riya.sharma@newgindia.com',
      role: 'reporter',
      bio: 'Riya Sharma is a reporter at NewG India and focuses on ground reporting, civic issues, and stories from the capital.',
    },
    targetPages: ['desh', 'breaking'],
    title: 'दिल्ली में बारिश के बाद कई इलाकों में जलभराव',
    summary:
      'लगातार बारिश के बाद राजधानी के कई हिस्सों में पानी भर गया, जिससे यातायात प्रभावित हुआ और लोगों को परेशानी का सामना करना पड़ा।',
    image: null,
    contentBlocks: [
      {
        id: 'seed-heading-1',
        type: 'heading',
        content: 'यातायात पर असर',
      },
      {
        id: 'seed-paragraph-1',
        type: 'paragraph',
        content:
          'सुबह के समय कई मुख्य सड़कों पर लंबा जाम देखा गया। जलभराव की वजह से वाहन चालकों को वैकल्पिक मार्गों का इस्तेमाल करना पड़ा।',
      },
      {
        id: 'seed-heading-2',
        type: 'heading',
        content: 'स्थानीय लोगों की परेशानी',
      },
      {
        id: 'seed-paragraph-2',
        type: 'paragraph',
        content:
          'निचले इलाकों में रहने वाले लोगों ने बताया कि घरों और दुकानों के बाहर पानी जमा होने से दैनिक कामकाज प्रभावित हुआ।',
      },
    ],
    tags: ['दिल्ली', 'बारिश', 'जलभराव'],
    status: 'review_pending',
    submittedAt: '2026-04-13T09:30:00.000Z',
    editorReview: {
      state: 'pending',
      reviewedAt: null,
      reviewer: null,
      notes: '',
    },
    seo: normalizeSeoData({}),
  }

  seededSubmission.publicArticle = buildPublicArticlePayload(seededSubmission)
  seededSubmission.publicStory = buildPublicStorySummary(seededSubmission)

  return [seededSubmission]
}

function parseSubmissions(rawValue) {
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function emitStorySubmissionsChange(submissions) {
  window.dispatchEvent(
    new CustomEvent(STORY_SUBMISSIONS_CHANGE_EVENT, {
      detail: submissions,
    }),
  )
}

function writeSubmissions(submissions) {
  window.localStorage.setItem(STORY_SUBMISSIONS_KEY, JSON.stringify(submissions))
  emitStorySubmissionsChange(submissions)
}

export function getStorySubmissions() {
  const savedSubmissions = parseSubmissions(window.localStorage.getItem(STORY_SUBMISSIONS_KEY))

  if (savedSubmissions.length) {
    const normalizedSubmissions = savedSubmissions.map(normalizeSubmission)

    if (JSON.stringify(normalizedSubmissions) !== JSON.stringify(savedSubmissions)) {
      writeSubmissions(normalizedSubmissions)
    }

    return normalizedSubmissions
  }

  const seededSubmissions = getSeedStorySubmissions()
  writeSubmissions(seededSubmissions)
  return seededSubmissions
}

export function getReporterStorySubmissions(reporterEmail) {
  return getStorySubmissions().filter((submission) => submission.reporter.email === reporterEmail)
}

export function updateStorySubmission(submissionId, updates = {}) {
  const nextSubmissions = getStorySubmissions().map((submission) => {
    if (submission.id !== submissionId) {
      return submission
    }

    return normalizeSubmission({
      ...submission,
      ...updates,
    })
  })

  writeSubmissions(nextSubmissions)
  return nextSubmissions.find((submission) => submission.id === submissionId) ?? null
}

export function updateStorySubmissionStatus(submissionId, status, reviewer = null) {
  return updateStorySubmission(submissionId, {
    status,
    editorReview: {
      state: status === 'rejected' ? 'rejected' : status === 'published' ? 'approved' : 'pending',
      reviewedAt: new Date().toISOString(),
      reviewer,
      notes: '',
    },
  })
}

export function publishStorySubmission(submissionId, { mode = 'instant', scheduledFor = null, reviewer = null } = {}) {
  const nextPublishing =
    mode === 'scheduled'
      ? {
          mode: 'scheduled',
          scheduledFor,
          publishedAt: null,
        }
      : {
          mode: 'instant',
          scheduledFor: null,
          publishedAt: nowIsoString(),
        }

  return updateStorySubmission(submissionId, {
    status: mode === 'scheduled' ? 'scheduled' : 'published',
    editorReview: {
      state: 'approved',
      reviewedAt: nowIsoString(),
      reviewer,
      notes: '',
    },
    publishing: nextPublishing,
  })
}

export function getPublishedStorySubmissions() {
  return getStorySubmissions().filter((submission) => submission.status === 'published')
}

export function getPublishedArticlePages() {
  return getPublishedStorySubmissions().reduce((pages, submission) => {
    pages[submission.id] = submission.publicArticle
    return pages
  }, {})
}

export function getPublishedStorySummaries() {
  return getPublishedStorySubmissions().map((submission) => submission.publicStory)
}

export function updateStorySeo(submissionId, seoUpdates = {}, reviewer = null) {
  const currentSubmission = getStorySubmissions().find((submission) => submission.id === submissionId)

  if (!currentSubmission) {
    return null
  }

  const nextSeo = normalizeSeoData(
    {
      ...currentSubmission.seo,
      ...seoUpdates,
      updatedAt: nowIsoString(),
      updatedBy: reviewer,
    },
    currentSubmission,
  )

  return updateStorySubmission(submissionId, {
    seo: nextSeo,
  })
}

export function updateStorySeoArticleFields(
  submissionId,
  { title = '', summary = '', focusKeyword = '' } = {},
  reviewer = null,
) {
  const currentSubmission = getStorySubmissions().find((submission) => submission.id === submissionId)

  if (!currentSubmission) {
    return null
  }

  if (currentSubmission.status !== 'review_pending') {
    return null
  }

  const normalizedTitle = String(title).trim()
  const normalizedSummary = String(summary).trim()

  if (!normalizedTitle || !normalizedSummary) {
    return null
  }

  const currentDocumentBlocks = normalizeDocumentBlocks(
    currentSubmission.documentBlocks?.length
      ? currentSubmission.documentBlocks
      : buildDocumentBlocksFromLegacy(currentSubmission),
  )
  const currentTitleBlock = currentDocumentBlocks.find((block) => block.type === 'title')
  const currentSummaryBlock = currentDocumentBlocks.find((block) => block.type === 'summary')
  const bodyDocumentBlocks = currentDocumentBlocks.filter(
    (block) => block.type !== 'title' && block.type !== 'summary',
  )
  const nextDocumentBlocks = [
    {
      id: currentTitleBlock?.id ?? 'seo-title-block',
      type: 'title',
      content: normalizedTitle,
    },
    {
      id: currentSummaryBlock?.id ?? 'seo-summary-block',
      type: 'summary',
      content: normalizedSummary,
    },
    ...bodyDocumentBlocks,
  ]
  const nextSeo = normalizeSeoData(
    {
      ...currentSubmission.seo,
      focusKeyword: String(focusKeyword).trim(),
      updatedAt: nowIsoString(),
      updatedBy: reviewer,
    },
    currentSubmission,
  )

  return updateStorySubmission(submissionId, {
    title: normalizedTitle,
    summary: normalizedSummary,
    documentBlocks: nextDocumentBlocks,
    seo: nextSeo,
  })
}

export function deleteStorySubmission(submissionId) {
  const nextSubmissions = getStorySubmissions().filter((submission) => submission.id !== submissionId)

  clearHomepagePlacementsForSubmission(submissionId)
  clearSidebarPlacementsForSubmission(submissionId)
  writeSubmissions(nextSubmissions)

  return true
}

export function createStorySubmission({
  reporter,
  targetPages,
  title,
  summary,
  imageFile,
  contentBlocks,
  documentBlocks,
  tags,
  focusKeyword = '',
}) {
  const normalizedTags = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const normalizedDocumentBlocks =
    Array.isArray(documentBlocks) && documentBlocks.length
      ? normalizeDocumentBlocks(documentBlocks)
      : buildDocumentBlocksFromLegacy({
          title,
          summary,
          image: imageFile
            ? {
                type: 'upload',
                name: imageFile.name,
                mimeType: imageFile.mimeType,
                size: imageFile.size,
                previewUrl: imageFile.previewUrl,
              }
            : null,
          contentBlocks,
        })
  const derivedSubmissionFields = deriveSubmissionFields(normalizedDocumentBlocks, {
    title,
    summary,
    image: imageFile
      ? {
          type: 'upload',
          name: imageFile.name,
          mimeType: imageFile.mimeType,
          size: imageFile.size,
          previewUrl: imageFile.previewUrl,
        }
      : null,
  })
  const storyId = `story-${Date.now()}`
  const storySlug = buildStorySlug(derivedSubmissionFields.title)

  const nextSubmission = {
    id: storyId,
    articleId: storyId,
    slug: storySlug,
    reporter,
    targetPages,
    title: derivedSubmissionFields.title,
    summary: derivedSubmissionFields.summary,
    image: derivedSubmissionFields.image,
    contentBlocks: derivedSubmissionFields.contentBlocks,
    documentBlocks: derivedSubmissionFields.documentBlocks,
    tags: normalizedTags,
    status: 'review_pending',
    submittedAt: new Date().toISOString(),
    editorReview: {
      state: 'pending',
      reviewedAt: null,
      reviewer: null,
      notes: '',
    },
    publishing: {
      mode: null,
      scheduledFor: null,
      publishedAt: null,
    },
    seo: normalizeSeoData(
      {
        focusKeyword,
      },
      {
        image: derivedSubmissionFields.image
          ? {
              previewUrl: derivedSubmissionFields.image.previewUrl,
            }
          : null,
      },
    ),
  }
  const normalizedSubmission = normalizeSubmission(nextSubmission)

  const nextSubmissions = [normalizedSubmission, ...getStorySubmissions()]
  writeSubmissions(nextSubmissions)

  return normalizedSubmission
}

export function buildStoryPreviewSubmission({
  reporter,
  targetPages = [],
  title = '',
  summary = '',
  imageFile = null,
  contentBlocks = [],
  documentBlocks = [],
  tags = '',
  seo = {},
} = {}) {
  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(tags)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
  const normalizedDocumentBlocks =
    Array.isArray(documentBlocks) && documentBlocks.length
      ? normalizeDocumentBlocks(documentBlocks)
      : buildDocumentBlocksFromLegacy({
          title,
          summary,
          image: imageFile
            ? {
                type: 'upload',
                name: imageFile.name,
                mimeType: imageFile.mimeType,
                size: imageFile.size,
                previewUrl: imageFile.previewUrl,
              }
            : null,
          contentBlocks,
        })
  const derivedSubmissionFields = deriveSubmissionFields(normalizedDocumentBlocks, {
    title,
    summary,
    image: imageFile
      ? {
          type: 'upload',
          name: imageFile.name,
          mimeType: imageFile.mimeType,
          size: imageFile.size,
          previewUrl: imageFile.previewUrl,
        }
      : null,
  })
  const previewSubmission = normalizeSubmission({
    id: `preview-${Date.now()}`,
    articleId: `preview-${Date.now()}`,
    slug: buildStorySlug(derivedSubmissionFields.title),
    reporter: reporter ?? {
      name: 'Preview Reporter',
      email: 'preview@newgindia.com',
      bio: '',
    },
    targetPages,
    title: derivedSubmissionFields.title,
    summary: derivedSubmissionFields.summary,
    image: derivedSubmissionFields.image,
    contentBlocks: derivedSubmissionFields.contentBlocks,
    documentBlocks: derivedSubmissionFields.documentBlocks,
    tags: normalizedTags,
    status: 'preview',
    submittedAt: nowIsoString(),
    editorReview: {
      state: 'pending',
      reviewedAt: null,
      reviewer: null,
      notes: '',
    },
    publishing: {
      mode: null,
      scheduledFor: null,
      publishedAt: null,
    },
    seo: normalizeSeoData(seo, {
      image: derivedSubmissionFields.image,
    }),
  })

  return previewSubmission
}
