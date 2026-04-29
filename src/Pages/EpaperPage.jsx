import { useEffect, useMemo, useRef, useState } from 'react'
import FooterSection from '../Component/FooterSection'
import './EpaperPage.css'

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    </svg>
  )
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 3a7.5 7.5 0 1 0 4.68 13.36L21 22l1-1-5.82-5.64A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm-1 1.5h2v3h3v2h-3v3h-2v-3h-3v-2h3Z" />
    </svg>
  )
}

function ZoomOutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 3a7.5 7.5 0 1 0 4.68 13.36L21 22l1-1-5.82-5.64A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm-3 4.5h6v2h-6Z" />
    </svg>
  )
}

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.5 6.5 8.7 14.3a3 3 0 1 0 4.24 4.24l7.07-7.07a5 5 0 1 0-7.07-7.07L4.78 12.5" />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5v2H6v3H4Zm10-5h6v6h-2V6h-4V4ZM4 14h2v4h4v2H4v-6Zm14 4v-4h2v6h-6v-2h4Z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 9h11v11H9zM5 5h11v2H7v9H5z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.52 3.48A11.88 11.88 0 0 0 12.06 0C5.5 0 .18 5.33.18 11.88c0 2.1.55 4.15 1.6 5.95L0 24l6.33-1.66a11.83 11.83 0 0 0 5.73 1.47h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.43-8.45ZM12.07 21.8a9.88 9.88 0 0 1-5.03-1.38l-.36-.22-3.76.99 1-3.66-.24-.38A9.83 9.83 0 0 1 2.2 11.88C2.2 6.43 6.62 2 12.07 2c2.63 0 5.11 1.02 6.97 2.89a9.8 9.8 0 0 1 2.88 6.98c0 5.45-4.44 9.88-9.89 9.88Z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.45 4.53 18.3 19.4c-.24 1.05-.87 1.3-1.76.81l-4.87-3.6-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.98 9.06-8.19c.39-.35-.08-.54-.61-.19l-11.2 7.06-4.82-1.51c-1.05-.33-1.07-1.05.22-1.55L20 2.8c.9-.33 1.69.22 1.45 1.73Z" />
    </svg>
  )
}

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max)
}

function getTodayDateValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function createSelectionRectangle(startX, startY, currentX, currentY) {
  return {
    x: Math.min(startX, currentX),
    y: Math.min(startY, currentY),
    width: Math.abs(currentX - startX),
    height: Math.abs(currentY - startY),
  }
}

function isPointInsideSelection(pointX, pointY, selection) {
  if (!selection) {
    return false
  }

  return (
    pointX >= selection.x &&
    pointX <= selection.x + selection.width &&
    pointY >= selection.y &&
    pointY <= selection.y + selection.height
  )
}

function normalizeOption(option = {}) {
  return {
    value: option.value ?? option.id ?? option.slug ?? '',
    label: option.label ?? option.name ?? option.title ?? '',
  }
}

function normalizeIssuePage(page, index) {
  if (typeof page === 'string') {
    return {
      id: `page-${index + 1}`,
      imageUrl: page,
      title: `Page ${index + 1}`,
      pageNumber: index + 1,
    }
  }

  return {
    id: page.id ?? page.slug ?? `page-${index + 1}`,
    imageUrl: page.imageUrl ?? page.pageImageUrl ?? page.url ?? page.src ?? page.fileUrl ?? '',
    title: page.title ?? page.label ?? `Page ${page.pageNumber ?? index + 1}`,
    pageNumber: page.pageNumber ?? page.number ?? index + 1,
    imageAlt: page.imageAlt ?? page.alt ?? page.title ?? `Page ${index + 1}`,
  }
}

