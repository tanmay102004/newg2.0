import { useEffect, useState } from 'react'
import './EmployeeAuth.css'
import {
  logoutEmployee,
  navigateToEmployeePath,
  updateEmployeeSessionProfile,
} from '../services/employeeAuth'
import { getRoleDefinition, getRolePreviewCards } from '../services/employeeDashboard'
import {
  createEmployeeUser,
  getEmployeeUsers,
  updateEmployeeUserBio,
  updateEmployeeUserStatus,
} from '../services/employeeUsers'
import { reporterPublishPages } from '../data/reporterPublishPages'
import {
  buildStoryPreviewSubmission,
  createStorySubmission,
  deleteStorySubmission,
  getReporterStorySubmissions,
  getStorySubmissions,
  publishStorySubmission,
  STORY_SUBMISSIONS_CHANGE_EVENT,
  updateStorySeoArticleFields,
  updateStorySubmission,
  updateStorySubmissionStatus,
} from '../services/storySubmissions'
import {
  getHomepagePlacements,
  HOMEPAGE_PLACEMENT_SLOTS,
  HOMEPAGE_PLACEMENTS_CHANGE_EVENT,
  setHomepagePlacementsForSubmission,
} from '../services/homepagePlacements'
import {
  getSidebarPlacements,
  SIDEBAR_STORY_PLACEMENT_SLOTS,
  SIDEBAR_STORY_PLACEMENTS_CHANGE_EVENT,
  setSidebarPlacementsForSubmission,
} from '../services/sidebarPlacements'
import {
  createPublicationIssue,
  getPublicationIssuesForType,
  PUBLICATION_ISSUES_CHANGE_EVENT,
} from '../services/publicationIssues'

function createDocumentBlock(type, overrides = {}) {
  if (type === 'image') {
    return {
      id: overrides.id ?? `${type}-block-${Date.now()}`,
      type,
      image: overrides.image ?? null,
      caption: overrides.caption ?? '',
    }
  }

  return {
    id: overrides.id ?? `${type}-block-${Date.now()}`,
    type,
    content: overrides.content ?? '',
  }
}

function createInitialDocumentBlocks() {
  return [
    createDocumentBlock('title', {
      id: 'reporter-title-block',
      content: '',
    }),
  ]
}

function buildDocumentBlocksFromSubmission(submission = {}) {
  if (Array.isArray(submission.documentBlocks) && submission.documentBlocks.length) {
    return submission.documentBlocks.map((block, index) =>
      createDocumentBlock(block.type, {
        id: block.id ?? `document-block-${index + 1}`,
        content: block.content ?? '',
        image: block.image ?? null,
        caption: block.caption ?? block.image?.caption ?? '',
      }),
    )
  }

  const nextBlocks = []

  nextBlocks.push(
    createDocumentBlock('title', {
      id: 'legacy-title-block',
      content: submission.title ?? '',
    }),
  )
  nextBlocks.push(
    createDocumentBlock('summary', {
      id: 'legacy-summary-block',
      content: submission.summary ?? '',
    }),
  )

  if (submission.image?.previewUrl) {
    nextBlocks.push(
      createDocumentBlock('image', {
        id: 'legacy-image-block',
        image: submission.image,
        caption: submission.image.caption ?? '',
      }),
    )
  }

  if (Array.isArray(submission.contentBlocks) && submission.contentBlocks.length) {
    submission.contentBlocks.forEach((block, index) => {
      nextBlocks.push(
        createDocumentBlock(block.type === 'heading' ? 'heading' : 'paragraph', {
          id: block.id ?? `legacy-content-block-${index + 1}`,
          content: block.content ?? '',
        }),
      )
    })
  } else {
    nextBlocks.push(
      createDocumentBlock('paragraph', {
        id: 'legacy-content-block-1',
        content: '',
      }),
    )
  }

  return nextBlocks
}

function isBodyDocumentBlock(block) {
  return [
    'paragraph',
    'heading',
    'quote',
    'list',
    'code',
    'details',
    'table',
  ].includes(block?.type)
}

function buildSeoPreviewChecks(previewSubmission) {
  const title = previewSubmission?.title?.trim() ?? ''
  const summary = previewSubmission?.summary?.trim() ?? ''
  const focusKeyword = previewSubmission?.seo?.focusKeyword?.trim() ?? ''
  const ogImageUrl = previewSubmission?.seo?.ogImageUrl?.trim() ?? previewSubmission?.image?.previewUrl ?? ''

  return [
    {
      label: 'Visibility',
      value: title ? 'Good!' : 'Add a title',
      tone: title ? 'good' : 'warn',
    },
    {
      label: 'SEO Analysis',
      value:
        title && summary
          ? `${Math.min(100, 40 + Math.min(title.length, 60) / 2 + Math.min(summary.length, 120) / 3).toFixed(0)}/100`
          : '0/100',
      tone: title && summary ? 'good' : 'warn',
    },
    {
      label: 'Readability',
      value: summary || previewSubmission?.contentBlocks?.length ? 'Good!' : 'Needs body content',
      tone: summary || previewSubmission?.contentBlocks?.length ? 'good' : 'warn',
    },
    {
      label: 'Focus Keyphrase',
      value: focusKeyword || 'No focus keyphrase!',
      tone: focusKeyword ? 'good' : 'warn',
    },
    {
      label: 'Social',
      value: ogImageUrl ? 'Social image ready' : 'Missing social markup!',
      tone: ogImageUrl ? 'good' : 'warn',
    },
  ]
}

