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
  createStorySubmission,
  deleteStorySubmission,
  getReporterStorySubmissions,
  getStorySubmissions,
  publishStorySubmission,
  STORY_SUBMISSIONS_CHANGE_EVENT,
  updateStorySeo,
  updateStorySubmission,
  updateStorySubmissionStatus,
} from '../services/storySubmissions'
import {
  getHomepagePlacements,
  HOMEPAGE_PLACEMENT_SLOTS,
  HOMEPAGE_PLACEMENTS_CHANGE_EVENT,
  setHomepagePlacementsForSubmission,
  updateHomepagePlacement,
} from '../services/homepagePlacements'

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
    title: '',
    summary: '',
    imageFile: null,
    contentBlocks: [
      { id: 'block-1', type: '', content: '' },
    ],
    tags: '',
  })
  const [adminAlert, setAdminAlert] = useState({ type: '', message: '' })
  const [reporterAlert, setReporterAlert] = useState({ type: '', message: '' })
  const [reporterSubmissions, setReporterSubmissions] = useState(() =>
    getReporterStorySubmissions(employeeSession.email),
  )
  const [editorSubmissions, setEditorSubmissions] = useState(getStorySubmissions)
  const [homepagePlacements, setHomepagePlacements] = useState(getHomepagePlacements)
  const [homepagePlacementSelections, setHomepagePlacementSelections] = useState({})
  const [openHomepagePlacementMenus, setOpenHomepagePlacementMenus] = useState({})
  const [reporterBio, setReporterBio] = useState(employeeSession.bio ?? '')
  const [isEditingReporterBio, setIsEditingReporterBio] = useState(false)
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null)
  const [editingEditorSubmissionId, setEditingEditorSubmissionId] = useState(null)
  const [publishingSubmissionId, setPublishingSubmissionId] = useState(null)
  const [publishMode, setPublishMode] = useState('instant')
  const [scheduledPublishAt, setScheduledPublishAt] = useState('')
  const [editorEditForm, setEditorEditForm] = useState({
    title: '',
    summary: '',
    tags: '',
    contentBlocks: [],
  })
  const [seoEditingSubmissionId, setSeoEditingSubmissionId] = useState(null)
  const [seoEditForm, setSeoEditForm] = useState({
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
  })
  const isAdmin = employeeSession.role === 'admin'
  const isReporter = employeeSession.role === 'reporter'
  const isSeo = employeeSession.role === 'seo'
  const isEditor = employeeSession.role === 'editor'
  const managedRoleCards = roleCards.filter((role) => role.key !== 'admin')
  const nonAdminEmployees = employees.filter((employee) => employee.role !== 'admin')
  const activeEmployeeCount = nonAdminEmployees.filter((employee) => employee.status === 'active').length
  const seoEligibleSubmissions = editorSubmissions.filter(
    (submission) => submission.status === 'published' || submission.status === 'scheduled',
  )
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

  const normalizeReporterText = (value) => value.replace(/\bINR\b/gi, '₹')
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

  const startEditorSubmissionEdit = (submission) => {
    setEditingEditorSubmissionId(submission.id)
    setEditorEditForm({
      title: submission.title,
      summary: submission.summary,
      tags: (submission.tags ?? []).join(', '),
      contentBlocks: (submission.contentBlocks ?? []).map((block, index) => ({
        id: block.id ?? `edit-block-${index + 1}`,
        type: block.type ?? 'paragraph',
        content: block.content ?? '',
      })),
    })
  }

  const cancelEditorSubmissionEdit = () => {
    setEditingEditorSubmissionId(null)
    setEditorEditForm({
      title: '',
      summary: '',
      tags: '',
      contentBlocks: [],
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
      [field]:
        field === 'title' || field === 'summary' || field === 'tags'
          ? normalizeReporterText(event.target.value)
          : event.target.value,
    }))
  }

  const handleEditorBlockChange = (blockId, field) => (event) => {
    setEditorEditForm((current) => ({
      ...current,
      contentBlocks: current.contentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [field]:
                field === 'content'
                  ? normalizeReporterText(event.target.value)
                  : event.target.value,
            }
          : block,
      ),
    }))
  }

  const handleEditorAddBlock = (type) => {
    setEditorEditForm((current) => ({
      ...current,
      contentBlocks: [
        ...current.contentBlocks,
        {
          id: `editor-block-${Date.now()}-${current.contentBlocks.length + 1}`,
          type,
          content: '',
        },
      ],
    }))
  }

  const handleEditorRemoveBlock = (blockId) => {
    setEditorEditForm((current) => ({
      ...current,
      contentBlocks:
        current.contentBlocks.length === 1
          ? current.contentBlocks
          : current.contentBlocks.filter((block) => block.id !== blockId),
    }))
  }

  const handleEditorSubmissionSave = (submissionId) => {
    const normalizedTitle = editorEditForm.title.trim()
    const normalizedSummary = editorEditForm.summary.trim()
    const normalizedTags = editorEditForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    const normalizedBlocks = editorEditForm.contentBlocks
      .map((block) => ({
        ...block,
        content: block.content.trim(),
      }))
      .filter((block) => block.content)

    if (!normalizedTitle || !normalizedSummary || !normalizedBlocks.length) {
      return
    }

    const updatedSubmission = updateStorySubmission(submissionId, {
      title: normalizedTitle,
      summary: normalizedSummary,
      tags: normalizedTags,
      contentBlocks: normalizedBlocks,
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

  const handleReporterImageChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setReporterForm((current) => ({
        ...current,
        imageFile: null,
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
      imageFile: {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        previewUrl,
      },
    }))
  }

  const handleReporterBlockChange = (blockId, field) => (event) => {
    setReporterForm((current) => ({
      ...current,
      contentBlocks: current.contentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [field]:
                field === 'content'
                  ? normalizeReporterText(event.target.value)
                  : event.target.value,
            }
          : block,
      ),
    }))
  }

  const handleAddReporterBlock = (type) => {
    setReporterForm((current) => ({
      ...current,
      contentBlocks: [
        ...current.contentBlocks,
        {
          id: `block-${Date.now()}-${current.contentBlocks.length + 1}`,
          type,
          content: '',
        },
      ],
    }))
  }

  const handleRemoveReporterBlock = (blockId) => {
    setReporterForm((current) => ({
      ...current,
      contentBlocks:
        current.contentBlocks.length === 1
          ? current.contentBlocks
          : current.contentBlocks.filter((block) => block.id !== blockId),
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

    const normalizedTitle = normalizeReporterText(reporterForm.title).trim()
    const normalizedSummary = normalizeReporterText(reporterForm.summary).trim()
    const normalizedBlocks = reporterForm.contentBlocks
      .map((block) => ({
        ...block,
        content: normalizeReporterText(block.content).trim(),
      }))
      .filter((block) => block.content)

    if (
      !reporterForm.targetPages.length ||
      !normalizedTitle ||
      !normalizedSummary ||
      !normalizedBlocks.length
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
      title: normalizedTitle,
      summary: normalizedSummary,
      imageFile: reporterForm.imageFile,
      contentBlocks: normalizedBlocks,
      tags: normalizeReporterText(reporterForm.tags),
    })

    setReporterSubmissions((current) => [nextSubmission, ...current])
    setReporterForm({
      targetPages: [],
      title: '',
      summary: '',
      imageFile: null,
      contentBlocks: [
        { id: 'block-1', type: '', content: '' },
      ],
      tags: '',
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

  const startSeoEdit = (submission) => {
    setSeoEditingSubmissionId(submission.id)
    setSeoEditForm({
      metaTitle: submission.seo?.metaTitle ?? '',
      metaDescription: submission.seo?.metaDescription ?? '',
      canonicalUrl: submission.seo?.canonicalUrl ?? '',
      focusKeyword: submission.seo?.focusKeyword ?? '',
      ogTitle: submission.seo?.ogTitle ?? '',
      ogDescription: submission.seo?.ogDescription ?? '',
      ogImageUrl: submission.seo?.ogImageUrl ?? submission.image?.previewUrl ?? '',
    })
  }

  const cancelSeoEdit = () => {
    setSeoEditingSubmissionId(null)
    setSeoEditForm({
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      focusKeyword: '',
      ogTitle: '',
      ogDescription: '',
      ogImageUrl: '',
    })
  }

  const handleSeoFieldChange = (field) => (event) => {
    setSeoEditForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSeoSave = (submissionId) => {
    const updatedSubmission = updateStorySeo(
      submissionId,
      {
        metaTitle: seoEditForm.metaTitle.trim(),
        metaDescription: seoEditForm.metaDescription.trim(),
        canonicalUrl: seoEditForm.canonicalUrl.trim(),
        focusKeyword: seoEditForm.focusKeyword.trim(),
        ogTitle: seoEditForm.ogTitle.trim(),
        ogDescription: seoEditForm.ogDescription.trim(),
        ogImageUrl: seoEditForm.ogImageUrl.trim(),
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
      message: 'SEO fields updated successfully.',
    })
    cancelSeoEdit()
  }

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

                    <label className="employee-auth__field">
                      <span>Title</span>
                      <input
                        type="text"
                        name="title"
                        placeholder="Enter report title"
                        value={reporterForm.title}
                        onChange={handleReporterFieldChange('title')}
                        lang="hi"
                        dir="auto"
                        required
                      />
                    </label>

                    <label className="employee-auth__field">
                      <span>Short summary</span>
                      <textarea
                        rows="4"
                        name="summary"
                        placeholder="Write a short report summary"
                        value={reporterForm.summary}
                        onChange={handleReporterFieldChange('summary')}
                        lang="hi"
                        dir="auto"
                        required
                      />
                    </label>

                    <label className="employee-auth__field">
                      <span>Image upload</span>
                      <input type="file" accept="image/*" onChange={handleReporterImageChange} />
                    </label>

                    {reporterForm.imageFile ? (
                      <div className="employee-dashboard__upload-note">
                        <strong>{reporterForm.imageFile.name}</strong>
                        <span>Image selected for review submission</span>
                      </div>
                    ) : null}

                    <div className="employee-auth__field">
                      <span>Article content</span>
                      <div className="employee-dashboard__block-actions">
                        <button
                          type="button"
                          className="employee-dashboard__secondary-button"
                          onClick={() => handleAddReporterBlock('heading')}
                        >
                          Add subheading
                        </button>
                        <button
                          type="button"
                          className="employee-dashboard__secondary-button"
                          onClick={() => handleAddReporterBlock('paragraph')}
                        >
                          Add paragraph
                        </button>
                      </div>

                      <div className="employee-dashboard__blocks">
                        {reporterForm.contentBlocks.map((block, index) => (
                          <div key={block.id} className="employee-dashboard__block-card">
                            <div className="employee-dashboard__block-head">
                              <strong>
                                {getReporterBlockLabel(reporterForm.contentBlocks, block, index)}
                              </strong>
                              <div className="employee-dashboard__block-tools">
                                <select
                                  value={block.type}
                                  onChange={handleReporterBlockChange(block.id, 'type')}
                                >
                                  <option value="">Select type</option>
                                  <option value="paragraph">Paragraph</option>
                                  <option value="heading">Subheading</option>
                                </select>
                                <button
                                  type="button"
                                  className="employee-dashboard__remove-button"
                                  onClick={() => handleRemoveReporterBlock(block.id)}
                                  disabled={reporterForm.contentBlocks.length === 1}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <textarea
                              rows={block.type === 'heading' ? 2 : 6}
                              placeholder={
                                block.type === 'heading'
                                  ? 'Write subheading'
                                  : block.type === 'paragraph'
                                    ? 'Write paragraph content'
                                    : 'Select block type first'
                              }
                              value={block.content}
                              onChange={handleReporterBlockChange(block.id, 'content')}
                              lang="hi"
                              dir="auto"
                              required={index === 0}
                              disabled={!block.type}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

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

                    <button type="submit" className="employee-auth__primary">
                      Send to editor review
                    </button>
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

                            {submission.image?.previewUrl ? (
                              <img
                                src={submission.image.previewUrl}
                                alt={submission.title}
                                className="employee-dashboard__story-image"
                              />
                            ) : null}

                            <div className="employee-dashboard__story-content">
                              {(submission.contentBlocks || []).map((block) =>
                                block.type === 'heading' ? (
                                  <h5 key={block.id} className="employee-dashboard__story-subheading">
                                    {block.content}
                                  </h5>
                                ) : (
                                  <p key={block.id} className="employee-dashboard__story-paragraph">
                                    {block.content}
                                  </p>
                                ),
                              )}
                            </div>

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

                          {submission.image?.previewUrl ? (
                            <img
                              src={submission.image.previewUrl}
                              alt={submission.title}
                              className="employee-dashboard__story-image"
                            />
                          ) : null}

                          <div className="employee-dashboard__story-content">
                            {(submission.contentBlocks || []).map((block) =>
                              block.type === 'heading' ? (
                                <h5 key={block.id} className="employee-dashboard__story-subheading">
                                  {block.content}
                                </h5>
                              ) : (
                                <p key={block.id} className="employee-dashboard__story-paragraph">
                                  {block.content}
                                </p>
                              ),
                            )}
                          </div>

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
                                <span>Title</span>
                                <input
                                  type="text"
                                  value={editorEditForm.title}
                                  onChange={handleEditorEditFieldChange('title')}
                                  lang="hi"
                                  dir="auto"
                                />
                              </label>

                              <label className="employee-auth__field">
                                <span>Short summary</span>
                                <textarea
                                  rows="4"
                                  value={editorEditForm.summary}
                                  onChange={handleEditorEditFieldChange('summary')}
                                  lang="hi"
                                  dir="auto"
                                />
                              </label>

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
                                <span>Article content</span>
                                <div className="employee-dashboard__block-actions">
                                  <button
                                    type="button"
                                    className="employee-dashboard__secondary-button"
                                    onClick={() => handleEditorAddBlock('heading')}
                                  >
                                    Add subheading
                                  </button>
                                  <button
                                    type="button"
                                    className="employee-dashboard__secondary-button"
                                    onClick={() => handleEditorAddBlock('paragraph')}
                                  >
                                    Add paragraph
                                  </button>
                                </div>

                                <div className="employee-dashboard__blocks">
                                  {editorEditForm.contentBlocks.map((block, index) => (
                                    <div key={block.id} className="employee-dashboard__block-card">
                                      <div className="employee-dashboard__block-head">
                                        <strong>
                                          {getReporterBlockLabel(editorEditForm.contentBlocks, block, index)}
                                        </strong>
                                        <div className="employee-dashboard__block-tools">
                                          <select
                                            value={block.type}
                                            onChange={handleEditorBlockChange(block.id, 'type')}
                                          >
                                            <option value="paragraph">Paragraph</option>
                                            <option value="heading">Subheading</option>
                                          </select>
                                          <button
                                            type="button"
                                            className="employee-dashboard__remove-button"
                                            onClick={() => handleEditorRemoveBlock(block.id)}
                                            disabled={editorEditForm.contentBlocks.length === 1}
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                      <textarea
                                        rows={block.type === 'heading' ? 2 : 6}
                                        value={block.content}
                                        onChange={handleEditorBlockChange(block.id, 'content')}
                                        lang="hi"
                                        dir="auto"
                                      />
                                    </div>
                                  ))}
                                </div>
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
                    <h3>Published article SEO panel</h3>
                    <p>
                      Open a published article and manage only its search and social metadata fields.
                    </p>
                  </div>
                  <span className="employee-dashboard__table-count">
                    {seoEligibleSubmissions.length} eligible articles
                  </span>
                </div>

                {seoEligibleSubmissions.length ? (
                  <div className="employee-dashboard__stories">
                    {seoEligibleSubmissions.map((submission) => (
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
                                Published article content is locked for SEO.
                              </span>
                              <span className="employee-dashboard__story-pages">
                                {submission.targetPages.join(', ')}
                              </span>
                            </div>

                            <div className="employee-dashboard__list">
                              <p className="employee-dashboard__list-item">
                                Reporter headline: {submission.title}
                              </p>
                              <p className="employee-dashboard__list-item">
                                Reporter summary: {submission.summary}
                              </p>
                              <p className="employee-dashboard__list-item">
                                Title/body editing is disabled for the SEO role.
                              </p>
                            </div>

                            {seoEditingSubmissionId === submission.id ? (
                              <div className="employee-dashboard__editor-form">
                                <label className="employee-auth__field">
                                  <span>Meta title</span>
                                  <input
                                    type="text"
                                    value={seoEditForm.metaTitle}
                                    onChange={handleSeoFieldChange('metaTitle')}
                                  />
                                </label>

                                <label className="employee-auth__field">
                                  <span>Meta description</span>
                                  <textarea
                                    rows="4"
                                    value={seoEditForm.metaDescription}
                                    onChange={handleSeoFieldChange('metaDescription')}
                                  />
                                </label>

                                <label className="employee-auth__field">
                                  <span>Canonical URL</span>
                                  <input
                                    type="url"
                                    value={seoEditForm.canonicalUrl}
                                    onChange={handleSeoFieldChange('canonicalUrl')}
                                    placeholder="https://newgindia.com/article-slug"
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
                                  <span>OG title</span>
                                  <input
                                    type="text"
                                    value={seoEditForm.ogTitle}
                                    onChange={handleSeoFieldChange('ogTitle')}
                                  />
                                </label>

                                <label className="employee-auth__field">
                                  <span>OG description</span>
                                  <textarea
                                    rows="4"
                                    value={seoEditForm.ogDescription}
                                    onChange={handleSeoFieldChange('ogDescription')}
                                  />
                                </label>

                                <label className="employee-auth__field">
                                  <span>OG image URL</span>
                                  <input
                                    type="url"
                                    value={seoEditForm.ogImageUrl}
                                    onChange={handleSeoFieldChange('ogImageUrl')}
                                    placeholder="https://example.com/og-image.jpg"
                                  />
                                </label>

                                <div className="employee-dashboard__editor-actions">
                                  <button
                                    type="button"
                                    className="employee-auth__primary"
                                    onClick={() => handleSeoSave(submission.id)}
                                  >
                                    Save SEO fields
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
                                <div className="employee-dashboard__table-wrap">
                                  <div className="employee-dashboard__table-head">
                                    <span>Field</span>
                                    <span>Current value</span>
                                  </div>

                                  <div className="employee-dashboard__table-body">
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>Meta title</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.metaTitle || 'Not set'}</span>
                                      </div>
                                    </div>
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>Meta description</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.metaDescription || 'Not set'}</span>
                                      </div>
                                    </div>
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>Canonical URL</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.canonicalUrl || 'Not set'}</span>
                                      </div>
                                    </div>
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>Focus keyword</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.focusKeyword || 'Not set'}</span>
                                      </div>
                                    </div>
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>OG title</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.ogTitle || 'Not set'}</span>
                                      </div>
                                    </div>
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>OG description</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.ogDescription || 'Not set'}</span>
                                      </div>
                                    </div>
                                    <div className="employee-dashboard__table-row">
                                      <div className="employee-dashboard__table-cell"><strong>OG image URL</strong></div>
                                      <div className="employee-dashboard__table-cell">
                                        <span>{submission.seo?.ogImageUrl || 'Not set'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="employee-dashboard__editor-actions">
                                  <button
                                    type="button"
                                    className="employee-dashboard__secondary-button"
                                    onClick={() => startSeoEdit(submission)}
                                  >
                                    Edit SEO fields
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="employee-dashboard__empty">
                    No published or scheduled articles are available yet for SEO optimization.
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
