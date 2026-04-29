const PUBLICATION_ISSUES_KEY = 'newgindia.publication.issues'
export const PUBLICATION_ISSUES_CHANGE_EVENT = 'newgindia-publication-issues-change'

function getTodayDateValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function formatDisplayDate(dateValue) {
  const timestamp = Date.parse(dateValue)

  if (Number.isNaN(timestamp)) {
    return dateValue
  }

  return new Intl.DateTimeFormat('hi-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp))
}

function parseIssues(rawValue) {
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

function emitPublicationIssuesChange(issues) {
  window.dispatchEvent(
    new CustomEvent(PUBLICATION_ISSUES_CHANGE_EVENT, {
      detail: issues,
    }),
  )
}

function writeIssues(issues) {
  window.localStorage.setItem(PUBLICATION_ISSUES_KEY, JSON.stringify(issues))
  emitPublicationIssuesChange(issues)
}

function normalizeIssue(issue = {}) {
  return {
    id: issue.id ?? `issue-${Date.now()}`,
    type: issue.type === 'magazine' ? 'magazine' : 'epaper',
    date: issue.date ?? getTodayDateValue(),
    displayDate: issue.displayDate ?? formatDisplayDate(issue.date ?? getTodayDateValue()),
    edition: issue.edition ?? (issue.type === 'magazine' ? 'newg' : 'delhi'),
    section: issue.section ?? (issue.type === 'magazine' ? 'magazine' : 'main'),
    cityLabel: issue.cityLabel ?? (issue.type === 'magazine' ? 'NewG India' : 'दिल्ली'),
    sectionLabel: issue.sectionLabel ?? 'Magazine',
    headline: issue.headline ?? '',
    pageCount: Math.max(1, Number(issue.pageCount) || 1),
    pdfUrl: issue.pdfUrl ?? issue.fileUrl ?? '',
    fileName: issue.fileName ?? '',
    createdAt: issue.createdAt ?? new Date().toISOString(),
    uploadedBy: issue.uploadedBy ?? null,
  }
}

export function getPublicationIssues() {
  const savedIssues = parseIssues(window.localStorage.getItem(PUBLICATION_ISSUES_KEY))
  const normalizedIssues = savedIssues.map(normalizeIssue)

  if (JSON.stringify(savedIssues) !== JSON.stringify(normalizedIssues)) {
    writeIssues(normalizedIssues)
  }

  return normalizedIssues
}

export function createPublicationIssue({
  type = 'epaper',
  file,
  pageCount = 1,
  uploadedBy = null,
}) {
  const todayDate = getTodayDateValue()
  const issueType = type === 'magazine' ? 'magazine' : 'epaper'
  const nextIssue = normalizeIssue({
    id: `${issueType}-${todayDate}-${Date.now()}`,
    type: issueType,
    date: todayDate,
    displayDate: formatDisplayDate(todayDate),
    edition: issueType === 'magazine' ? 'newg' : 'delhi',
    section: issueType === 'magazine' ? 'magazine' : 'main',
    cityLabel: issueType === 'magazine' ? 'NewG India' : 'दिल्ली',
    sectionLabel: 'Magazine',
    headline:
      issueType === 'magazine'
        ? `NewG Magazine ${todayDate}`
        : `E-Paper ${todayDate}`,
    pageCount,
    pdfUrl: file?.previewUrl ?? '',
    fileName: file?.name ?? '',
    createdAt: new Date().toISOString(),
    uploadedBy,
  })

  const nextIssues = [
    nextIssue,
    ...getPublicationIssues().filter(
      (issue) =>
        !(
          issue.type === nextIssue.type &&
          issue.date === nextIssue.date &&
          issue.edition === nextIssue.edition &&
          issue.section === nextIssue.section
        ),
    ),
  ]

  writeIssues(nextIssues)
  return nextIssue
}

export function getPublicationIssuesForType(type) {
  return getPublicationIssues()
    .filter((issue) => issue.type === type)
    .sort((left, right) => String(right.date).localeCompare(String(left.date)))
}

export function applyPublicationIssuesToContent(content = {}) {
  const epaperIssues = getPublicationIssuesForType('epaper')
  const magazineIssues = getPublicationIssuesForType('magazine')
  const latestEpaperDate = epaperIssues[0]?.date
  const latestMagazineDate = magazineIssues[0]?.date

  return {
    ...content,
    epaperPage: {
      ...(content.epaperPage ?? {}),
      defaultDate: latestEpaperDate ?? content.epaperPage?.defaultDate ?? '',
      issues: [...epaperIssues, ...(content.epaperPage?.issues ?? [])],
    },
    magazinePage: {
      ...(content.magazinePage ?? {}),
      defaultDate: latestMagazineDate ?? content.magazinePage?.defaultDate ?? '',
      issues: [...magazineIssues, ...(content.magazinePage?.issues ?? [])],
    },
  }
}

export { PUBLICATION_ISSUES_KEY }