function EmployeeDashboardPage({ employeeSession, onLogout }) {
  const activeRole = getRoleDefinition(employeeSession.role)
  const roleCards = getRolePreviewCards(employeeSession.role)
  const [employees, setEmployees] = useState(getEmployeeUsers)
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'reporter',
  })
  const [reporterForm, setReporterForm] = useState({
    targetPages: [],
    documentBlocks: createInitialDocumentBlocks(),
    tags: '',
    focusKeyword: '',
  })
  const [adminAlert, setAdminAlert] = useState({ type: '', message: '' })
  const [reporterAlert, setReporterAlert] = useState({ type: '', message: '' })
  const [isReporterPreviewOpen, setIsReporterPreviewOpen] = useState(false)
  const [reporterSubmissions, setReporterSubmissions] = useState(() =>
    getReporterStorySubmissions(employeeSession.email),
  )
  const [editorSubmissions, setEditorSubmissions] = useState(getStorySubmissions)
  const [homepagePlacements, setHomepagePlacements] = useState(getHomepagePlacements)
  const [homepagePlacementSelections, setHomepagePlacementSelections] = useState({})
  const [openHomepagePlacementMenus, setOpenHomepagePlacementMenus] = useState({})
  const [sidebarPlacements, setSidebarPlacements] = useState(getSidebarPlacements)
  const [sidebarPlacementSelections, setSidebarPlacementSelections] = useState({})
  const [openSidebarPlacementMenus, setOpenSidebarPlacementMenus] = useState({})
  const [reporterBio, setReporterBio] = useState(employeeSession.bio ?? '')
  const [isEditingReporterBio, setIsEditingReporterBio] = useState(false)
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null)
  const [editingEditorSubmissionId, setEditingEditorSubmissionId] = useState(null)
  const [publishingSubmissionId, setPublishingSubmissionId] = useState(null)
  const [publishMode, setPublishMode] = useState('instant')
  const [scheduledPublishAt, setScheduledPublishAt] = useState('')
  const [openBlockInserter, setOpenBlockInserter] = useState(null)
  const [blockBrowser, setBlockBrowser] = useState({
    open: false,
    scope: null,
    index: null,
    tab: 'blocks',
  })
  const [editorEditForm, setEditorEditForm] = useState({
    tags: '',
    documentBlocks: [],
  })
  const [seoEditingSubmissionId, setSeoEditingSubmissionId] = useState(null)
  const [seoEditForm, setSeoEditForm] = useState({
    title: '',
    summary: '',
    focusKeyword: '',
  })
  const [publicationIssueForm, setPublicationIssueForm] = useState({
    type: 'epaper',
    file: null,
  })
  const [publicationIssues, setPublicationIssues] = useState(() => ({
    epaper: getPublicationIssuesForType('epaper'),
    magazine: getPublicationIssuesForType('magazine'),
  }))
  const isAdmin = employeeSession.role === 'admin'
  const isReporter = employeeSession.role === 'reporter'
  const isSeo = employeeSession.role === 'seo'
  const isEditor = employeeSession.role === 'editor'
  const managedRoleCards = roleCards.filter((role) => role.key !== 'admin')
  const nonAdminEmployees = employees.filter((employee) => employee.role !== 'admin')
  const activeEmployeeCount = nonAdminEmployees.filter((employee) => employee.status === 'active').length
  const seoArticleSubmissions = editorSubmissions
  const reporterDraftPreview = buildStoryPreviewSubmission({
    reporter: {
      name: employeeSession.name,
      email: employeeSession.email,
      role: employeeSession.role,
      bio: employeeSession.bio ?? '',
    },
    targetPages: reporterForm.targetPages,
    documentBlocks: reporterForm.documentBlocks
      .map((block) =>
        block.type === 'image'
          ? {
              ...block,
              caption: normalizeReporterText(block.caption ?? '').trim(),
            }
          : {
              ...block,
              content: normalizeReporterText(block.content ?? '').trim(),
            },
      )
      .filter((block) => (block.type === 'image' ? block.image?.previewUrl : block.content)),
    tags: normalizeReporterText(reporterForm.tags),
    seo: {
      focusKeyword: normalizeReporterText(reporterForm.focusKeyword),
    },
  })
  const reporterDraftPreviewUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?article=${encodeURIComponent(reporterDraftPreview.id)}`
      : `/?article=${encodeURIComponent(reporterDraftPreview.id)}`
  const reporterDraftSeoChecks = buildSeoPreviewChecks(reporterDraftPreview)
  const profileInitials = (employeeSession.name || employeeSession.email)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const homepagePlacementPreview = [
    {
      section: 'Hero News',
      slot: 'Hero lead story',
      title: 'दिल्ली में बारिश के बाद कई इलाकों में जलभराव, ट्रैफिक पर असर',
      reporter: 'Riya Sharma',
    },
    {
      section: 'News Showcase',
      slot: 'Showcase featured 1',
      title: 'कच्चे तेल की कीमतों में उछाल से बाजार पर दबाव, विशेषज्ञों की चेतावनी',
      reporter: 'Aman Verma',
    },
    {
      section: 'Topic Section',
      slot: 'Topic left lead',
      title: 'राजनीतिक हलचल के बीच विधानसभा रणनीति पर नई बैठकों का दौर',
      reporter: 'Neha Singh',
    },
    {
      section: 'Featured Section',
      slot: 'Featured card 1',
      title: 'मनोरंजन जगत में नई रिलीज के साथ बॉक्स ऑफिस पर बढ़ी हलचल',
      reporter: 'Riya Sharma',
    },
  ]

  function normalizeReporterText(value) {
    return value.replace(/\bINR\b/gi, '₹')
  }
  const sampleReporterSubmission = {
    id: 'sample-story-preview',
    reporter: {
      name: employeeSession.name,
      email: employeeSession.email,
      role: employeeSession.role,
      bio:
        employeeSession.bio ||
        'This reporter works on public-interest stories, ground reporting, and important civic developments for NewG India.',
    },
    targetPages: ['desh', 'breaking'],
    title: 'दिल्ली में बारिश के बाद कई इलाकों में जलभराव',
    summary:
      'लगातार बारिश के बाद राजधानी के कई हिस्सों में पानी भर गया, जिससे यातायात प्रभावित हुआ और लोगों को परेशानी का सामना करना पड़ा।',
    image: null,
    contentBlocks: [
      {
        id: 'sample-heading-1',
        type: 'heading',
        content: 'यातायात पर असर',
      },
      {
        id: 'sample-paragraph-1',
        type: 'paragraph',
        content:
          'सुबह के समय कई मुख्य सड़कों पर लंबा जाम देखा गया। जलभराव की वजह से वाहन चालकों को वैकल्पिक मार्गों का इस्तेमाल करना पड़ा।',
      },
      {
        id: 'sample-heading-2',
        type: 'heading',
        content: 'स्थानीय लोगों की परेशानी',
      },
      {
        id: 'sample-paragraph-2',
        type: 'paragraph',
        content:
          'निचले इलाकों में रहने वाले लोगों ने बताया कि घरों और दुकानों के बाहर पानी जमा होने से दैनिक कामकाज प्रभावित हुआ।',
      },
    ],
    tags: ['दिल्ली', 'बारिश', 'जलभराव'],
    status: 'review_pending',
    submittedAt: '2026-04-13T09:30:00.000Z',
  }
  const displayedReporterSubmissions = reporterSubmissions.length
    ? reporterSubmissions
    : [sampleReporterSubmission]
  const displayedEditorSubmissions = editorSubmissions.length
    ? editorSubmissions
    : [sampleReporterSubmission]

  const getReporterBlockLabel = (contentBlocks, block, index) => {
    if (block.type === 'title') {
      return 'Title'
    }

    if (block.type === 'summary') {
      return 'Short summary'
    }

    if (block.type === 'image') {
      const imageIndex =
        contentBlocks
          .slice(0, index + 1)
          .filter((entry) => entry.type === 'image').length

      return `Image ${imageIndex}`
    }

    if (block.type === 'heading') {
      const headingIndex =
        contentBlocks
          .slice(0, index + 1)
          .filter((entry) => entry.type === 'heading').length

      return `Subheading ${headingIndex}`
    }

    if (block.type === 'paragraph') {
      const paragraphIndex =
        contentBlocks
          .slice(0, index + 1)
          .filter((entry) => entry.type === 'paragraph').length

      return `Paragraph ${paragraphIndex}`
    }

    return `Content block ${index + 1}`
  }

  const formatSubmissionStatus = (status) => {
    if (status === 'review_pending') {
      return 'In review'
    }

    if (status === 'scheduled') {
      return 'Scheduled'
    }

    if (status === 'published') {
      return 'Published'
    }

    return status.replace('_', ' ')
  }

  const toggleSubmissionDetails = (submissionId) => {
    setExpandedSubmissionId((current) => (current === submissionId ? null : submissionId))
  }

  const openComposerInserter = (scope, index) => {
    setOpenBlockInserter((current) =>
      current?.scope === scope && current?.index === index
        ? null
        : { scope, index },
    )
  }

  const closeComposerInserter = () => {
    setOpenBlockInserter(null)
  }

  const openBlockBrowserPanel = (scope, index, tab = 'blocks') => {
    setBlockBrowser({
      open: true,
      scope,
      index,
      tab,
    })
    closeComposerInserter()
  }

  const closeBlockBrowserPanel = () => {
    setBlockBrowser({
      open: false,
      scope: null,
      index: null,
      tab: 'blocks',
    })
  }

  const startEditorSubmissionEdit = (submission) => {
    setEditingEditorSubmissionId(submission.id)
    setEditorEditForm({
      tags: (submission.tags ?? []).join(', '),
      documentBlocks: buildDocumentBlocksFromSubmission(submission),
    })
  }

  const cancelEditorSubmissionEdit = () => {
    setEditingEditorSubmissionId(null)
    closeComposerInserter()
    closeBlockBrowserPanel()
    setEditorEditForm({
      tags: '',
      documentBlocks: [],
    })
  }

  const openPublishOptions = (submissionId) => {
    setPublishingSubmissionId((current) => (current === submissionId ? null : submissionId))
    setPublishMode('instant')
    setScheduledPublishAt('')
  }

  const closePublishOptions = () => {
    setPublishingSubmissionId(null)
    setPublishMode('instant')
    setScheduledPublishAt('')
  }

  const handleEditorEditFieldChange = (field) => (event) => {
    setEditorEditForm((current) => ({
      ...current,
      [field]: field === 'tags' ? normalizeReporterText(event.target.value) : event.target.value,
    }))
  }

  const handleEditorBlockChange = (blockId, field) => (event) => {
    setEditorEditForm((current) => ({
      ...current,
      documentBlocks: current.documentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [field]:
                field === 'content' || field === 'caption'
                  ? normalizeReporterText(event.target.value)
                  : event.target.value,
            }
          : block,
      ),
    }))
  }

  const handleEditorDocumentImageChange = (blockId) => async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setEditorEditForm((current) => ({
        ...current,
        documentBlocks: current.documentBlocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                image: null,
                caption: '',
              }
            : block,
        ),
      }))
      return
    }

    const previewUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Unable to read selected image.'))
      reader.readAsDataURL(file)
    }).catch(() => null)

    if (!previewUrl) {
      setReporterAlert({
        type: 'error',
        message: 'Unable to load the selected image. Please try another file.',
      })
      return
    }

    setEditorEditForm((current) => ({
      ...current,
      documentBlocks: current.documentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              image: {
                type: 'upload',
                name: file.name,
                size: file.size,
                mimeType: file.type,
                previewUrl,
              },
            }
          : block,
      ),
    }))
  }

  const insertDocumentBlocksAtPosition = (blocks, blockDefinitions, insertAfterIndex, idPrefix) => {
    const nextBlocks = [...blocks]
    const createdBlocks = blockDefinitions.map((definition, definitionIndex) =>
      createDocumentBlock(definition.type, {
        id: `${idPrefix}-${Date.now()}-${blocks.length + definitionIndex + 1}`,
        content: definition.content ?? '',
        caption: definition.caption ?? '',
        image: definition.image ?? null,
      }),
    )

    if (insertAfterIndex === null || insertAfterIndex >= nextBlocks.length - 1) {
      nextBlocks.push(...createdBlocks)
      return nextBlocks
    }

    nextBlocks.splice(insertAfterIndex + 1, 0, ...createdBlocks)
    return nextBlocks
  }

  const handleEditorAddBlock = (type, insertAfterIndex = null) => {
    setEditorEditForm((current) => ({
      ...current,
      documentBlocks: insertDocumentBlocksAtPosition(
        current.documentBlocks,
        [{ type }],
        insertAfterIndex,
        'editor-block',
      ),
    }))
    closeComposerInserter()
  }

  const handleEditorAddPattern = (patternBlocks, insertAfterIndex = null) => {
    setEditorEditForm((current) => ({
      ...current,
      documentBlocks: insertDocumentBlocksAtPosition(
        current.documentBlocks,
        patternBlocks,
        insertAfterIndex,
        'editor-pattern',
      ),
    }))
    closeBlockBrowserPanel()
  }

  const handleEditorRemoveBlock = (blockId) => {
    setEditorEditForm((current) => ({
      ...current,
      documentBlocks: current.documentBlocks.find(
        (block) => block.id === blockId && block.type === 'title',
      )
        ? current.documentBlocks
        : current.documentBlocks.filter((block) => block.id !== blockId),
    }))
  }

  const handleEditorSubmissionSave = (submissionId) => {
    const normalizedTags = editorEditForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    const normalizedDocumentBlocks = editorEditForm.documentBlocks.filter((block) =>
      block.type === 'image' ? Boolean(block.image?.previewUrl) : Boolean(block.content?.trim()),
    )
    const normalizedTitle =
      normalizedDocumentBlocks.find((block) => block.type === 'title')?.content?.trim() ?? ''
    const normalizedBodyBlocks = normalizedDocumentBlocks.filter(
      (block) => isBodyDocumentBlock(block),
    )

    if (!normalizedTitle || !normalizedBodyBlocks.length) {
      return
    }

    const updatedSubmission = updateStorySubmission(submissionId, {
      tags: normalizedTags,
      documentBlocks: normalizedDocumentBlocks,
    })

    if (!updatedSubmission) {
      return
    }

    setEditorSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId ? updatedSubmission : submission,
      ),
    )
    cancelEditorSubmissionEdit()
  }

  const handleEditorSubmissionReject = (submissionId) => {
    const currentSubmission = editorSubmissions.find((submission) => submission.id === submissionId)

    if (!currentSubmission) {
      return
    }

    const nextStatus = currentSubmission.status === 'rejected' ? 'review_pending' : 'rejected'
    const updatedSubmission = updateStorySubmissionStatus(submissionId, nextStatus, {
      name: employeeSession.name,
      email: employeeSession.email,
    })

    if (!updatedSubmission) {
      return
    }

    setEditorSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId ? updatedSubmission : submission,
      ),
    )
    setReporterAlert({
      type: 'success',
      message:
        nextStatus === 'rejected'
          ? 'Article status updated to rejected.'
          : 'Article status restored to in review.',
    })
    cancelEditorSubmissionEdit()
  }

  const handleEditorSubmissionPublish = (submissionId) => {
    if (publishMode === 'scheduled' && !scheduledPublishAt) {
      return
    }

    const updatedSubmission = publishStorySubmission(submissionId, {
      mode: publishMode,
      scheduledFor:
        publishMode === 'scheduled'
          ? new Date(scheduledPublishAt).toISOString()
          : null,
      reviewer: {
        name: employeeSession.name,
        email: employeeSession.email,
      },
    })

    if (!updatedSubmission) {
      return
    }

    setEditorSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId ? updatedSubmission : submission,
      ),
    )
    setReporterAlert({
      type: 'success',
      message:
        publishMode === 'scheduled'
          ? 'Article scheduled successfully.'
          : 'Article published successfully.',
    })
    closePublishOptions()
  }

  const handleEditorSubmissionDelete = (submissionId) => {
    const currentSubmission = editorSubmissions.find((submission) => submission.id === submissionId)

    if (!currentSubmission || currentSubmission.status !== 'published') {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this published article? This action will also remove its homepage placement.',
    )

    if (!confirmed) {
      return
    }

    const didDelete = deleteStorySubmission(submissionId)

    if (!didDelete) {
      return
    }

    setEditorSubmissions((current) =>
      current.filter((submission) => submission.id !== submissionId),
    )
    setReporterSubmissions((current) =>
      current.filter((submission) => submission.id !== submissionId),
    )
    setExpandedSubmissionId((current) => (current === submissionId ? null : current))
    setPublishingSubmissionId((current) => (current === submissionId ? null : current))
    setEditingEditorSubmissionId((current) => (current === submissionId ? null : current))
    setHomepagePlacements(getHomepagePlacements())
    setReporterAlert({
      type: 'success',
      message: 'Published article deleted successfully.',
    })
  }

  useEffect(() => {
    if (!adminAlert.message) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setAdminAlert({ type: '', message: '' })
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [adminAlert])

  useEffect(() => {
    if (!reporterAlert.message) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setReporterAlert({ type: '', message: '' })
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [reporterAlert])

  useEffect(() => {
    setReporterBio(employeeSession.bio ?? '')
  }, [employeeSession.bio])

  useEffect(() => {
    const syncSubmissions = () => {
      setReporterSubmissions(getReporterStorySubmissions(employeeSession.email))
      setEditorSubmissions(getStorySubmissions())
    }

    const handleSubmissionChange = () => {
      syncSubmissions()
    }

    const handleStorage = (event) => {
      if (event.key === 'newgindia.story.submissions') {
        syncSubmissions()
      }
    }

    window.addEventListener(STORY_SUBMISSIONS_CHANGE_EVENT, handleSubmissionChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(STORY_SUBMISSIONS_CHANGE_EVENT, handleSubmissionChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [employeeSession.email])

  useEffect(() => {
    const syncHomepagePlacements = () => {
      setHomepagePlacements(getHomepagePlacements())
    }

    const handlePlacementChange = () => {
      syncHomepagePlacements()
    }

    const handleStorage = (event) => {
      if (event.key === 'newgindia.homepage.placements') {
        syncHomepagePlacements()
      }
    }

    window.addEventListener(HOMEPAGE_PLACEMENTS_CHANGE_EVENT, handlePlacementChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(HOMEPAGE_PLACEMENTS_CHANGE_EVENT, handlePlacementChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    setHomepagePlacementSelections(
      editorSubmissions.reduce((nextSelections, submission) => {
        nextSelections[submission.id] = getAssignedHomepageSlots(submission.id).map((slot) => slot.key)
        return nextSelections
      }, {}),
    )
  }, [homepagePlacements, editorSubmissions])

  useEffect(() => {
    const syncSidebarPlacements = () => {
      setSidebarPlacements(getSidebarPlacements())
    }

    const handlePlacementChange = () => {
      syncSidebarPlacements()
    }

    const handleStorage = (event) => {
      if (event.key === 'newgindia.sidebar.story.placements') {
        syncSidebarPlacements()
      }
    }

    window.addEventListener(SIDEBAR_STORY_PLACEMENTS_CHANGE_EVENT, handlePlacementChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(SIDEBAR_STORY_PLACEMENTS_CHANGE_EVENT, handlePlacementChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    setSidebarPlacementSelections(
      editorSubmissions.reduce((nextSelections, submission) => {
        nextSelections[submission.id] = getAssignedSidebarSlots(submission.id).map((slot) => slot.key)
        return nextSelections
      }, {}),
    )
  }, [sidebarPlacements, editorSubmissions])

  useEffect(() => {
    const handleIssuesChange = () => {
      syncPublicationIssues()
    }

    const handleStorage = (event) => {
      if (event.key === 'newgindia.publication.issues') {
        syncPublicationIssues()
      }
    }

    window.addEventListener(PUBLICATION_ISSUES_CHANGE_EVENT, handleIssuesChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(PUBLICATION_ISSUES_CHANGE_EVENT, handleIssuesChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const handleFieldChange = (field) => (event) => {
    setFormState((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleReporterFieldChange = (field) => (event) => {
    setReporterForm((current) => ({
      ...current,
      [field]: normalizeReporterText(event.target.value),
    }))
  }

  const handleReporterPageToggle = (pageValue) => {
    setReporterForm((current) => ({
      ...current,
      targetPages: current.targetPages.includes(pageValue)
        ? current.targetPages.filter((value) => value !== pageValue)
        : [...current.targetPages, pageValue],
    }))
  }

  const handleReporterDocumentImageChange = (blockId) => async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setReporterForm((current) => ({
        ...current,
        documentBlocks: current.documentBlocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                image: null,
                caption: '',
              }
            : block,
        ),
      }))
      return
    }

    const previewUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Unable to read selected image.'))
      reader.readAsDataURL(file)
    }).catch(() => null)

    if (!previewUrl) {
      setReporterAlert({
        type: 'error',
        message: 'Unable to load the selected image. Please try another file.',
      })
      return
    }

    setReporterForm((current) => ({
      ...current,
      documentBlocks: current.documentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              image: {
                type: 'upload',
                name: file.name,
                size: file.size,
                mimeType: file.type,
                previewUrl,
              },
            }
          : block,
      ),
    }))
  }

  const syncPublicationIssues = () => {
    setPublicationIssues({
      epaper: getPublicationIssuesForType('epaper'),
      magazine: getPublicationIssuesForType('magazine'),
    })
  }

  const handlePublicationIssueFieldChange = (field) => (event) => {
    setPublicationIssueForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handlePublicationIssueFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setPublicationIssueForm((current) => ({
        ...current,
        file: null,
      }))
      return
    }

    const previewUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Unable to read selected publication file.'))
      reader.readAsDataURL(file)
    }).catch(() => null)

    if (!previewUrl) {
      setReporterAlert({
        type: 'error',
        message: 'Unable to load the selected publication file. Please try again.',
      })
      return
    }

    setPublicationIssueForm((current) => ({
      ...current,
      file: {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        previewUrl,
      },
    }))
  }

  const handlePublicationIssueUpload = (event) => {
    event.preventDefault()

    if (!publicationIssueForm.file) {
      setReporterAlert({
        type: 'error',
        message: 'Please select the e-paper or magazine PDF before uploading.',
      })
      return
    }

    const nextIssue = createPublicationIssue({
      type: publicationIssueForm.type,
      file: publicationIssueForm.file,
      uploadedBy: {
        name: employeeSession.name,
        email: employeeSession.email,
      },
    })

    syncPublicationIssues()
    setPublicationIssueForm({
      type: publicationIssueForm.type,
      file: null,
    })
    setReporterAlert({
      type: 'success',
      message: `${
        nextIssue.type === 'magazine' ? 'E-magazine' : 'E-paper'
      } uploaded for ${nextIssue.displayDate}. The public issue date now matches the upload date.`,
    })
  }

  const handleReporterBlockChange = (blockId, field) => (event) => {
    setReporterForm((current) => ({
      ...current,
      documentBlocks: current.documentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [field]:
                field === 'content' || field === 'caption'
                  ? normalizeReporterText(event.target.value)
                  : event.target.value,
            }
          : block,
      ),
    }))
  }

  const handleAddReporterBlock = (type, insertAfterIndex = null) => {
    setReporterForm((current) => ({
      ...current,
      documentBlocks: insertDocumentBlocksAtPosition(
        current.documentBlocks,
        [{ type }],
        insertAfterIndex,
        'block',
      ),
    }))
    closeComposerInserter()
  }

  const handleAddReporterPattern = (patternBlocks, insertAfterIndex = null) => {
    setReporterForm((current) => ({
      ...current,
      documentBlocks: insertDocumentBlocksAtPosition(
        current.documentBlocks,
        patternBlocks,
        insertAfterIndex,
        'pattern-block',
      ),
    }))
    closeBlockBrowserPanel()
  }

  const handleRemoveReporterBlock = (blockId) => {
    setReporterForm((current) => ({
      ...current,
      documentBlocks: current.documentBlocks.find(
        (block) => block.id === blockId && block.type === 'title',
      )
        ? current.documentBlocks
        : current.documentBlocks.filter((block) => block.id !== blockId),
    }))
  }

  const handleCreateEmployee = (event) => {
    event.preventDefault()
    setAdminAlert({ type: '', message: '' })

    const normalizedName = formState.name.trim()
    const normalizedEmail = formState.email.trim().toLowerCase()
    const normalizedPassword = formState.password.trim()

    if (!normalizedName || !normalizedEmail || !normalizedPassword || !formState.role) {
      setAdminAlert({ type: 'error', message: 'Please complete all employee fields.' })
      return
    }

    const emailExists = employees.some((employee) => employee.email === normalizedEmail)

    if (emailExists) {
      setAdminAlert({
        type: 'error',
        message: 'This employee email already exists in the admin list.',
      })
      return
    }

    const nextEmployee = createEmployeeUser({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      role: formState.role,
    })

    setEmployees((current) => [nextEmployee, ...current])
    setFormState({
      name: '',
      email: '',
      password: '',
      role: 'reporter',
    })
    setAdminAlert({
      type: 'success',
      message: `${normalizedName} was added as a ${getRoleDefinition(formState.role).label} account.`,
    })
  }

  const handleReporterSubmit = (event) => {
    event.preventDefault()
    setReporterAlert({ type: '', message: '' })

    const normalizedDocumentBlocks = reporterForm.documentBlocks
      .map((block) =>
        block.type === 'image'
          ? {
              ...block,
              caption: normalizeReporterText(block.caption ?? '').trim(),
            }
          : {
              ...block,
              content: normalizeReporterText(block.content ?? '').trim(),
            },
      )
      .filter((block) => (block.type === 'image' ? block.image?.previewUrl : block.content))
    const normalizedTitle =
      normalizedDocumentBlocks.find((block) => block.type === 'title')?.content ?? ''
    const normalizedBodyBlocks = normalizedDocumentBlocks.filter(
      (block) => isBodyDocumentBlock(block),
    )

    if (
      !reporterForm.targetPages.length ||
      !normalizedTitle ||
      !normalizedBodyBlocks.length
    ) {
      setReporterAlert({
        type: 'error',
        message: 'Please complete the required story fields before sending to editor review.',
      })
      return
    }

    const nextSubmission = createStorySubmission({
      reporter: {
        name: employeeSession.name,
        email: employeeSession.email,
        role: employeeSession.role,
        bio: employeeSession.bio ?? '',
      },
      targetPages: reporterForm.targetPages,
      documentBlocks: normalizedDocumentBlocks,
      tags: normalizeReporterText(reporterForm.tags),
      focusKeyword: normalizeReporterText(reporterForm.focusKeyword),
    })

    setReporterSubmissions((current) => [nextSubmission, ...current])
    closeComposerInserter()
    closeBlockBrowserPanel()
    setReporterForm({
      targetPages: [],
      documentBlocks: createInitialDocumentBlocks(),
      tags: '',
      focusKeyword: '',
    })
    setReporterAlert({
      type: 'success',
      message: 'Report sent to the editor dashboard for review.',
    })
  }

  const handleLogout = () => {
    logoutEmployee()
    onLogout?.(null)
    navigateToEmployeePath('/login')
  }

  const handleReporterBioSave = () => {
    const normalizedBio = reporterBio.trim()
    const updatedEmployee = updateEmployeeUserBio(employeeSession.email, normalizedBio)
    const nextSession = updateEmployeeSessionProfile({
      bio: updatedEmployee?.bio ?? normalizedBio,
    })

    if (nextSession) {
      onLogout?.(nextSession)
    }

    setReporterBio(updatedEmployee?.bio ?? normalizedBio)
    setIsEditingReporterBio(false)
    setReporterAlert({
      type: 'success',
      message: normalizedBio
        ? 'Author bio updated successfully.'
        : 'Author bio cleared successfully.',
    })
  }

  const handleStatusToggle = (employeeId) => {
    setEmployees((current) => {
      const targetEmployee = current.find((employee) => employee.id === employeeId)

      if (!targetEmployee) {
        return current
      }

      const nextStatus = targetEmployee.status === 'active' ? 'inactive' : 'active'
      const nextEmployees = updateEmployeeUserStatus(employeeId, nextStatus)

      setAdminAlert({
        type: 'success',
        message: `${targetEmployee.name} is now ${nextStatus}. ${
          nextStatus === 'inactive'
            ? 'This employee can no longer log in.'
            : 'This employee can log in again.'
        }`,
      })

      return nextEmployees
    })
  }

  const getAssignedHomepageSlots = (submissionId) =>
    HOMEPAGE_PLACEMENT_SLOTS.filter(
      (slot) => homepagePlacements[slot.key]?.submissionId === submissionId,
    )

  const getAssignedSidebarSlots = (submissionId) =>
    SIDEBAR_STORY_PLACEMENT_SLOTS.filter(
      (slot) => sidebarPlacements[slot.key]?.submissionId === submissionId,
    )

  const handleHomepagePlacementToggle = (submissionId, slotKey) => () => {
    setHomepagePlacementSelections((current) => {
      const currentSelection = current[submissionId] ?? []
      const nextSelection = currentSelection.includes(slotKey)
        ? currentSelection.filter((value) => value !== slotKey)
        : [...currentSelection, slotKey]

      return {
        ...current,
        [submissionId]: nextSelection,
      }
    })
  }

  const handleHomepagePlacementApply = (submissionId) => {
    const selectedSlotKeys = homepagePlacementSelections[submissionId] ?? []

    setHomepagePlacements(
      setHomepagePlacementsForSubmission(
        submissionId,
        selectedSlotKeys,
        {
          name: employeeSession.name,
          email: employeeSession.email,
        },
      ),
    )
    setReporterAlert({
      type: 'success',
      message: selectedSlotKeys.length
        ? 'Homepage placement applied successfully.'
        : 'Homepage placement cleared.',
    })
    setOpenHomepagePlacementMenus((current) => ({
      ...current,
      [submissionId]: false,
    }))
  }

  const toggleHomepagePlacementMenu = (submissionId) => () => {
    setOpenHomepagePlacementMenus((current) => ({
      ...current,
      [submissionId]: !current[submissionId],
    }))
  }

  const handleSidebarPlacementToggle = (submissionId, slotKey) => () => {
    setSidebarPlacementSelections((current) => {
      const currentSelection = current[submissionId] ?? []
      const nextSelection = currentSelection.includes(slotKey)
        ? currentSelection.filter((value) => value !== slotKey)
        : [...currentSelection, slotKey]

      return {
        ...current,
        [submissionId]: nextSelection,
      }
    })
  }

  const handleSidebarPlacementApply = (submissionId) => {
    const selectedSlotKeys = sidebarPlacementSelections[submissionId] ?? []

    setSidebarPlacements(
      setSidebarPlacementsForSubmission(
        submissionId,
        selectedSlotKeys,
        {
          name: employeeSession.name,
          email: employeeSession.email,
        },
      ),
    )
    setReporterAlert({
      type: 'success',
      message: selectedSlotKeys.length
        ? 'Sidebar placement applied successfully.'
        : 'Sidebar placement cleared.',
    })
    setOpenSidebarPlacementMenus((current) => ({
      ...current,
      [submissionId]: false,
    }))
  }

  const toggleSidebarPlacementMenu = (submissionId) => () => {
    setOpenSidebarPlacementMenus((current) => ({
      ...current,
      [submissionId]: !current[submissionId],
    }))
  }

  const startSeoEdit = (submission) => {
    if (submission.status !== 'review_pending') {
      setReporterAlert({
        type: 'error',
        message: 'Published or scheduled articles cannot be edited by SEO.',
      })
      return
    }

    setSeoEditingSubmissionId(submission.id)
    setSeoEditForm({
      title: submission.title ?? '',
      summary: submission.summary ?? '',
      focusKeyword: submission.seo?.focusKeyword ?? '',
    })
  }

  const cancelSeoEdit = () => {
    setSeoEditingSubmissionId(null)
    setSeoEditForm({
      title: '',
      summary: '',
      focusKeyword: '',
    })
  }

  const handleSeoFieldChange = (field) => (event) => {
    setSeoEditForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSeoSave = (submissionId) => {
    const currentSubmission = editorSubmissions.find((submission) => submission.id === submissionId)

    if (!currentSubmission || currentSubmission.status !== 'review_pending') {
      setReporterAlert({
        type: 'error',
        message: 'Only articles in review can be edited by SEO.',
      })
      cancelSeoEdit()
      return
    }

    const updatedSubmission = updateStorySeoArticleFields(
      submissionId,
      {
        title: normalizeReporterText(seoEditForm.title).trim(),
        summary: normalizeReporterText(seoEditForm.summary).trim(),
        focusKeyword: seoEditForm.focusKeyword.trim(),
      },
      {
        name: employeeSession.name,
        email: employeeSession.email,
      },
    )

    if (!updatedSubmission) {
      return
    }

    setEditorSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId ? updatedSubmission : submission,
      ),
    )
    setReporterAlert({
      type: 'success',
      message: 'Article SEO changes saved successfully.',
    })
    cancelSeoEdit()
  }

  const blockPickerOptions = [
    {
      type: 'paragraph',
      label: 'Paragraph',
      description: 'Start with the basic building block of all narrative.',
      badge: 'P',
      group: 'Text',
    },
    {
      type: 'image',
      label: 'Image',
      description: 'Upload a story image that can also become the hero visual.',
      badge: 'I',
      group: 'Media',
    },
    {
      type: 'heading',
      label: 'Heading',
      description: 'Break the article into clear sections with subheadings.',
      badge: 'H',
      group: 'Text',
    },
    {
      type: 'summary',
      label: 'Summary',
      description: 'Add a short deck for cards, listings, and the public article intro.',
      badge: 'S',
      group: 'Text',
    },
  ]

  const blockBrowserOptions = [
    ...blockPickerOptions,
    {
      type: 'quote',
      label: 'Quote',
      description: 'Highlight a statement or strong line from the story.',
      badge: 'Q',
      group: 'Text',
    },
    {
      type: 'list',
      label: 'List',
      description: 'Write one item per line to publish a bullet list.',
      badge: 'L',
      group: 'Text',
    },
    {
      type: 'code',
      label: 'Code',
      description: 'Show code, data, or monospaced preformatted content.',
      badge: '</>',
      group: 'Text',
    },
    {
      type: 'details',
      label: 'Details',
      description: 'Create expandable supporting details for longer explanations.',
      badge: 'D',
      group: 'Text',
    },
    {
      type: 'table',
      label: 'Table',
      description: 'Use one row per line and separate cells with the | symbol.',
      badge: 'T',
      group: 'Media',
    },
  ]

  const blockPatternOptions = [
    {
      id: 'lead-story',
      label: 'Lead Story',
      description: 'Intro paragraph followed by a subheading and supporting paragraph.',
      blocks: [
        { type: 'paragraph' },
        { type: 'heading', content: 'Subheading' },
        { type: 'paragraph' },
      ],
    },
    {
      id: 'qa',
      label: 'Q&A Format',
      description: 'Two question-style headings with answer paragraphs.',
      blocks: [
        { type: 'heading', content: 'Question 1' },
        { type: 'paragraph' },
        { type: 'heading', content: 'Question 2' },
        { type: 'paragraph' },
      ],
    },
  ]

  const renderBlockInserter = (scope, insertAfterIndex, blocks, onAddBlock) => {
    const activeInserter =
      openBlockInserter?.scope === scope && openBlockInserter?.index === insertAfterIndex
    const availableOptions = blockPickerOptions.filter((option) => {
      if (option.type !== 'summary') {
        return true
      }

      return !blocks.some((block) => block.type === 'summary')
    })
    return (
      <div className="employee-dashboard__composer-inserter" key={`${scope}-${insertAfterIndex}`}>
        <button
          type="button"
          className="employee-dashboard__composer-plus"
          onClick={() => openComposerInserter(scope, insertAfterIndex)}
          aria-expanded={activeInserter}
          aria-label="Choose next block"
        >
          +
        </button>

        {activeInserter ? (
          <div className="employee-dashboard__composer-menu">
            <div className="employee-dashboard__composer-menu-grid">
              {availableOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  className="employee-dashboard__composer-menu-item"
                  onClick={() => onAddBlock(option.type, insertAfterIndex)}
                >
                  <span className="employee-dashboard__composer-menu-icon">{option.badge}</span>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="employee-dashboard__composer-browse"
              onClick={() => openBlockBrowserPanel(scope, insertAfterIndex, 'blocks')}
            >
              Browse all
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  const renderBlockBrowserPanel = ({
    scope,
    blocks,
    onAddBlock,
    onAddPattern,
  }) => {
    if (!blockBrowser.open || blockBrowser.scope !== scope) {
      return null
    }

    const availableOptions = blockBrowserOptions.filter((option) => {
      if (option.type !== 'summary') {
        return true
      }

      return !blocks.some((block) => block.type === 'summary')
    })
    const mediaOptions = availableOptions.filter((option) => option.group === 'Media')
    const textOptions = availableOptions.filter((option) => option.group === 'Text')

    return (
      <aside className="employee-dashboard__block-browser">
        <div className="employee-dashboard__block-browser-head">
          <div className="employee-dashboard__block-browser-tabs">
            {[['blocks', 'Blocks']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`employee-dashboard__block-browser-tab${
                  blockBrowser.tab === key ? ' employee-dashboard__block-browser-tab--active' : ''
                }`}
                onClick={() =>
                  setBlockBrowser((current) => ({
                    ...current,
                    tab: key,
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="employee-dashboard__block-browser-close"
            onClick={closeBlockBrowserPanel}
          >
            ×
          </button>
        </div>
        <div className="employee-dashboard__block-browser-body">
          <div className="employee-dashboard__block-browser-section">
            <span className="employee-dashboard__block-browser-label">TEXT</span>
            <div className="employee-dashboard__block-browser-grid">
              {textOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  className="employee-dashboard__block-browser-item"
                  onClick={() => {
                    onAddBlock(option.type, blockBrowser.index)
                    closeBlockBrowserPanel()
                  }}
                >
                  <span className="employee-dashboard__block-browser-item-icon">{option.badge}</span>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="employee-dashboard__block-browser-section">
            <span className="employee-dashboard__block-browser-label">MEDIA</span>
            <div className="employee-dashboard__block-browser-grid">
              {mediaOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  className="employee-dashboard__block-browser-item"
                  onClick={() => {
                    onAddBlock(option.type, blockBrowser.index)
                    closeBlockBrowserPanel()
                  }}
                >
                  <span className="employee-dashboard__block-browser-item-icon">{option.badge}</span>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    )
  }

  const renderDocumentBlockEditor = (
    blocks,
    block,
    index,
    onBlockChange,
    onImageChange,
    onRemoveBlock,
  ) => {
    const isLockedBlock = block.type === 'title'

    return (
      <div
        key={block.id}
        className={`employee-dashboard__composer-block employee-dashboard__composer-block--${block.type}`}
      >
        {block.type !== 'title' ? (
          <div className="employee-dashboard__composer-block-head">
            <span>{getReporterBlockLabel(blocks, block, index)}</span>
            {!isLockedBlock ? (
              <button
                type="button"
                className="employee-dashboard__remove-button"
                onClick={() => onRemoveBlock(block.id)}
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}

        {block.type === 'image' ? (
          <div className="employee-dashboard__composer-image-card">
            {block.image?.previewUrl ? (
              <img
                src={block.image.previewUrl}
                alt={block.image.name || 'Selected story visual'}
                className="employee-dashboard__composer-image-preview"
              />
            ) : (
              <div className="employee-dashboard__composer-image-placeholder">
                <strong>Upload story image</strong>
                <span>The first image block becomes the public article hero image.</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={onImageChange(block.id)} />
            <textarea
              rows="2"
              placeholder="Write image caption"
              value={block.caption ?? ''}
              onChange={onBlockChange(block.id, 'caption')}
              lang="hi"
              dir="auto"
            />
          </div>
        ) : (
          <textarea
            rows={
              block.type === 'title'
                ? 2
                : block.type === 'summary'
                  ? 3
                  : block.type === 'heading'
                    ? 2
                    : block.type === 'code' || block.type === 'table'
                      ? 5
                      : block.type === 'details'
                        ? 3
                    : 6
            }
            placeholder={
              block.type === 'title'
                ? 'Add title'
                : block.type === 'summary'
                  ? 'Add short summary'
                  : block.type === 'heading'
                    ? 'Write subheading'
                    : block.type === 'quote'
                      ? 'Write quote'
                      : block.type === 'list'
                        ? 'Write one item per line'
                        : block.type === 'code'
                          ? 'Write code or preformatted content'
                          : block.type === 'details'
                            ? 'Write expandable details'
                            : block.type === 'table'
                              ? 'Write one row per line, use | between cells'
                    : 'Start writing your article'
            }
            value={block.content ?? ''}
            onChange={onBlockChange(block.id, 'content')}
            lang="hi"
            dir="auto"
            className={`employee-dashboard__composer-input employee-dashboard__composer-input--${block.type}`}
          />
        )}
      </div>
    )
  }

  const renderDocumentComposer = ({
    scope,
    blocks,
    onBlockChange,
    onImageChange,
    onRemoveBlock,
    onAddBlock,
    onAddPattern,
  }) => (
    <div className="employee-dashboard__composer">
      {renderBlockBrowserPanel({
        scope,
        blocks,
        onAddBlock,
        onAddPattern,
      })}
      <div className="employee-dashboard__composer-page">
        <div className="employee-dashboard__composer-canvas">
          {blocks.map((block, index) => (
            <div key={block.id} className="employee-dashboard__composer-segment">
              {renderDocumentBlockEditor(
                blocks,
                block,
                index,
                onBlockChange,
                onImageChange,
                onRemoveBlock,
              )}
              {renderBlockInserter(scope, index, blocks, onAddBlock)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSubmissionDocumentPreview = (submission) => {
    const previewBlocks = buildDocumentBlocksFromSubmission(submission).filter((block) =>
      block.type === 'image' ? Boolean(block.image?.previewUrl) : Boolean(block.content?.trim()),
    )

    return (
      <div className="employee-dashboard__article-preview">
        {previewBlocks.map((block) => {
          if (block.type === 'title') {
            return (
              <h2 key={block.id} className="employee-dashboard__article-preview-title">
                {block.content}
              </h2>
            )
          }

          if (block.type === 'summary') {
            return (
              <p key={block.id} className="employee-dashboard__article-preview-summary">
                {block.content}
              </p>
            )
          }

          if (block.type === 'image' && block.image?.previewUrl) {
            return (
              <figure key={block.id} className="employee-dashboard__article-preview-figure">
                <img
                  src={block.image.previewUrl}
                  alt={submission.title}
                  className="employee-dashboard__article-preview-image"
                />
                {block.caption ? (
                  <figcaption className="employee-dashboard__article-preview-caption">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            )
          }

          if (block.type === 'heading') {
            return (
              <h3 key={block.id} className="employee-dashboard__article-preview-heading">
                {block.content}
              </h3>
            )
          }

          if (block.type === 'quote') {
            return (
              <blockquote key={block.id} className="employee-dashboard__article-preview-quote">
                {block.content}
              </blockquote>
            )
          }

          if (block.type === 'list') {
            return (
              <ul key={block.id} className="employee-dashboard__article-preview-list">
                {String(block.content)
                  .split('\n')
                  .map((item) => item.replace(/^[-*•\d.\s]+/, '').trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li key={`${block.id}-${item}`}>{item}</li>
                  ))}
              </ul>
            )
          }

          if (block.type === 'code') {
            return (
              <pre key={block.id} className="employee-dashboard__article-preview-code">
                <code>{block.content}</code>
              </pre>
            )
          }

          if (block.type === 'details') {
            return (
              <details key={block.id} className="employee-dashboard__article-preview-details">
                <summary>Read details</summary>
                <p>{block.content}</p>
              </details>
            )
          }

          if (block.type === 'table') {
            return (
              <div key={block.id} className="employee-dashboard__article-preview-table-wrap">
                <table className="employee-dashboard__article-preview-table">
                  <tbody>
                    {String(block.content)
                      .split('\n')
                      .map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean))
                      .filter((row) => row.length)
                      .map((row, rowIndex) => (
                        <tr key={`${block.id}-row-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={`${block.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )
          }

          return (
            <p key={block.id} className="employee-dashboard__article-preview-paragraph">
              {block.content}
            </p>
          )
        })}
      </div>
    )
  }

  const renderReporterPreviewSidebar = (previewSubmission) => (
    <aside className="employee-dashboard__preview-sidebar">
      <div className="employee-dashboard__preview-sidebar-head">
        <div className="employee-dashboard__preview-sidebar-tabs">
          <button type="button" className="employee-dashboard__preview-sidebar-tab employee-dashboard__preview-sidebar-tab--active">
            Post
          </button>
        </div>
      </div>

      <div className="employee-dashboard__preview-sidebar-body">
        <section className="employee-dashboard__preview-panel">
          <div className="employee-dashboard__preview-panel-head">
            <h4>AIOSEO</h4>
          </div>

          <div className="employee-dashboard__preview-checks">
            {reporterDraftSeoChecks.map((check) => (
              <div key={check.label} className="employee-dashboard__preview-check">
                <span
                  className={`employee-dashboard__preview-check-indicator employee-dashboard__preview-check-indicator--${check.tone}`}
                >
                  {check.tone === 'good' ? '✓' : '!'}
                </span>
                <div>
                  <strong>{check.label}:</strong> <span>{check.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="employee-dashboard__preview-panel">
          <div className="employee-dashboard__preview-panel-head">
            <h4>Selected pages</h4>
          </div>
          <div className="employee-dashboard__story-tags">
            {previewSubmission.targetPages.length ? (
              previewSubmission.targetPages.map((page) => (
                <span key={page} className="employee-dashboard__story-tag">
                  {reporterPublishPages.find((entry) => entry.value === page)?.label ?? page}
                </span>
              ))
            ) : (
              <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                No pages selected
              </span>
            )}
          </div>
        </section>

        <section className="employee-dashboard__preview-panel">
          <div className="employee-dashboard__preview-panel-head">
            <h4>Tags</h4>
          </div>
          <div className="employee-dashboard__story-tags">
            {previewSubmission.tags.length ? (
              previewSubmission.tags.map((tag) => (
                <span key={tag} className="employee-dashboard__story-tag">
                  {tag}
                </span>
              ))
            ) : (
              <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                No tags
              </span>
            )}
          </div>
        </section>
      </div>
    </aside>
  )

  if (isReporter) {
    return (
      <main className="employee-auth employee-auth--dashboard">
        <section className="employee-auth__panel employee-auth__panel--wide">
          <div className="employee-dashboard">
            <section className="employee-dashboard__admin employee-dashboard__reporter">
              {reporterAlert.message ? (
                <div
                  className={`employee-dashboard__top-alert employee-auth__alert employee-auth__alert--${reporterAlert.type}`}
                  role="alert"
                >
                  {reporterAlert.message}
                </div>
              ) : null}

              <header className="employee-dashboard__newsroom">
                <div className="employee-dashboard__newsroom-brand">
                  <span className="employee-dashboard__logo">NG</span>
                  <div>
                    <p className="employee-dashboard__newsroom-title">NewG India Reporter Desk</p>
                  </div>
                </div>

                <div className="employee-dashboard__newsroom-actions">
                  <span className="employee-dashboard__newsroom-role">{activeRole.label}</span>
                  <div className="employee-dashboard__profile">
                    <button
                      type="button"
                      className="employee-dashboard__profile-trigger"
                      aria-label="Open profile details"
                    >
                      {profileInitials}
                    </button>

                    <div className="employee-dashboard__profile-menu">
                      <p className="employee-dashboard__profile-name">
                        {employeeSession.name || employeeSession.email}
                      </p>
                      <p>{employeeSession.email}</p>
                      <p>Role: {activeRole.label}</p>
                      <div className="employee-dashboard__profile-intro">
                        <div className="employee-dashboard__profile-intro-head">
                          <span>Author intro</span>
                          <button
                            type="button"
                            className="employee-dashboard__profile-edit"
                            onClick={() => setIsEditingReporterBio((current) => !current)}
                          >
                            {isEditingReporterBio ? 'Cancel' : reporterBio.trim() ? 'Edit' : 'Add'}
                          </button>
                        </div>
                        {isEditingReporterBio ? (
                          <div className="employee-dashboard__profile-editor">
                            <textarea
                              rows="4"
                              value={reporterBio}
                              onChange={(event) => setReporterBio(event.target.value)}
                              placeholder="Write your author intro"
                              lang="en"
                              dir="auto"
                            />
                            <button
                              type="button"
                              className="employee-dashboard__profile-save"
                              onClick={handleReporterBioSave}
                            >
                              Save bio
                            </button>
                          </div>
                        ) : (
                          <p>
                            {reporterBio.trim() || 'No author intro added yet. Use Add to write your bio.'}
                          </p>
                        )}
                      </div>
                      <p>Session: {new Date(employeeSession.loggedInAt).toLocaleString()}</p>
                      <button
                        type="button"
                        className="employee-dashboard__profile-logout"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              <section className="employee-dashboard__reporter-grid">
                <article className="employee-auth__card">
                  <div className="employee-dashboard__section-head">
                    <div>
                      <h3>Create report draft</h3>
                      <p>Prepare the Hindi report and send it to the editor dashboard for review.</p>
                    </div>
                    <span className="employee-dashboard__badge employee-dashboard__badge--reporter">
                      Reporter workflow
                    </span>
                  </div>

                  <form className="employee-dashboard__form" onSubmit={handleReporterSubmit}>
                    <div className="employee-auth__field">
                      <span>Publish pages</span>
                      <div className="employee-dashboard__page-pills">
                        {reporterPublishPages.map((page) => (
                          <label
                            key={page.value}
                            className={`employee-dashboard__page-pill${
                              reporterForm.targetPages.includes(page.value)
                                ? ' employee-dashboard__page-pill--selected'
                                : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={reporterForm.targetPages.includes(page.value)}
                              onChange={() => handleReporterPageToggle(page.value)}
                            />
                            <span>{page.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="employee-dashboard__preview-layout">
                      <div className="employee-dashboard__preview-canvas employee-dashboard__preview-canvas--editor">
                        <div className="employee-auth__field">
                          <span>Article document</span>
                          <p className="employee-dashboard__composer-note">
                            Start with the title, then click the plus button to choose the next block.
                          </p>
                          {renderDocumentComposer({
                            scope: 'reporter',
                            blocks: reporterForm.documentBlocks,
                            onBlockChange: handleReporterBlockChange,
                            onImageChange: handleReporterDocumentImageChange,
                            onRemoveBlock: handleRemoveReporterBlock,
                            onAddBlock: handleAddReporterBlock,
                            onAddPattern: handleAddReporterPattern,
                          })}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`employee-dashboard__reporter-preview-row${
                        isReporterPreviewOpen ? ' employee-dashboard__reporter-preview-row--with-sidebar' : ''
                      }`}
                    >
                      <div className="employee-dashboard__reporter-preview-controls">
                        <label className="employee-auth__field">
                          <span>Tags</span>
                          <input
                            type="text"
                            name="tags"
                            placeholder="Comma separated tags"
                            value={reporterForm.tags}
                            onChange={handleReporterFieldChange('tags')}
                            lang="hi"
                            dir="auto"
                          />
                        </label>

                        <label className="employee-auth__field">
                          <span>Focus keyword</span>
                          <input
                            type="text"
                            name="focusKeyword"
                            placeholder="Main SEO keyword"
                            value={reporterForm.focusKeyword}
                            onChange={handleReporterFieldChange('focusKeyword')}
                            lang="hi"
                            dir="auto"
                          />
                        </label>

                        <div className="employee-dashboard__editor-actions">
                          <button
                            type="button"
                            className="employee-dashboard__secondary-button"
                            onClick={() => setIsReporterPreviewOpen((current) => !current)}
                          >
                            {isReporterPreviewOpen ? 'Hide preview' : 'Preview draft'}
                          </button>
                          <button type="submit" className="employee-auth__primary">
                            Send to editor review
                          </button>
                        </div>
                      </div>

                      {isReporterPreviewOpen ? renderReporterPreviewSidebar(reporterDraftPreview) : null}
                    </div>
                  </form>
                </article>
              </section>

              <article className="employee-auth__card">
                <div className="employee-dashboard__section-head employee-dashboard__section-head--table">
                  <div>
                    <h3>Submitted reports</h3>
                    <p>
                      See all articles written by you and track the current review status.
                    </p>
                  </div>
                  <span className="employee-dashboard__table-count">
                    {displayedReporterSubmissions.length} reports
                  </span>
                </div>

                {displayedReporterSubmissions.length ? (
                  <div className="employee-dashboard__stories">
                    {displayedReporterSubmissions.map((submission) => (
                      <article key={submission.id} className="employee-dashboard__story-card">
                        <button
                          type="button"
                          className="employee-dashboard__story-trigger"
                          onClick={() => toggleSubmissionDetails(submission.id)}
                          aria-expanded={expandedSubmissionId === submission.id}
                        >
                          <div className="employee-dashboard__story-trigger-main">
                            <h4 className="employee-dashboard__story-title">{submission.title}</h4>
                            <p className="employee-dashboard__story-summary">{submission.summary}</p>
                          </div>
                          <div className="employee-dashboard__story-status-row">
                            <span className="employee-dashboard__story-status-label">Status</span>
                            <span
                              className={`employee-dashboard__submission-status employee-dashboard__submission-status--${submission.status}`}
                            >
                              {formatSubmissionStatus(submission.status)}
                            </span>
                          </div>
                        </button>

                        {expandedSubmissionId === submission.id ? (
                          <div className="employee-dashboard__story-details">
                            <div className="employee-dashboard__story-meta">
                              <span className="employee-dashboard__story-date">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </span>
                              <span className="employee-dashboard__story-pages">
                                {submission.targetPages.join(', ')}
                              </span>
                            </div>

                            {renderSubmissionDocumentPreview(submission)}

                            <div className="employee-dashboard__story-tags">
                              {submission.tags.length ? (
                                submission.tags.map((tag) => (
                                  <span key={`${submission.id}-${tag}`} className="employee-dashboard__story-tag">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                                  No tags
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="employee-dashboard__empty">
                    No reports submitted yet. Create a report and send it for editor review.
                  </p>
                )}
              </article>
            </section>
          </div>
        </section>
      </main>
    )
  }

  if (isEditor) {
    return (
      <main className="employee-auth employee-auth--dashboard">
        <section className="employee-auth__panel employee-auth__panel--wide">
          <div className="employee-dashboard">
            <section className="employee-dashboard__admin employee-dashboard__editor">
              {reporterAlert.message ? (
                <div
                  className={`employee-dashboard__top-alert employee-auth__alert employee-auth__alert--${reporterAlert.type}`}
                  role="alert"
                >
                  {reporterAlert.message}
                </div>
              ) : null}

              <header className="employee-dashboard__newsroom">
                <div className="employee-dashboard__newsroom-brand">
                  <span className="employee-dashboard__logo">NG</span>
                  <div>
                    <p className="employee-dashboard__newsroom-title">NewG India Editor Desk</p>
                  </div>
                </div>

                <div className="employee-dashboard__newsroom-actions">
                  <span className="employee-dashboard__newsroom-role">{activeRole.label}</span>
                  <div className="employee-dashboard__profile">
                    <button
                      type="button"
                      className="employee-dashboard__profile-trigger"
                      aria-label="Open profile details"
                    >
                      {profileInitials}
                    </button>

                    <div className="employee-dashboard__profile-menu">
                      <p className="employee-dashboard__profile-name">
                        {employeeSession.name || employeeSession.email}
                      </p>
                      <p>{employeeSession.email}</p>
                      <p>Role: {activeRole.label}</p>
                      <p>Session: {new Date(employeeSession.loggedInAt).toLocaleString()}</p>
                      <button
                        type="button"
                        className="employee-dashboard__profile-logout"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              <article className="employee-auth__card">
                <div className="employee-dashboard__section-head employee-dashboard__section-head--table">
                  <div>
                    <h3>E-paper and magazine upload</h3>
                    <p>
                      Upload today&apos;s publication file from the editor desk. The issue date is
                      automatically set to the current upload date.
                    </p>
                  </div>
                </div>

                <form className="employee-dashboard__editor-form" onSubmit={handlePublicationIssueUpload}>
                  <label className="employee-auth__field">
                    <span>Publication type</span>
                    <select
                      value={publicationIssueForm.type}
                      onChange={handlePublicationIssueFieldChange('type')}
                    >
                      <option value="epaper">E-paper</option>
                      <option value="magazine">E-magazine</option>
                    </select>
                  </label>

                  <label className="employee-auth__field">
                    <span>PDF file</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePublicationIssueFileChange}
                    />
                  </label>

                  <div className="employee-dashboard__list">
                    <p className="employee-dashboard__list-item">
                      Upload date: <strong>{new Date().toLocaleDateString('en-CA')}</strong>
                    </p>
                  </div>

                  <div className="employee-dashboard__editor-actions">
                    <button type="submit" className="employee-auth__primary">
                      Upload publication
                    </button>
                  </div>
                </form>
              </article>

              <article className="employee-auth__card">
                <div className="employee-dashboard__section-head employee-dashboard__section-head--table">
                  <div>
                    <h3>Submitted articles</h3>
                    <p>
                      Review all stories submitted by reporters. Click any article to open the
                      full content.
                    </p>
                  </div>
                  <span className="employee-dashboard__table-count">
                    {displayedEditorSubmissions.length} articles
                  </span>
                </div>

                <div className="employee-dashboard__stories">
                  {displayedEditorSubmissions.map((submission) => (
                    <article key={submission.id} className="employee-dashboard__story-card">
                      <button
                        type="button"
                        className="employee-dashboard__story-trigger"
                        onClick={() => toggleSubmissionDetails(submission.id)}
                        aria-expanded={expandedSubmissionId === submission.id}
                      >
                        <div className="employee-dashboard__story-trigger-main">
                          <h4 className="employee-dashboard__story-title">{submission.title}</h4>
                          <p className="employee-dashboard__story-summary">{submission.summary}</p>
                        </div>

                        <div className="employee-dashboard__story-review-meta">
                          <span className="employee-dashboard__story-date">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                          <span className="employee-dashboard__story-author">
                            {submission.reporter?.name || submission.reporter?.email}
                          </span>
                        </div>

                        <div className="employee-dashboard__story-status-row">
                          <span className="employee-dashboard__story-status-label">Status</span>
                          <span
                            className={`employee-dashboard__submission-status employee-dashboard__submission-status--${submission.status}`}
                          >
                            {formatSubmissionStatus(submission.status)}
                          </span>
                        </div>
                      </button>

                      {expandedSubmissionId === submission.id ? (
                        <div className="employee-dashboard__story-details">
                          <div className="employee-dashboard__story-meta">
                            <span className="employee-dashboard__story-date">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                            <span className="employee-dashboard__story-pages">
                              {submission.targetPages.join(', ')}
                            </span>
                          </div>

                          {renderSubmissionDocumentPreview(submission)}

                          <div className="employee-dashboard__story-tags">
                            {submission.tags.length ? (
                              submission.tags.map((tag) => (
                                <span key={`${submission.id}-${tag}`} className="employee-dashboard__story-tag">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                                No tags
                              </span>
                            )}
                          </div>

                          <div className="employee-dashboard__story-tags">
                            <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                              Focus keyword: {submission.seo?.focusKeyword || 'Not set'}
                            </span>
                          </div>

                          <div className="employee-dashboard__editor-actions">
                            <button
                              type="button"
                              className="employee-dashboard__secondary-button"
                              onClick={() => startEditorSubmissionEdit(submission)}
                            >
                              Edit article
                            </button>
                          </div>

                          {editingEditorSubmissionId === submission.id ? (
                            <div className="employee-dashboard__editor-form">
                              <label className="employee-auth__field">
                                <span>Tags</span>
                                <input
                                  type="text"
                                  value={editorEditForm.tags}
                                  onChange={handleEditorEditFieldChange('tags')}
                                  lang="hi"
                                  dir="auto"
                                />
                              </label>

                              <div className="employee-auth__field">
                                <span>Article document</span>
                                <p className="employee-dashboard__composer-note">
                                  Edit the story in the same flow as the reporter document.
                                </p>
                                {renderDocumentComposer({
                                  scope: 'editor',
                                  blocks: editorEditForm.documentBlocks,
                                  onBlockChange: handleEditorBlockChange,
                                  onImageChange: handleEditorDocumentImageChange,
                                  onRemoveBlock: handleEditorRemoveBlock,
                                  onAddBlock: handleEditorAddBlock,
                                  onAddPattern: handleEditorAddPattern,
                                })}
                              </div>

                              <div className="employee-dashboard__editor-actions">
                                <button
                                  type="button"
                                  className="employee-auth__primary"
                                  onClick={() => handleEditorSubmissionSave(submission.id)}
                                >
                                  Save changes
                                </button>
                                <button
                                  type="button"
                                  className="employee-dashboard__secondary-button"
                                  onClick={cancelEditorSubmissionEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {editingEditorSubmissionId !== submission.id ? (
                            <div className="employee-dashboard__editor-actions">
                              {submission.status !== 'rejected' && submission.status !== 'published' ? (
                                <button
                                  type="button"
                                  className="employee-dashboard__status-action employee-dashboard__status-action--publish"
                                  onClick={() => openPublishOptions(submission.id)}
                                >
                                  Publish article
                                </button>
                              ) : null}
                              {submission.status !== 'published' ? (
                                <button
                                  type="button"
                                  className="employee-dashboard__status-action employee-dashboard__status-action--reject"
                                  onClick={() => handleEditorSubmissionReject(submission.id)}
                                >
                                  {submission.status === 'rejected' ? 'Unreject article' : 'Reject article'}
                                </button>
                              ) : null}
                              {submission.status === 'published' ? (
                                <button
                                  type="button"
                                  className="employee-dashboard__status-action employee-dashboard__status-action--reject"
                                  onClick={() => handleEditorSubmissionDelete(submission.id)}
                                >
                                  Delete article
                                </button>
                              ) : null}
                            </div>
                          ) : null}

                          {editingEditorSubmissionId !== submission.id ? (
                            <div className="employee-dashboard__publish-panel">
                              <div className="employee-auth__field">
                                <span>Homepage sections</span>
                                <div className="employee-dashboard__placement-dropdown">
                                  <button
                                    type="button"
                                    className="employee-dashboard__placement-trigger"
                                    onClick={toggleHomepagePlacementMenu(submission.id)}
                                    disabled={
                                      submission.status !== 'published' &&
                                      submission.status !== 'scheduled'
                                    }
                                    aria-expanded={openHomepagePlacementMenus[submission.id] ? 'true' : 'false'}
                                  >
                                    <span>
                                      {(homepagePlacementSelections[submission.id] ?? []).length
                                        ? HOMEPAGE_PLACEMENT_SLOTS.filter((slot) =>
                                            (homepagePlacementSelections[submission.id] ?? []).includes(slot.key),
                                          )
                                            .map((slot) => `${slot.section} - ${slot.label}`)
                                            .join(', ')
                                        : 'Select homepage sections'}
                                    </span>
                                    <span className="employee-dashboard__placement-trigger-icon">▼</span>
                                  </button>

                                  {openHomepagePlacementMenus[submission.id] ? (
                                    <div className="employee-dashboard__placement-menu">
                                      <div className="employee-dashboard__placement-picker">
                                        {HOMEPAGE_PLACEMENT_SLOTS.map((slot) => (
                                          <label
                                            key={slot.key}
                                            className={`employee-dashboard__placement-option${
                                              (homepagePlacementSelections[submission.id] ?? []).includes(slot.key)
                                                ? ' employee-dashboard__placement-option--selected'
                                                : ''
                                            }${
                                              submission.status !== 'published' &&
                                              submission.status !== 'scheduled'
                                                ? ' employee-dashboard__placement-option--disabled'
                                                : ''
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={(homepagePlacementSelections[submission.id] ?? []).includes(slot.key)}
                                              onChange={handleHomepagePlacementToggle(submission.id, slot.key)}
                                              disabled={
                                                submission.status !== 'published' &&
                                                submission.status !== 'scheduled'
                                              }
                                            />
                                            <span className="employee-dashboard__placement-option-text">
                                              <strong>{slot.section}</strong>
                                              <small>{slot.label}</small>
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              {submission.status === 'published' || submission.status === 'scheduled' ? (
                                <div className="employee-dashboard__editor-actions">
                                  <button
                                    type="button"
                                    className="employee-auth__primary"
                                    onClick={() => handleHomepagePlacementApply(submission.id)}
                                  >
                                    Place article
                                  </button>
                                </div>
                              ) : null}

                              <p className="employee-dashboard__placement-note">
                                {submission.status === 'published' || submission.status === 'scheduled'
                                  ? getAssignedHomepageSlots(submission.id).length
                                    ? `This article is currently assigned to ${getAssignedHomepageSlots(submission.id)
                                        .map((slot) => `${slot.section} as ${slot.label}`)
                                        .join(', ')}.`
                                    : 'Select one or more homepage sections, then click Place article.'
                                  : 'Publish or schedule the article first, then assign it to a homepage section.'}
                              </p>

                              <div className="employee-auth__field">
                                <span>Sidebar widgets stories</span>
                                <div className="employee-dashboard__placement-dropdown">
                                  <button
                                    type="button"
                                    className="employee-dashboard__placement-trigger"
                                    onClick={toggleSidebarPlacementMenu(submission.id)}
                                    disabled={
                                      submission.status !== 'published' &&
                                      submission.status !== 'scheduled'
                                    }
                                    aria-expanded={openSidebarPlacementMenus[submission.id] ? 'true' : 'false'}
                                  >
                                    <span>
                                      {(sidebarPlacementSelections[submission.id] ?? []).length
                                        ? SIDEBAR_STORY_PLACEMENT_SLOTS.filter((slot) =>
                                            (sidebarPlacementSelections[submission.id] ?? []).includes(slot.key),
                                          )
                                            .map((slot) => `${slot.section} - ${slot.label}`)
                                            .join(', ')
                                        : 'Select sidebar story slots'}
                                    </span>
                                    <span className="employee-dashboard__placement-trigger-icon">▼</span>
                                  </button>

                                  {openSidebarPlacementMenus[submission.id] ? (
                                    <div className="employee-dashboard__placement-menu">
                                      <div className="employee-dashboard__placement-picker">
                                        {SIDEBAR_STORY_PLACEMENT_SLOTS.map((slot) => (
                                          <label
                                            key={slot.key}
                                            className={`employee-dashboard__placement-option${
                                              (sidebarPlacementSelections[submission.id] ?? []).includes(slot.key)
                                                ? ' employee-dashboard__placement-option--selected'
                                                : ''
                                            }${
                                              submission.status !== 'published' &&
                                              submission.status !== 'scheduled'
                                                ? ' employee-dashboard__placement-option--disabled'
                                                : ''
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={(sidebarPlacementSelections[submission.id] ?? []).includes(slot.key)}
                                              onChange={handleSidebarPlacementToggle(submission.id, slot.key)}
                                              disabled={
                                                submission.status !== 'published' &&
                                                submission.status !== 'scheduled'
                                              }
                                            />
                                            <span className="employee-dashboard__placement-option-text">
                                              <strong>{slot.section}</strong>
                                              <small>{slot.label}</small>
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              {submission.status === 'published' || submission.status === 'scheduled' ? (
                                <div className="employee-dashboard__editor-actions">
                                  <button
                                    type="button"
                                    className="employee-auth__primary"
                                    onClick={() => handleSidebarPlacementApply(submission.id)}
                                  >
                                    Place in sidebar
                                  </button>
                                </div>
                              ) : null}

                              <p className="employee-dashboard__placement-note">
                                {submission.status === 'published' || submission.status === 'scheduled'
                                  ? getAssignedSidebarSlots(submission.id).length
                                    ? `This article is currently assigned to ${getAssignedSidebarSlots(submission.id)
                                        .map((slot) => slot.label)
                                        .join(', ')} in SidebarWidgets.`
                                    : 'Select one or more sidebar slots, then click Place in sidebar.'
                                  : 'Publish or schedule the article first, then assign it to the sidebar widgets.'}
                              </p>
                            </div>
                          ) : null}

                          {publishingSubmissionId === submission.id &&
                          editingEditorSubmissionId !== submission.id &&
                          submission.status !== 'rejected' ? (
                            <div className="employee-dashboard__publish-panel">
                              <div className="employee-dashboard__publish-options">
                                <label className="employee-dashboard__publish-option">
                                  <input
                                    type="radio"
                                    name={`publish-mode-${submission.id}`}
                                    checked={publishMode === 'instant'}
                                    onChange={() => setPublishMode('instant')}
                                  />
                                  <span>Publish instantly</span>
                                </label>
                                <label className="employee-dashboard__publish-option">
                                  <input
                                    type="radio"
                                    name={`publish-mode-${submission.id}`}
                                    checked={publishMode === 'scheduled'}
                                    onChange={() => setPublishMode('scheduled')}
                                  />
                                  <span>Set schedule</span>
                                </label>
                              </div>

                              {publishMode === 'scheduled' ? (
                                <label className="employee-auth__field">
                                  <span>Schedule date and time</span>
                                  <input
                                    type="datetime-local"
                                    value={scheduledPublishAt}
                                    onChange={(event) => setScheduledPublishAt(event.target.value)}
                                  />
                                </label>
                              ) : null}

                              <div className="employee-dashboard__editor-actions">
                                <button
                                  type="button"
                                  className="employee-auth__primary"
                                  onClick={() => handleEditorSubmissionPublish(submission.id)}
                                >
                                  {publishMode === 'scheduled' ? 'Save schedule' : 'Publish now'}
                                </button>
                                <button
                                  type="button"
                                  className="employee-dashboard__secondary-button"
                                  onClick={closePublishOptions}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </article>

            </section>
          </div>
        </section>
      </main>
    )
  }

  if (isSeo) {
    return (
      <main className="employee-auth employee-auth--dashboard">
        <section className="employee-auth__panel employee-auth__panel--wide">
          <div className="employee-dashboard">
            <section className="employee-dashboard__admin employee-dashboard__seo">
              {reporterAlert.message ? (
                <div
                  className={`employee-dashboard__top-alert employee-auth__alert employee-auth__alert--${reporterAlert.type}`}
                  role="alert"
                >
                  {reporterAlert.message}
                </div>
              ) : null}

              <header className="employee-dashboard__newsroom">
                <div className="employee-dashboard__newsroom-brand">
                  <span className="employee-dashboard__logo">NG</span>
                  <div>
                    <p className="employee-dashboard__newsroom-title">NewG India SEO Desk</p>
                  </div>
                </div>

                <div className="employee-dashboard__newsroom-actions">
                  <span className="employee-dashboard__newsroom-role">{activeRole.label}</span>
                  <div className="employee-dashboard__profile">
                    <button
                      type="button"
                      className="employee-dashboard__profile-trigger"
                      aria-label="Open profile details"
                    >
                      {profileInitials}
                    </button>

                    <div className="employee-dashboard__profile-menu">
                      <p className="employee-dashboard__profile-name">
                        {employeeSession.name || employeeSession.email}
                      </p>
                      <p>{employeeSession.email}</p>
                      <p>Role: {activeRole.label}</p>
                      <p>Session: {new Date(employeeSession.loggedInAt).toLocaleString()}</p>
                      <button
                        type="button"
                        className="employee-dashboard__profile-logout"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              <article className="employee-auth__card">
                <div className="employee-dashboard__section-head employee-dashboard__section-head--table">
                  <div>
                    <h3>Reporter articles SEO panel</h3>
                    <p>
                      See all reporter articles first, then open one article to edit only its title,
                      focus keyword, and summary.
                    </p>
                  </div>
                  <span className="employee-dashboard__table-count">
                    {seoArticleSubmissions.length} articles
                  </span>
                </div>

                {seoArticleSubmissions.length ? (
                  <div className="employee-dashboard__stories">
                    {seoArticleSubmissions.map((submission) => {
                      const canSeoEditSubmission = submission.status === 'review_pending'

                      return (
                      <article key={submission.id} className="employee-dashboard__story-card">
                        <button
                          type="button"
                          className="employee-dashboard__story-trigger"
                          onClick={() => toggleSubmissionDetails(submission.id)}
                          aria-expanded={expandedSubmissionId === submission.id}
                        >
                          <div className="employee-dashboard__story-trigger-main">
                            <h4 className="employee-dashboard__story-title">{submission.title}</h4>
                            <p className="employee-dashboard__story-summary">{submission.summary}</p>
                          </div>

                          <div className="employee-dashboard__story-review-meta">
                            <span className="employee-dashboard__story-date">
                              {new Date(
                                submission.publishing?.publishedAt ||
                                  submission.publishing?.scheduledFor ||
                                  submission.submittedAt,
                              ).toLocaleString()}
                            </span>
                            <span className="employee-dashboard__story-author">
                              {submission.reporter?.name || submission.reporter?.email}
                            </span>
                          </div>

                          <div className="employee-dashboard__story-status-row">
                            <span className="employee-dashboard__story-status-label">Status</span>
                            <span
                              className={`employee-dashboard__submission-status employee-dashboard__submission-status--${submission.status}`}
                            >
                              {formatSubmissionStatus(submission.status)}
                            </span>
                          </div>
                        </button>

                        {expandedSubmissionId === submission.id ? (
                          <div className="employee-dashboard__story-details">
                            <div className="employee-dashboard__story-meta">
                              <span className="employee-dashboard__story-date">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </span>
                              <span className="employee-dashboard__story-pages">
                                {submission.targetPages.join(', ')}
                              </span>
                            </div>

                            {renderSubmissionDocumentPreview(submission)}

                            <div className="employee-dashboard__story-tags">
                              {submission.tags.length ? (
                                submission.tags.map((tag) => (
                                  <span key={`${submission.id}-${tag}`} className="employee-dashboard__story-tag">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                                  No tags
                                </span>
                              )}
                            </div>

                            <div className="employee-dashboard__story-tags">
                              <span className="employee-dashboard__story-tag employee-dashboard__story-tag--muted">
                                Focus keyword: {submission.seo?.focusKeyword || 'Not set'}
                              </span>
                            </div>

                            {seoEditingSubmissionId === submission.id ? (
                              <div className="employee-dashboard__editor-form">
                                <label className="employee-auth__field">
                                  <span>Article title</span>
                                  <input
                                    type="text"
                                    value={seoEditForm.title}
                                    onChange={handleSeoFieldChange('title')}
                                    lang="hi"
                                    dir="auto"
                                  />
                                </label>

                                <label className="employee-auth__field">
                                  <span>Focus keyword</span>
                                  <input
                                    type="text"
                                    value={seoEditForm.focusKeyword}
                                    onChange={handleSeoFieldChange('focusKeyword')}
                                  />
                                </label>

                                <label className="employee-auth__field">
                                  <span>Summary</span>
                                  <textarea
                                    rows="4"
                                    value={seoEditForm.summary}
                                    onChange={handleSeoFieldChange('summary')}
                                    lang="hi"
                                    dir="auto"
                                  />
                                </label>

                                <div className="employee-dashboard__editor-actions">
                                  <button
                                    type="button"
                                    className="employee-auth__primary"
                                    onClick={() => handleSeoSave(submission.id)}
                                  >
                                    Save changes
                                  </button>
                                  <button
                                    type="button"
                                    className="employee-dashboard__secondary-button"
                                    onClick={cancelSeoEdit}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="employee-dashboard__editor-actions">
                                  {canSeoEditSubmission ? (
                                    <button
                                      type="button"
                                      className="employee-dashboard__secondary-button"
                                      onClick={() => startSeoEdit(submission)}
                                    >
                                      Edit SEO
                                    </button>
                                  ) : (
                                    <span className="employee-dashboard__placement-note">
                                      SEO editing is locked after the editor publishes or schedules this article.
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ) : null}
                      </article>
                      )
                    })}
                  </div>
                ) : (
                  <p className="employee-dashboard__empty">
                    No reporter articles are available yet for SEO optimization.
                  </p>
                )}
              </article>
            </section>
          </div>
        </section>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="employee-auth employee-auth--dashboard">
        <section className="employee-auth__panel employee-auth__panel--wide">
          <div className="employee-dashboard">
            <div className="employee-dashboard__hero employee-auth__card">
              <div>
                <span className="employee-auth__eyebrow">Protected dashboard</span>
                <h1>{activeRole.label} workspace</h1>
                <p>
                  This dashboard opens according to the logged-in employee role. The same
                  `/dashboard` route changes the workspace after login is matched to the stored
                  employee record.
                </p>
              </div>

              <div className="employee-dashboard__hero-meta">
                <span className={`employee-dashboard__badge ${activeRole.accentClass}`}>
                  {activeRole.label}
                </span>
                <p>
                  Signed in as <strong>{employeeSession.name || employeeSession.email}</strong>
                </p>
                <p>{employeeSession.email}</p>
                <p>Session started: {new Date(employeeSession.loggedInAt).toLocaleString()}</p>
                <button type="button" className="employee-auth__primary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>

            <div className="employee-dashboard__grid">
              <article className="employee-auth__card">
                <h2>Active role access</h2>
                <p>{activeRole.description}</p>
                <p className="employee-dashboard__summary">{activeRole.summary}</p>
                <div className="employee-dashboard__list">
                  {activeRole.modules.map((module) => (
                    <p key={module} className="employee-dashboard__list-item">
                      {module}
                    </p>
                  ))}
                </div>
              </article>

              <article className="employee-auth__card employee-auth__card--muted">
                <h2>Assigned desk flow</h2>
                <p>
                  This role-based workspace is ready for a backend connection where page data and
                  permissions are loaded from the real employee account.
                </p>
              </article>
            </div>

            <section className="employee-dashboard__roles">
              <div className="employee-dashboard__roles-header">
                <h2>Role-ready dashboard structure</h2>
                <p>The dashboard is prepared to render different modules for each company role.</p>
              </div>

              <div className="employee-dashboard__roles-grid">
                {roleCards.map((role) => (
                  <article
                    key={role.key}
                    className={`employee-auth__card employee-dashboard__role-card${
                      role.isActive ? ' employee-dashboard__role-card--active' : ''
                    }`}
                  >
                    <div className="employee-dashboard__role-head">
                      <h3>{role.label}</h3>
                      <span className={`employee-dashboard__badge ${role.accentClass}`}>
                        {role.isActive ? 'Current role' : 'Available role'}
                      </span>
                    </div>
                    <p>{role.description}</p>
                    <div className="employee-dashboard__list">
                      {role.modules.map((module) => (
                        <p key={module} className="employee-dashboard__list-item">
                          {module}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="employee-auth employee-auth--dashboard">
      <section className="employee-auth__panel employee-auth__panel--wide">
        <div className="employee-dashboard">
          <section className="employee-dashboard__admin">
            {adminAlert.message ? (
              <div
                className={`employee-dashboard__top-alert employee-auth__alert employee-auth__alert--${adminAlert.type}`}
                role="alert"
              >
                {adminAlert.message}
              </div>
            ) : null}

            <header className="employee-dashboard__newsroom">
              <div className="employee-dashboard__newsroom-brand">
                <span className="employee-dashboard__logo">NG</span>
                <div>
                  <p className="employee-dashboard__newsroom-title">NewG India Admin Desk</p>
                </div>
              </div>

              <div className="employee-dashboard__newsroom-actions">
                <span className="employee-dashboard__newsroom-role">{activeRole.label}</span>
                <div className="employee-dashboard__profile">
                  <button
                    type="button"
                    className="employee-dashboard__profile-trigger"
                    aria-label="Open profile details"
                  >
                    {profileInitials}
                  </button>

                  <div className="employee-dashboard__profile-menu">
                    <p className="employee-dashboard__profile-name">
                      {employeeSession.name || employeeSession.email}
                    </p>
                    <p>{employeeSession.email}</p>
                    <p>Role: {activeRole.label}</p>
                    <p>Session: {new Date(employeeSession.loggedInAt).toLocaleString()}</p>
                    <button
                      type="button"
                      className="employee-dashboard__profile-logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="employee-dashboard__workspace">
              <article className="employee-auth__card">
                <div className="employee-dashboard__section-head">
                  <div>
                    <h3>Create employee account</h3>
                    <p>Add internal team members and assign the correct newsroom role.</p>
                  </div>
                  <span className="employee-dashboard__badge employee-dashboard__badge--admin">
                    Access control
                  </span>
                </div>

                <form className="employee-dashboard__form" onSubmit={handleCreateEmployee}>
                  <label className="employee-auth__field">
                    <span>Employee name</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formState.name}
                      onChange={handleFieldChange('name')}
                      required
                    />
                  </label>

                  <label className="employee-auth__field">
                    <span>Employee email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      value={formState.email}
                      onChange={handleFieldChange('email')}
                      required
                    />
                  </label>

                  <label className="employee-auth__field">
                    <span>Password</span>
                    <input
                      type="text"
                      name="password"
                      placeholder="Set password"
                      value={formState.password}
                      onChange={handleFieldChange('password')}
                      required
                    />
                  </label>

                  <label className="employee-auth__field">
                    <span>Role</span>
                    <select
                      name="role"
                      value={formState.role}
                      onChange={handleFieldChange('role')}
                      required
                    >
                      {managedRoleCards.map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button type="submit" className="employee-auth__primary">
                    Add employee
                  </button>
                </form>
              </article>
            </div>

            <article className="employee-auth__card">
              <div className="employee-dashboard__section-head employee-dashboard__section-head--table">
                <div>
                  <h3>Employee roster</h3>
                </div>
                <span className="employee-dashboard__table-count">{activeEmployeeCount} active employees</span>
              </div>

              <div className="employee-dashboard__table-wrap">
                <div className="employee-dashboard__table-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                </div>

                {nonAdminEmployees.length ? (
                  <div className="employee-dashboard__table-body">
                    {nonAdminEmployees.map((employee) => {
                      const roleInfo = getRoleDefinition(employee.role)

                      return (
                        <div key={employee.id} className="employee-dashboard__table-row employee-dashboard__table-row--news">
                          <div className="employee-dashboard__table-cell employee-dashboard__table-cell--name">
                            <strong>{employee.name}</strong>
                          </div>
                          <div className="employee-dashboard__table-cell">
                            <span>{employee.email}</span>
                          </div>
                          <div className="employee-dashboard__table-cell">
                            <span className={`employee-dashboard__badge ${roleInfo.accentClass}`}>
                              {roleInfo.label}
                            </span>
                          </div>
                          <div className="employee-dashboard__table-cell employee-dashboard__table-cell--status">
                            <button
                              type="button"
                              className={`employee-dashboard__status-toggle employee-dashboard__status-toggle--${employee.status}`}
                              onClick={() => handleStatusToggle(employee.id)}
                              aria-label={`Set ${employee.name} as ${
                                employee.status === 'active' ? 'inactive' : 'active'
                              }`}
                            >
                              <span className="employee-dashboard__status-toggle-track">
                                <span className="employee-dashboard__status-toggle-thumb" />
                              </span>
                              <span className="employee-dashboard__table-status">{employee.status}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="employee-dashboard__empty">No employee users added yet.</p>
                )}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  )
}

export default EmployeeDashboardPage
