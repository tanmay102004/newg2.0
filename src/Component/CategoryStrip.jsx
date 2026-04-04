import './CategoryStrip.css'

function CategoryStrip({ ariaLabel, blocks, highlightSuffix }) {
  return (
    <section className="category-strip" aria-label={ariaLabel}>
      {blocks.map((block) => (
        <article className="category-strip__card" key={block.name}>
          <span className="category-strip__eyebrow">{block.name}</span>
          <h3>
            {block.name} {highlightSuffix}
          </h3>
          <p>{block.description}</p>
        </article>
      ))}
    </section>
  )
}

export default CategoryStrip