function normalizeIssue(issue = {}) {
  const rawPages =
    issue.pages ??
    issue.pageImages ??
    issue.images ??
    issue.imageUrls ??
    []

  return {
    id: issue.id ?? `${issue.edition ?? ''}-${issue.section ?? ''}-${issue.date ?? ''}`,
    edition: issue.edition ?? issue.editionId ?? '',
    section: issue.section ?? issue.sectionId ?? '',
    date: issue.date ?? issue.publishDate ?? '',
    displayDate: issue.displayDate ?? issue.dateLabel ?? issue.date ?? '',
    pdfUrl: issue.pdfUrl ?? issue.fileUrl ?? issue.url ?? '',
    pageCount: issue.pageCount ?? issue.totalPages ?? 0,
    cityLabel: issue.cityLabel ?? issue.editionLabel ?? '',
    sectionLabel: issue.sectionLabel ?? issue.sectionName ?? '',
    headline: issue.headline ?? issue.title ?? '',
    pages: rawPages.map(normalizeIssuePage).filter((page) => page.id),
  }
}

function normalizeContent(content = {}) {
  return {
    ariaLabel: content.ariaLabel ?? 'ई-पेपर पेज',
    title: content.title ?? 'ई-पेपर',
    defaultEdition: content.defaultEdition ?? '',
    defaultSection: content.defaultSection ?? '',
    defaultDate: content.defaultDate ?? '',
    menuLabel: content.menuLabel ?? 'मेन्यू',
    editions: (content.editions ?? []).map(normalizeOption).filter((item) => item.value),
    sections: (content.sections ?? []).map(normalizeOption).filter((item) => item.value),
    issues: (content.issues ?? [])
      .map(normalizeIssue)
      .filter((item) => item.id && (item.pdfUrl || item.pages.length || item.pageCount)),
    actionLabels: {
      zoom: content.actionLabels?.zoom ?? 'Zoom',
      zoomOut: content.actionLabels?.zoomOut ?? 'Zoom Out',
      fullscreen: content.actionLabels?.fullscreen ?? 'Full Screen',
      clip: content.actionLabels?.clip ?? 'Clip',
    },
    sideAd: content.sideAd ?? null,
    emptyState: content.emptyState ?? 'चुनी हुई तारीख का ई-पेपर अभी उपलब्ध नहीं है।',
  }
}

