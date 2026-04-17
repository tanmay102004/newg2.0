import { getLinkBehavior } from '../utils/articleRouting'
import { resolveStorySections } from '../utils/storySections'

function StorySectionChips({
  story,
  sections,
  limit,
  wrapperClassName,
  itemClassName,
}) {
  const resolvedSections = (sections ?? resolveStorySections(story)).slice(0, limit ?? Number.MAX_SAFE_INTEGER)

  if (!resolvedSections.length) {
    return null
  }

  return (
    <div className={wrapperClassName}>
      {resolvedSections.map((section) => (
        <a
          key={`${section.label}-${section.href}`}
          className={itemClassName}
          href={section.href}
          {...getLinkBehavior(section.href)}
        >
          {section.label}
        </a>
      ))}
    </div>
  )
}

export default StorySectionChips
