import { useEffect, useMemo, useRef, useState } from 'react'
import './Navbar.css'
import { homePageContent } from '../data/homePageContent'
import { buildSearchResults } from '../utils/search'
import brandLogo from '../assets/Logo 2.png'

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 20.3-4.35-4.35a7.5 7.5 0 1 0-1.41 1.41L19.59 22 21 20.3ZM5 10.5a5.5 5.5 0 1 1 5.5 5.5A5.51 5.51 0 0 1 5 10.5Z" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    </svg>
  )
}

function Navbar({ navItems, brand, labels, activeItem }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const moreRef = useRef(null)
  const searchRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const searchInputRef = useRef(null)
  const ePaperLabel = labels?.ePaperLabel ?? 'ई-पेपर'
  const ePaperHref = labels?.ePaperHref ?? '/'
  const eMagazineLabel = labels?.eMagazineLabel ?? 'ई-मैगज़ीन'
  const eMagazineHref = labels?.eMagazineHref ?? '/'
  const resolvedNavItems = useMemo(
    () =>
      (navItems ?? []).map((item) =>
        typeof item === 'string'
          ? { label: item, href: '/', isMore: item.toLowerCase() === 'more' }
          : {
              label: item.label ?? item.title ?? '',
              href: item.href ?? item.url ?? '/',
              isMore: item.isMore ?? false,
            },
      ),
    [navItems],
  )
  const moreItems = labels?.moreItems ?? []
  const mobileMenuItems = useMemo(
    () => [
      ...resolvedNavItems.filter((item) => !item.isMore && item.label),
      ...moreItems.map((item) => ({
        label: item.label ?? item.title ?? '',
        href: item.href ?? item.url ?? '/',
      })),
      { label: ePaperLabel, href: ePaperHref },
      { label: eMagazineLabel, href: eMagazineHref },
    ],
    [resolvedNavItems, moreItems, ePaperLabel, ePaperHref, eMagazineLabel, eMagazineHref],
  )
  const searchResults = useMemo(
    () => buildSearchResults(homePageContent, searchQuery),
    [searchQuery],
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!moreRef.current?.contains(event.target)) {
        setIsMoreOpen(false)
      }

      if (!searchRef.current?.contains(event.target)) {
        setIsSearchOpen(false)
      }

      if (!mobileMenuRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false)
        setIsSearchOpen(false)
        setIsMobileMenuOpen(false)
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
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    if (searchResults[0]?.href) {
      window.location.href = searchResults[0].href
      return
    }

    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      window.location.href = `/?tag=${encodeURIComponent(trimmedQuery)}`
    }
  }

  return (
    <header className="masthead">
      <div className="brand-block">
        <a className="brand" href="/">
          <img className="brand__logo" src={brandLogo} alt={brand.title ?? 'NewG India'} />
        </a>
      </div>

      <nav className="main-nav" aria-label={labels.ariaLabel}>
        {resolvedNavItems.map((item, index) =>
          item.isMore ? (
            <div
              key={item.label}
              className={`main-nav__more${isMoreOpen ? ' is-open' : ''}`}
              ref={moreRef}
            >
              <button
                type="button"
                className="main-nav__link main-nav__more-trigger"
                onClick={() => setIsMoreOpen((value) => !value)}
                aria-expanded={isMoreOpen}
                aria-haspopup="true"
              >
                {item.label}
                <span className="main-nav__more-caret" aria-hidden="true">
                  {isMoreOpen ? '▴' : '▾'}
                </span>
              </button>

              {isMoreOpen ? (
                <div className="main-nav__dropdown">
                  {moreItems.map((moreItem) => (
                    <a
                      key={`${moreItem.label}-${moreItem.href}`}
                      className="main-nav__dropdown-link"
                      href={moreItem.href}
                      onClick={() => setIsMoreOpen(false)}
                    >
                      {moreItem.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <a
              key={item.label}
              className={`main-nav__link${
                activeItem ? (item.label === activeItem ? ' is-active' : '') : index === 0 ? ' is-active' : ''
              }`}
              href={item.href}
            >
              {item.label}
            </a>
          ),
        )}
      </nav>

      <div className="header-actions">
        <a className="header-pill-link header-pill-link--desktop" href={ePaperHref} target="_blank" rel="noreferrer">
          {ePaperLabel}
        </a>
        <a className="header-pill-link header-pill-link--desktop" href={eMagazineHref} target="_blank" rel="noreferrer">
          {eMagazineLabel}
        </a>
        <div className={`navbar-search${isSearchOpen ? ' is-open' : ''}`} ref={searchRef}>
          <button
            className="icon-button"
            type="button"
            aria-label={labels.searchLabel}
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((value) => !value)}
          >
            <IconSearch />
          </button>

          {isSearchOpen ? (
            <form className="navbar-search__panel" role="search" onSubmit={handleSearchSubmit}>
              <label className="navbar-search__field">
                <span className="sr-only">{labels.searchLabel}</span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search page, tag, story..."
                />
              </label>

              <div className="navbar-search__results">
                {searchResults.length ? (
                  searchResults.map((result) => (
                    <a key={`${result.type}-${result.href}`} className="navbar-search__result" href={result.href}>
                      <span>{result.type}</span>
                      <strong>{result.title}</strong>
                      {result.description ? <small>{result.description}</small> : null}
                    </a>
                  ))
                ) : searchQuery.trim() ? (
                  <a
                    className="navbar-search__result"
                    href={`/?tag=${encodeURIComponent(searchQuery.trim())}`}
                  >
                    <span>Search</span>
                    <strong>{searchQuery.trim()}</strong>
                    <small>View stories for this tag or keyword</small>
                  </a>
                ) : (
                  <p className="navbar-search__empty">Type page, tag, or story name</p>
                )}
              </div>
            </form>
          ) : null}
        </div>

        <div className={`navbar-mobile-menu${isMobileMenuOpen ? ' is-open' : ''}`} ref={mobileMenuRef}>
          <button
            className="icon-button navbar-mobile-menu__trigger"
            type="button"
            aria-label={labels.menuLabel ?? 'Menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            <IconMenu />
          </button>

          {isMobileMenuOpen ? (
            <div className="navbar-mobile-menu__panel">
              <nav className="navbar-mobile-menu__list" aria-label={labels.ariaLabel}>
                {mobileMenuItems.map((item) => (
                  <a
                    key={`${item.label}-${item.href}`}
                    className={`navbar-mobile-menu__link${
                      activeItem && item.label === activeItem ? ' is-active' : ''
                    }`}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Navbar
