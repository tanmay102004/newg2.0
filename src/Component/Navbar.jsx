import './Navbar.css'

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 20.3-4.35-4.35a7.5 7.5 0 1 0-1.41 1.41L19.59 22 21 20.3ZM5 10.5a5.5 5.5 0 1 1 5.5 5.5A5.51 5.51 0 0 1 5 10.5Z" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h18v2H3V7Zm0 8h18v2H3v-2Z" />
    </svg>
  )
}

function Navbar({ navItems, brand, labels }) {
  return (
    <header className="masthead">
      <div className="brand-block">
        <a className="brand" href="/">
          <span className="brand__title">{brand.title}</span>
          <span className="brand__subtitle">{brand.subtitle}</span>
        </a>
      </div>

      <nav className="main-nav" aria-label={labels.ariaLabel}>
        {navItems.map((item, index) => (
          <a
            key={item}
            className={`main-nav__link${index === 0 ? ' is-active' : ''}`}
            href="/"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button" type="button" aria-label={labels.searchLabel}>
          <IconSearch />
        </button>
        <a className="signin-link" href="/">
          <IconUser />
          <span>{labels.signInLabel}</span>
        </a>
        <button className="icon-button" type="button" aria-label={labels.menuLabel}>
          <IconMenu />
        </button>
      </div>
    </header>
  )
}

export default Navbar
