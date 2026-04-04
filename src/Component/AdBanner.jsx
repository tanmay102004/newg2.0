import './AdBanner.css'

function AdBanner({ content }) {
  const variantClass = content.variant === 'square' ? 'ad-banner--square' : 'ad-banner--wide'

  return (
    <section className={`ad-banner ${variantClass}`} aria-label={content.ariaLabel}>
      <div className="ad-banner__surface">
        <div className="ad-banner__content">
          <div className="ad-banner__copy">
            <p className="ad-banner__title">{content.title}</p>
            <p className="ad-banner__subtitle">{content.subtitle}</p>
          </div>
          {content.buttonText ? (
            <a className="ad-banner__button" href={content.buttonHref || '/'} target="_blank" rel="noreferrer">
              {content.buttonText}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default AdBanner
