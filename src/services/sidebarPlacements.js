const SIDEBAR_STORY_PLACEMENTS_KEY = 'newgindia.sidebar.story.placements'
export const SIDEBAR_STORY_PLACEMENTS_CHANGE_EVENT = 'newgindia-sidebar-story-placements-change'

export const SIDEBAR_STORY_PLACEMENT_SLOTS = [
  { key: 'relatedStory1', section: 'Sidebar Widgets', label: 'Related story 1' },
  { key: 'relatedStory2', section: 'Sidebar Widgets', label: 'Related story 2' },
  { key: 'relatedStory3', section: 'Sidebar Widgets', label: 'Related story 3' },
]

function parsePlacements(rawValue) {
  if (!rawValue) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawValue)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function emitSidebarPlacementsChange(placements) {
  window.dispatchEvent(
    new CustomEvent(SIDEBAR_STORY_PLACEMENTS_CHANGE_EVENT, {
      detail: placements,
    }),
  )
}

function writeSidebarPlacements(placements) {
  window.localStorage.setItem(SIDEBAR_STORY_PLACEMENTS_KEY, JSON.stringify(placements))
  emitSidebarPlacementsChange(placements)
}

function formatStoryDate(isoValue) {
  const value = isoValue || new Date().toISOString()

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildSidebarPlacementStory(submission) {
  const publishedAt =
    submission.publishing?.publishedAt ||
    submission.publishing?.scheduledFor ||
    submission.submittedAt

  return {
    id: submission.id,
    articleId: submission.articleId ?? submission.id,
    slug: submission.slug,
    title: submission.title,
    author: submission.reporter?.name || submission.reporter?.email || 'NewG India',
    date: formatStoryDate(publishedAt),
    imageUrl: submission.image?.previewUrl ?? submission.publicStory?.imageUrl ?? '',
    storySections:
      submission.publicStory?.storySections ??
      submission.publicArticle?.storySections ??
      [],
  }
}

export function getSidebarPlacements() {
  return parsePlacements(window.localStorage.getItem(SIDEBAR_STORY_PLACEMENTS_KEY))
}

export function setSidebarPlacementsForSubmission(submissionId, slotKeys = [], editor = null) {
  const currentPlacements = getSidebarPlacements()
  const normalizedSlotKeys = [...new Set(slotKeys.filter(Boolean))]
  const nextPlacements = Object.fromEntries(
    Object.entries(currentPlacements).filter(
      ([slotKey, placement]) =>
        placement?.submissionId !== submissionId && !normalizedSlotKeys.includes(slotKey),
    ),
  )

  normalizedSlotKeys.forEach((slotKey) => {
    nextPlacements[slotKey] = {
      slotKey,
      submissionId,
      updatedAt: new Date().toISOString(),
      editor,
    }
  })

  writeSidebarPlacements(nextPlacements)
  return nextPlacements
}

export function clearSidebarPlacementsForSubmission(submissionId) {
  const currentPlacements = getSidebarPlacements()
  const nextPlacements = Object.fromEntries(
    Object.entries(currentPlacements).filter(
      ([, placement]) => placement?.submissionId !== submissionId,
    ),
  )

  if (JSON.stringify(nextPlacements) !== JSON.stringify(currentPlacements)) {
    writeSidebarPlacements(nextPlacements)
  }

  return nextPlacements
}

export function applySidebarStoryPlacements(sidebar = {}, publishedSubmissions = []) {
  const placements = getSidebarPlacements()
  const publishedSubmissionMap = new Map(
    publishedSubmissions.map((submission) => [submission.id, submission]),
  )
  const relatedStories = [...(sidebar.relatedStories ?? [])]

  SIDEBAR_STORY_PLACEMENT_SLOTS.forEach((slot, index) => {
    const placement = placements[slot.key]
    const submission = publishedSubmissionMap.get(placement?.submissionId)

    if (!submission) {
      return
    }

    relatedStories[index] = buildSidebarPlacementStory(submission)
  })

  return {
    ...sidebar,
    relatedStories,
  }
}

export { SIDEBAR_STORY_PLACEMENTS_KEY }
