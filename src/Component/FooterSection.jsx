import './FooterSection.css'
import { resolveFixedSocialHref } from '../utils/socialLinks'
import qrCodeImage from '../assets/My_QR_Code_1-1024.jpeg'

function SocialIcon({ type }) {
  if (type === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.97L0 24l6.3-1.66a11.86 11.86 0 0 0 5.77 1.47h.01c6.57 0 11.92-5.35 11.92-11.93 0-3.19-1.24-6.18-3.48-8.4ZM12.08 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.88 9.88 0 0 1 8.38-15.2c2.63 0 5.09 1.02 6.95 2.88a9.8 9.8 0 0 1 2.88 6.96c0 5.49-4.47 9.97-9.93 9.98Zm5.46-7.42c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.79-1.47-1.77-1.64-2.07-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.5 1.08 2.94 1.23 3.14.15.2 2.12 3.23 5.13 4.52.72.31 1.28.5 1.72.63.72.23 1.37.2 1.89.12.57-.08 1.78-.73 2.03-1.44.25-.72.25-1.34.17-1.47-.07-.12-.27-.2-.57-.35Z"
        />
      </svg>
    )
  }

  const icons = {
    facebook: 'f',
    instagram: '◎',
    x: 'X',
    youtube: '▶',
    telegram: '✈',
  }

  return <span aria-hidden="true">{icons[type] ?? '•'}</span>
}

function StoreIcon({ type }) {
  if (type === 'android') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7.1 5.2 5.7 2.8a.55.55 0 0 1 .96-.55l1.45 2.5A9.4 9.4 0 0 1 12 4c1.37 0 2.67.28 3.88.78l1.45-2.5a.55.55 0 1 1 .96.55l-1.4 2.4c2.2 1.18 3.7 3.18 3.88 5.52H3.23c.18-2.34 1.68-4.34 3.87-5.53ZM8.7 8.4a.82.82 0 1 0 0-1.64.82.82 0 0 0 0 1.64Zm6.6 0a.82.82 0 1 0 0-1.64.82.82 0 0 0 0 1.64ZM4.7 11.9h1.36v5.6c0 .73.6 1.33 1.33 1.33h.95V22a1.1 1.1 0 1 0 2.2 0v-3.17h2.92V22a1.1 1.1 0 1 0 2.2 0v-3.17h.95c.73 0 1.33-.6 1.33-1.33v-5.6h1.36a1.1 1.1 0 1 0 0-2.2H4.7a1.1 1.1 0 1 0 0 2.2Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.15 3.4c.82-.98 1.36-2.32 1.21-3.4-1.2.08-2.58.8-3.43 1.8-.76.88-1.43 2.24-1.24 3.55 1.33.1 2.66-.68 3.46-1.95ZM19.2 12.9c.03-2.34 1.9-3.46 1.99-3.51-1.08-1.6-2.77-1.82-3.36-1.84-1.43-.15-2.8.86-3.52.86-.72 0-1.82-.84-3-.82-1.54.03-2.97.93-3.76 2.34-1.6 2.78-.41 6.9 1.14 9.16.76 1.1 1.66 2.33 2.84 2.29 1.13-.05 1.56-.72 2.93-.72 1.38 0 1.76.72 2.95.69 1.22-.02 1.99-1.11 2.74-2.22.86-1.28 1.21-2.52 1.23-2.59-.03-.02-2.35-.92-2.38-3.64Z" />
    </svg>
  )
}

function FooterSection({ content }) {
  if (!content) {
    return null
  }

  const {
    brandTitle,
    brandSubtitle,
    about,
    socialLabel,
    socialLinks = [],
    columns = [],
    promo,
    appLabel,
    appLinks = [],
  } = content

  return (
    <footer className="site-footer" aria-label={content.ariaLabel ?? 'Footer'}>
      <div className="site-footer__top-line" aria-hidden="true" />

      <div className="site-footer__header">
        <div className="site-footer__brand">
          <div className="site-footer__logo-mark">newG</div>
          <div className="site-footer__brand-copy">
            <strong>{brandTitle}</strong>
            <span>{brandSubtitle}</span>
          </div>
        </div>

        <div className="site-footer__social">
          <span className="site-footer__social-label">{socialLabel}</span>
          <div className="site-footer__social-links">
            {socialLinks.map((item) => (
              <a
                key={`${item.label}-${item.href}`}
                className={`site-footer__social-link is-${item.type ?? 'default'}`}
                href={resolveFixedSocialHref(item)}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                title={item.label}
              >
                <SocialIcon type={item.type} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__rule" />

      <div className="site-footer__body">
        <div className="site-footer__about">
          <p>{about}</p>
        </div>

        <div className="site-footer__nav">
          {columns.map((column, index) => (
            <div key={`${column.title ?? 'column'}-${index}`} className="site-footer__column">
              {column.title ? <h3>{column.title}</h3> : null}
              <ul>
                {(column.links ?? []).map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer__promo">
          {promo ? (
            <a
              className="site-footer__promo-card"
              href={promo.href}
              target="_blank"
              rel="noreferrer"
            >
              <div className="site-footer__promo-copy">
                <span>{promo.kicker}</span>
                <strong>{promo.title}</strong>
                <p>{promo.subtitle}</p>
              </div>
              <div className="site-footer__promo-qr" aria-hidden="true">
                <img src={qrCodeImage} alt="" loading="lazy" />
              </div>
            </a>
          ) : null}

          <div className="site-footer__apps">
            <span>{appLabel}</span>
            <div className="site-footer__app-links">
              {appLinks.map((item) => (
                <a
                  key={`${item.label}-${item.href}`}
                  className={`site-footer__app-link is-${item.type ?? 'default'}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                >
                  <StoreIcon type={item.type} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
