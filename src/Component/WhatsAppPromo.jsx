import './WhatsAppPromo.css'
import qrCodeImage from '../assets/My_QR_Code_1-1024.jpeg'
import whatsappLogo from '../assets/Logo-1.png'

function WhatsAppPromo({ content }) {
  if (!content?.href) {
    return null
  }

  return (
    <section className="whatsapp-promo" aria-label={content.ariaLabel ?? 'WhatsApp channel promotion'}>
      <a className="whatsapp-promo__surface" href={content.href} target="_blank" rel="noreferrer">
        <div className="whatsapp-promo__logo-wrap">
          <img className="whatsapp-promo__logo" src={whatsappLogo} alt="WhatsApp" />
        </div>
        <div className="whatsapp-promo__copy">
          <p className="whatsapp-promo__title">{content.title}</p>
          {content.subtitle ? <p className="whatsapp-promo__subtitle">{content.subtitle}</p> : null}
        </div>
        <div className="whatsapp-promo__qr" aria-hidden="true">
          <img src={qrCodeImage} alt="" loading="lazy" />
        </div>
      </a>
    </section>
  )
}

export default WhatsAppPromo
