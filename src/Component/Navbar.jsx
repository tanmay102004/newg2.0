import { useEffect, useMemo, useRef, useState } from 'react'
import './Navbar.css'

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 20.3-4.35-4.35a7.5 7.5 0 1 0-1.41 1.41L19.59 22 21 20.3ZM5 10.5a5.5 5.5 0 1 1 5.5 5.5A5.51 5.51 0 0 1 5 10.5Z" />
    </svg>
  )
}

function Navbar({ navItems, brand, labels, activeItem }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreRef = useRef(null)
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!moreRef.current?.contains(event.target)) {
        setIsMoreOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <header className="masthead">
      <div className="brand-block">
        <a className="brand" href="/">
          <span className="brand__title">{brand.title}</span>
          <span className="brand__subtitle">{brand.subtitle}</span>
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
        <a className="header-pill-link" href={ePaperHref} target="_blank" rel="noreferrer">
          {ePaperLabel}
        </a>
        <a className="header-pill-link" href={eMagazineHref}>
          {eMagazineLabel}
        </a>
        <button className="icon-button" type="button" aria-label={labels.searchLabel}>
          <IconSearch />
        </button>
        <a className="signin-link" href="/">
          <span>{labels.signInLabel}</span>
        </a>
      </div>
    </header>
  )
}

export default Navbar
