import './NewsMeta.css'

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22s6-5.49 6-12a6 6 0 1 0-12 0c0 6.51 6 12 6 12Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM4 5h16a2 2 0 0 1 2 2v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a2 2 0 0 1 2-2Zm0 5v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 5h-2v6l5 3 1-1.73-4-2.27Z" />
    </svg>
  )
}

function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.5 10a5.5 5.5 0 0 0-10.7-1.73A4.5 4.5 0 0 0 8.5 17H18a4 4 0 0 0 .5-7Z" />
    </svg>
  )
}

const iconMap = {
  pin: IconPin,
  calendar: IconCalendar,
  clock: IconClock,
  cloud: IconCloud,
}

function NewsMeta({ ariaLabel, items }) {
  return (
    <section className="news-meta" aria-label={ariaLabel}>
      {items.map((item) => {
        const Icon = iconMap[item.icon]

        return (
          <div className="news-meta__item" key={`${item.icon}-${item.label}`}>
            <Icon />
            <span>{item.label}</span>
          </div>
        )
      })}
    </section>
  )
}

export default NewsMeta
