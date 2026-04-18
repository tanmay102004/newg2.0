import { clearHomepagePlacementsForSubmission } from './homepagePlacements'

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

function buildArticleBlocks(summary, contentBlocks) {
  const introBlock = summary
    ? [{ type: 'paragraph', content: summary }]
    : []

  return [
    ...introBlock,
    ...contentBlocks.map((block) => ({
      type: block.type === 'heading' ? 'heading' : 'paragraph',
      content: block.content,
    })),
  ]
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
  const nextSubmission = {
    ...submission,
    title: String(submission.title ?? '').trim(),
    summary: String(submission.summary ?? '').trim(),
    tags: Array.isArray(submission.tags)
      ? submission.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    contentBlocks: Array.isArray(submission.contentBlocks)
      ? submission.contentBlocks
          .map((block) => ({
            ...block,
            content: String(block.content ?? '').trim(),
          }))
          .filter((block) => block.content)
      : [],
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
    blocks: buildArticleBlocks(submission.summary, submission.contentBlocks),
    tags: submission.tags,
    categoryChips: storySections.slice(0, 2).map((section) => section.label),
    storySections,
    publishedIn: storySections,
    seo: {
      metaTitle: submission.seo?.metaTitle ?? '',
      metaDescription: submission.seo?.metaDescription ?? '',
      canonicalUrl: submission.seo?.canonicalUrl ?? '',
      focusKeyword: submission.seo?.focusKeyword ?? '',
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
      focusKeyword: submission.seo?.focusKeyword ?? '',
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
    seo: normalizeSeoData({}, seededSubmission),
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

export function deleteStorySubmission(submissionId) {
  const nextSubmissions = getStorySubmissions().filter((submission) => submission.id !== submissionId)

  clearHomepagePlacementsForSubmission(submissionId)
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
  tags,
}) {
  const normalizedTags = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const normalizedBlocks = contentBlocks
    .map((block) => ({
      ...block,
      content: block.content.trim(),
    }))
    .filter((block) => block.content)
  const storyId = `story-${Date.now()}`
  const storySlug = buildStorySlug(title)

  const nextSubmission = {
    id: storyId,
    articleId: storyId,
    slug: storySlug,
    reporter,
    targetPages,
    title: title.trim(),
    summary: summary.trim(),
    image: imageFile
      ? {
          type: 'upload',
          name: imageFile.name,
          mimeType: imageFile.mimeType,
          size: imageFile.size,
          previewUrl: imageFile.previewUrl,
        }
      : null,
    contentBlocks: normalizedBlocks,
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
    seo: normalizeSeoData({}, {
      image: imageFile
        ? {
            previewUrl: imageFile.previewUrl,
          }
        : null,
    }),
  }
  const normalizedSubmission = normalizeSubmission(nextSubmission)

  const nextSubmissions = [normalizedSubmission, ...getStorySubmissions()]
  writeSubmissions(nextSubmissions)

  return normalizedSubmission
}
