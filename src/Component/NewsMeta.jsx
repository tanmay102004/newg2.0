import './NewsMeta.css'
import { buildTagHref } from '../utils/articleRouting'

function TrendingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 16.5 9 10.5l4 4L21 6.5" />
      <path d="M14 6.5h7v7" />
    </svg>
  )
}

function normalizeItems(items = []) {
  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { label: item, href: buildTagHref(item) }
      }

      const label = item.label ?? item.title ?? item.name ?? ''

      return {
        label,
        href: item.href ?? item.url ?? item.slug ?? buildTagHref(label),
      }
    })
    .filter((item) => item.label)
}

function NewsMeta({ ariaLabel, label = 'ट्रेंडिंग:', items = [] }) {
  const normalizedItems = normalizeItems(items)

  if (!normalizedItems.length) {
    return null
  }

  return (
    <section className="news-meta" aria-label={ariaLabel}>
      <div className="news-meta__label">
        <TrendingIcon />
        <span>{label}</span>
      </div>

      <div className="news-meta__items">
        {normalizedItems.map((item) => (
          <a className="news-meta__chip" key={`${item.label}-${item.href}`} href={item.href}>
            {item.label}
          </a>
        ))}
      </div>
    </section>
  )
}

export default NewsMeta
