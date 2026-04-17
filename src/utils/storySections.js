const SECTION_HREFS = {
  होम: '/',
  ब्रेकिंग: '/?breaking=1',
  एक्सप्लेनर: '/?explainer=1',
  चुनाव: '/?election=1',
  पॉडकास्ट: '/?podcast=1',
  देश: '/?desh=1',
  विदेश: '/?videsh=1',
  राज्य: '/?rajya=1',
  राजनीति: '/?rajniti=1',
  मनोरंजन: '/?entertainment=1',
  एजुकेशन: '/?education=1',
  खेल: '/?khel=1',
  न्यूज़: '/?news=1',
  'न्यूज़ खिड़की': '/?newsKhidki=1',
  स्पेशल: '/?special=1',
  सेहत: '/?sehat=1',
  'धर्म और संस्कृति': '/?dharmaCulture=1',
  संपादकीय: '/?sampadkiya=1',
  टेक्नोलॉजी: '/?technology=1',
}

function normalizeStorySectionItem(item) {
  if (!item) {
    return null
  }

  if (typeof item === 'string') {
    const label = item.trim()

    if (!label) {
      return null
    }

    return {
      label,
      href: SECTION_HREFS[label] ?? '#',
    }
  }

  const label = (item.label ?? item.name ?? item.title ?? '').trim()

  if (!label) {
    return null
  }

  return {
    label,
    href: item.href ?? item.url ?? SECTION_HREFS[label] ?? '#',
  }
}

export function resolveStorySections(story = {}) {
  const items = story.storySections ?? story.publishedIn ?? story.sections ?? story.tags ?? []

  return items.map(normalizeStorySectionItem).filter(Boolean)
}