function EpaperPage({ content, query, pageKey = 'epaperPage', queryKey = 'epaper' }) {
  const epaperContent = useMemo(() => normalizeContent(content[pageKey] ?? {}), [content, pageKey])
  const todayDateValue = getTodayDateValue()
  const initialEdition =
    query.get('edition')?.trim() || epaperContent.defaultEdition || epaperContent.editions[0]?.value || ''
  const initialSection =
    query.get('section')?.trim() || epaperContent.defaultSection || epaperContent.sections[0]?.value || ''
  const initialDate =
    query.get('date')?.trim() || epaperContent.defaultDate || todayDateValue

  const [selectedEdition] = useState(initialEdition)
  const [selectedSection, setSelectedSection] = useState(initialSection)
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isClipMode, setIsClipMode] = useState(false)
  const [clipDraft, setClipDraft] = useState(null)
  const [clipSelection, setClipSelection] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const menuRef = useRef(null)
  const viewerRef = useRef(null)
  const sideAd = epaperContent.sideAd ?? content.ads?.afterTopics ?? content.ads?.heroTop ?? null

  const menuItems = useMemo(() => {
    const topItems = (content.navbar?.items ?? [])
      .filter((item) => !(typeof item === 'object' && item.isMore))
      .map((item) =>
        typeof item === 'string'
          ? { label: item, href: '/' }
          : { label: item.label ?? item.title ?? '', href: item.href ?? item.url ?? '/' },
      )

    const moreItems = (content.navbar?.moreItems ?? []).map((item) => ({
      label: item.label ?? item.title ?? '',
      href: item.href ?? item.url ?? '/',
    }))

    return [...topItems, ...moreItems].filter((item) => item.label)
  }, [content.navbar?.items, content.navbar?.moreItems])

  const matchingIssue = useMemo(() => {
    const exact = epaperContent.issues.find(
      (issue) =>
        issue.edition === selectedEdition &&
        issue.section === selectedSection &&
        issue.date === selectedDate,
    )

    if (exact) {
      return exact
    }

    const sameEditionAndSection = epaperContent.issues
      .filter((issue) => issue.edition === selectedEdition && issue.section === selectedSection)
      .sort((left, right) => String(right.date).localeCompare(String(left.date)))

    const nearestPastIssue = sameEditionAndSection.find((issue) => issue.date <= selectedDate)

    return (
      nearestPastIssue ??
      sameEditionAndSection[0] ??
      epaperContent.issues.find((issue) => issue.edition === selectedEdition) ??
      epaperContent.issues[0] ??
      null
    )
  }, [epaperContent.issues, selectedDate, selectedEdition, selectedSection])

  useEffect(() => {
    document.title = `${epaperContent.title} | ${content.brand?.title ?? 'न्यूजी इंडिया'}`
  }, [content.brand?.title, epaperContent.title])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }

      if (!event.target.closest('.epaper-page__clip-menu')) {
        setContextMenu(null)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    setClipDraft(null)
    setClipSelection(null)
    setContextMenu(null)
  }, [matchingIssue?.id, selectedDate, selectedSection, zoomLevel])

  useEffect(() => {
    setActivePageIndex(0)
  }, [matchingIssue?.id, selectedDate, selectedSection])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set(queryKey, '1')

    if (selectedEdition) {
      params.set('edition', selectedEdition)
    }

    if (selectedSection) {
      params.set('section', selectedSection)
    }

    if (selectedDate) {
      params.set('date', selectedDate)
    }

    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
  }, [queryKey, selectedDate, selectedEdition, selectedSection])

  const issuePages = useMemo(() => {
    if (!matchingIssue) {
      return []
    }

    if (matchingIssue.pages.length) {
      return matchingIssue.pages
    }

    const fallbackPageCount = Math.max(1, Number(matchingIssue.pageCount) || 1)

    return Array.from({ length: fallbackPageCount }, (_, index) => ({
      id: `placeholder-${index + 1}`,
      imageUrl: '',
      title: `${epaperContent.title} Page ${index + 1}`,
      pageNumber: index + 1,
      imageAlt: `${epaperContent.title} Page ${index + 1}`,
    }))
  }, [epaperContent.title, matchingIssue])
  const activePage = issuePages[activePageIndex] ?? issuePages[0] ?? null
  const pageTotal = issuePages.length

  const goToPreviousPage = () => {
    setActivePageIndex((index) => Math.max(0, index - 1))
  }

  const goToNextPage = () => {
    setActivePageIndex((index) => Math.min(Math.max(0, pageTotal - 1), index + 1))
  }

  const activeSelection = clipDraft ?? clipSelection

  const buildClipShareUrl = () => {
    const params = new URLSearchParams(window.location.search)
    params.delete(queryKey === 'epaper' ? 'emagazine' : 'epaper')
    params.set(queryKey, '1')
    if (selectedEdition) params.set('edition', selectedEdition)
    if (selectedSection) params.set('section', selectedSection)
    if (selectedDate) params.set('date', selectedDate)
    if (clipSelection) {
      params.set(
        'clip',
        [clipSelection.x, clipSelection.y, clipSelection.width, clipSelection.height]
          .map((value) => Math.round(value))
          .join(','),
      )
    }

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  const shareText = matchingIssue
    ? `${epaperContent.title} - ${matchingIssue.displayDate}`
    : epaperContent.title

  const shareUrl = buildClipShareUrl()

  const openClipMenuForSelection = (selection, bounds, options = {}) => {
    const menuWidth = 226
    const menuHeight = navigator.share ? 242 : 198
    const preferredX = selection.x + selection.width / 2 - menuWidth / 2
    const preferredY = options.placeAbove
      ? selection.y - menuHeight - 12
      : selection.y + selection.height + 12

    setContextMenu({
      x: clamp(preferredX, 12, Math.max(12, bounds.width - menuWidth - 12)),
      y: clamp(preferredY, 12, Math.max(12, bounds.height - menuHeight - 12)),
    })
  }

  const handleClipPointerDown = (event) => {
    if (!isClipMode || event.button !== 0 || !viewerRef.current) {
      return
    }

    const bounds = viewerRef.current.getBoundingClientRect()
    const startX = clamp(event.clientX - bounds.left, 0, bounds.width)
    const startY = clamp(event.clientY - bounds.top, 0, bounds.height)
    const resizeHandle = event.target.dataset.handle
    const isMoveDrag = event.target.dataset.drag === 'selection'

    if (resizeHandle && clipSelection) {
      setContextMenu(null)
      setClipDraft({
        mode: 'resize',
        handle: resizeHandle,
        startX,
        startY,
        ...clipSelection,
      })
      return
    }

    if (isMoveDrag && clipSelection) {
      setContextMenu(null)
      setClipDraft({
        mode: 'move',
        startX,
        startY,
        originX: clipSelection.x,
        originY: clipSelection.y,
        width: clipSelection.width,
        height: clipSelection.height,
        x: clipSelection.x,
        y: clipSelection.y,
      })
      return
    }

    if (isPointInsideSelection(startX, startY, clipSelection)) {
      openClipMenuForSelection(clipSelection, bounds)
      return
    }

    setContextMenu(null)
    setClipSelection(null)
    setClipDraft({
      mode: 'draw',
      startX,
      startY,
      x: startX,
      y: startY,
      width: 0,
      height: 0,
    })
  }

  const handleClipPointerMove = (event) => {
    if (!clipDraft || !viewerRef.current) {
      return
    }

    const bounds = viewerRef.current.getBoundingClientRect()
    const currentX = clamp(event.clientX - bounds.left, 0, bounds.width)
    const currentY = clamp(event.clientY - bounds.top, 0, bounds.height)

    if (clipDraft.mode === 'draw') {
      const nextRect = createSelectionRectangle(clipDraft.startX, clipDraft.startY, currentX, currentY)
      setClipDraft((draft) => ({ ...draft, ...nextRect }))
      return
    }

    if (clipDraft.mode === 'move') {
      const deltaX = currentX - clipDraft.startX
      const deltaY = currentY - clipDraft.startY
      const nextX = clamp(clipDraft.originX + deltaX, 0, Math.max(0, bounds.width - clipDraft.width))
      const nextY = clamp(clipDraft.originY + deltaY, 0, Math.max(0, bounds.height - clipDraft.height))

      setClipDraft((draft) => ({ ...draft, x: nextX, y: nextY }))
      return
    }

    if (clipDraft.mode === 'resize') {
      const left = clipDraft.x
      const top = clipDraft.y
      const right = clipDraft.x + clipDraft.width
      const bottom = clipDraft.y + clipDraft.height

      const nextLeft = clipDraft.handle.includes('w') ? currentX : left
      const nextRight = clipDraft.handle.includes('e') ? currentX : right
      const nextTop = clipDraft.handle.includes('n') ? currentY : top
      const nextBottom = clipDraft.handle.includes('s') ? currentY : bottom

      const rect = createSelectionRectangle(nextLeft, nextTop, nextRight, nextBottom)

      setClipDraft((draft) => ({ ...draft, ...rect }))
    }
  }

  const handleClipPointerUp = () => {
    if (!clipDraft) {
      return
    }

    if (clipDraft.width < 24 || clipDraft.height < 24) {
      setClipDraft(null)
      return
    }

    const nextSelection = {
      x: clipDraft.x,
      y: clipDraft.y,
      width: clipDraft.width,
      height: clipDraft.height,
    }

    const viewerWidth = viewerRef.current?.clientWidth ?? 0
    const viewerHeight = viewerRef.current?.clientHeight ?? 0

    setClipSelection(nextSelection)
    openClipMenuForSelection(nextSelection, { width: viewerWidth, height: viewerHeight })
    setClipDraft(null)
  }

  const handleClipContextMenu = (event) => {
    if (!clipSelection || !viewerRef.current) {
      return
    }

    event.preventDefault()
    const bounds = viewerRef.current.getBoundingClientRect()
    openClipMenuForSelection(
      clipSelection,
      { width: bounds.width, height: bounds.height },
      { placeAbove: event.clientY - bounds.top > bounds.height * 0.65 },
    )
  }

  const handleCopyClipLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {}
    setContextMenu(null)
  }

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareText, url: shareUrl, text: shareText })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
    } catch {}

    setContextMenu(null)
  }

  const clearClipSelection = () => {
    setClipDraft(null)
    setClipSelection(null)
    setContextMenu(null)
  }

  const handleFullscreenToggle = async () => {
    if (!viewerRef.current) {
      return
    }

    try {
      if (document.fullscreenElement === viewerRef.current) {
        await document.exitFullscreen()
      } else {
        await viewerRef.current.requestFullscreen()
      }
    } catch {}
  }

  return (
    <main className="epaper-shell" lang="hi">
      <div className="news-page epaper-shell__frame">
        <section className="epaper-page" aria-label={epaperContent.ariaLabel}>
          <div className="epaper-page__toolbar">
            <div className="epaper-page__menu-wrap" ref={menuRef}>
              <button
                type="button"
                className="epaper-page__tool-button is-icon"
                aria-label={epaperContent.menuLabel}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((value) => !value)}
              >
                <MenuIcon />
              </button>

              {isMenuOpen ? (
                <div className="epaper-page__menu-dropdown">
                  {menuItems.map((item) => (
                    <a
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      className="epaper-page__menu-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="epaper-page__select">
              <a
                className="epaper-page__select-link"
                href={content.navbar?.eMagazineHref ?? '/'}
                target="_blank"
                rel="noreferrer"
              >
                {epaperContent.sections.find((section) => section.value === selectedSection)?.label ??
                  content.navbar?.eMagazineLabel ??
                  'Magzine'}
              </a>
            </label>

            <label className="epaper-page__date-chip">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                aria-label="ई-पेपर तारीख चुनें"
              />
            </label>

            <button
              type="button"
              className="epaper-page__tool-button"
              aria-label={epaperContent.actionLabels.zoomOut}
              onClick={() => setZoomLevel((level) => Math.max(50, level - 10))}
            >
              <ZoomOutIcon />
              <span>-</span>
            </button>

            <button
              type="button"
              className={`epaper-page__tool-button${isClipMode ? ' is-active' : ''}`}
              aria-pressed={isClipMode}
              aria-label={epaperContent.actionLabels.zoom}
              onClick={() => setZoomLevel((level) => Math.min(200, level + 10))}
            >
              <ZoomIcon />
              <span>+</span>
            </button>

            <div className="epaper-page__zoom-indicator" aria-live="polite">
              {zoomLevel}%
            </div>

            <button
              type="button"
              className={`epaper-page__tool-button${isFullscreen ? ' is-active' : ''}`}
              aria-pressed={isFullscreen}
              aria-label={epaperContent.actionLabels.fullscreen}
              onClick={handleFullscreenToggle}
            >
              <FullscreenIcon />
              <span>{epaperContent.actionLabels.fullscreen}</span>
            </button>

            <button
              type="button"
              className={`epaper-page__tool-button${isClipMode ? ' is-active' : ''}`}
              onClick={() => {
                setIsClipMode((value) => !value)
                setClipDraft(null)
                setClipSelection(null)
                setContextMenu(null)
              }}
            >
              <ClipIcon />
              <span>{epaperContent.actionLabels.clip}</span>
            </button>
          </div>

          <div className="epaper-page__viewer-layout">
            <aside className="epaper-page__side-promo">
              {sideAd ? (
                <section className="epaper-page__promo-card" aria-label={sideAd.ariaLabel}>
                  <strong>{sideAd.title}</strong>
                  <p>{sideAd.subtitle}</p>
                  {sideAd.buttonText ? (
                    <a
                      className="epaper-page__promo-button"
                      href={sideAd.buttonHref || '/'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {sideAd.buttonText}
                    </a>
                  ) : null}
                </section>
              ) : null}
            </aside>

            <div className="epaper-page__viewer-frame" ref={viewerRef}>
              {matchingIssue ? (
                <>
                  <div className="epaper-page__viewer-meta">
                    <div>
                      <strong>{epaperContent.title}</strong>
                    </div>
                    <div>
                      <strong>{matchingIssue.displayDate}</strong>
                    </div>
                    <div>
                      <span>{issuePages.length} pages</span>
                    </div>
                  </div>

                  <div
                    className="epaper-page__image-viewer"
                    style={{ '--epaper-zoom': zoomLevel / 100 }}
                    aria-label={matchingIssue.headline || epaperContent.title}
                  >
                    {activePage ? (
                      <article className="epaper-page__image-page" key={activePage.id}>
                        {activePage.imageUrl ? (
                          <img
                            src={activePage.imageUrl}
                            alt={activePage.imageAlt || activePage.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="epaper-page__image-placeholder">
                            <span>{epaperContent.title}</span>
                            <strong>{matchingIssue.headline || matchingIssue.displayDate}</strong>
                            <small>Page {activePage.pageNumber}</small>
                            <p>Backend image will appear here.</p>
                          </div>
                        )}
                      </article>
                    ) : null}

                    <div className="epaper-page__pager" aria-label="Page navigation">
                      <button
                        type="button"
                        onClick={goToPreviousPage}
                        disabled={activePageIndex === 0}
                        aria-label="Previous page"
                      >
                        <span aria-hidden="true">‹</span>
                      </button>
                      <div className="epaper-page__pager-status">
                        <strong>Page {activePageIndex + 1}</strong>
                        <span>of {pageTotal}</span>
                      </div>
                      <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={activePageIndex >= pageTotal - 1}
                        aria-label="Next page"
                      >
                        <span aria-hidden="true">›</span>
                      </button>
                    </div>
                  </div>

                  {isClipMode ? (
                    <div
                      className="epaper-page__clip-layer"
                      onMouseDown={handleClipPointerDown}
                      onMouseMove={handleClipPointerMove}
                      onMouseUp={handleClipPointerUp}
                      onMouseLeave={handleClipPointerUp}
                      onContextMenu={handleClipContextMenu}
                    >
                      {activeSelection ? (
                        <div
                          className="epaper-page__clip-selection"
                          style={{
                            left: `${activeSelection.x}px`,
                            top: `${activeSelection.y}px`,
                            width: `${activeSelection.width}px`,
                            height: `${activeSelection.height}px`,
                          }}
                        >
                          <button
                            type="button"
                            className="epaper-page__clip-drag"
                            data-drag="selection"
                            aria-label="Move selection"
                          />
                          {['nw', 'ne', 'sw', 'se'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              className={`epaper-page__clip-handle epaper-page__clip-handle--${handle}`}
                              data-handle={handle}
                              aria-label={`Resize ${handle}`}
                            />
                          ))}
                        </div>
                      ) : null}

                      {clipSelection ? (
                        <div className="epaper-page__clip-hint">
                          क्लिप तैयार है, share करने के लिए नीचे वाले options चुनें
                        </div>
                      ) : (
                        <div className="epaper-page__clip-hint">पेपर पर drag करके clip चुनें</div>
                      )}

                      {contextMenu ? (
                        <div
                          className="epaper-page__clip-menu"
                          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
                        >
                          <div className="epaper-page__clip-menu-header">
                            <strong>Clip Share</strong>
                            <button type="button" className="epaper-page__clip-close" onClick={clearClipSelection}>
                              <CloseIcon />
                              <span className="sr-only">Close</span>
                            </button>
                          </div>
                          <button type="button" onClick={handleNativeShare}>
                            <ClipIcon />
                            <span>Share</span>
                          </button>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setContextMenu(null)}
                          >
                            <WhatsAppIcon />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setContextMenu(null)}
                          >
                            <TelegramIcon />
                            <span>Telegram</span>
                          </a>
                          <button type="button" onClick={handleCopyClipLink}>
                            <CopyIcon />
                            <span>Copy Link</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="epaper-page__empty">{epaperContent.emptyState}</div>
              )}
            </div>

            <aside className="epaper-page__side-promo">
              {sideAd ? (
                <section className="epaper-page__promo-card" aria-label={sideAd.ariaLabel}>
                  <strong>{sideAd.title}</strong>
                  <p>{sideAd.subtitle}</p>
                  {sideAd.buttonText ? (
                    <a
                      className="epaper-page__promo-button"
                      href={sideAd.buttonHref || '/'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {sideAd.buttonText}
                    </a>
                  ) : null}
                </section>
              ) : null}
            </aside>
          </div>
        </section>

        <FooterSection content={content.footerSection} />
      </div>
    </main>
  )
}

export default EpaperPage
