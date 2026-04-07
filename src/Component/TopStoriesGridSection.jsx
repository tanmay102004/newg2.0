import './TopStoriesGridSection.css'

function TopStoriesGridSection({ title, stories = [], ariaLabel }) {
  const items = stories.filter(Boolean)
  const sectionTitle = 'सबसे अधिक लोकप्रिय'

  if (!items.length) {
    return null
  }

  return (
    <section
      className="top-stories-grid"
      aria-label={ariaLabel ?? sectionTitle}
    >
      <div className="top-stories-grid__heading">
        <span
          className="top-stories-grid__accent"
          aria-hidden="true"
        />
        <h2>{sectionTitle}</h2>
      </div>

      <div className="top-stories-grid__list">
        {items.map((story, index) => (
          <article
            key={`${index + 1}-${story.slice(0, 24)}`}
            className="top-stories-grid__item"
          >
            <span className="top-stories-grid__number">{index + 1}</span>
            <p>{story}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TopStoriesGridSection
