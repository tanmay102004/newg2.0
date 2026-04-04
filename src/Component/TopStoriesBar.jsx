import './TopStoriesBar.css'

function TopStoriesBar({ label, ariaLabel, stories }) {
  const repeatedStories = [...stories, ...stories]

  return (
    <section className="top-stories-bar" aria-label={ariaLabel}>
      <div className="top-stories-bar__label">{label}</div>
      <div className="top-stories-ticker">
        <div className="top-stories-ticker__track">
          {repeatedStories.map((story, index) => (
            <span className="top-stories-ticker__item" key={`${story}-${index}`}>
              {story}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopStoriesBar
