import './WhatsAppPromo.css'

function WhatsAppPromo({ content }) {
  if (!content?.href) {
    return null
  }

  return (
    <section className="whatsapp-promo" aria-label={content.ariaLabel ?? 'व्हाट्सऐप चैनल प्रमोशन'}>
      <a className="whatsapp-promo__surface" href={content.href} target="_blank" rel="noreferrer">
        <div className="whatsapp-promo__badge">WhatsApp</div>
        <div className="whatsapp-promo__copy">
          <p className="whatsapp-promo__title">{content.title}</p>
          {content.subtitle ? <p className="whatsapp-promo__subtitle">{content.subtitle}</p> : null}
        </div>
        <span className="whatsapp-promo__button">{content.buttonText ?? 'क्लिक करें'}</span>
      </a>
    </section>
  )
}

export default WhatsAppPromo
