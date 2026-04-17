const HOMEPAGE_PLACEMENTS_KEY = 'newgindia.homepage.placements'
export const HOMEPAGE_PLACEMENTS_CHANGE_EVENT = 'newgindia-homepage-placements-change'

export const HOMEPAGE_PLACEMENT_SLOTS = [
  { key: 'heroLead', section: 'Hero News', label: 'Hero lead story' },
  { key: 'heroSide1', section: 'Hero News', label: 'Hero side story 1' },
  { key: 'heroSide2', section: 'Hero News', label: 'Hero side story 2' },
  { key: 'heroSide3', section: 'Hero News', label: 'Hero side story 3' },
  { key: 'heroSide4', section: 'Hero News', label: 'Hero side story 4' },
  { key: 'showcaseLeftFeatured1', section: 'News Showcase', label: 'Showcase featured 1' },
  { key: 'showcaseLeftFeatured2', section: 'News Showcase', label: 'Showcase featured 2' },
  { key: 'showcaseRightFeatured', section: 'News Showcase', label: 'Showcase sidebar lead' },
  { key: 'topicLeftFeatured', section: 'Topic Section', label: 'Topic left lead' },
  { key: 'topicRightFeatured', section: 'Topic Section', label: 'Topic right lead' },
  { key: 'featureBand1', section: 'Featured Section', label: 'Featured card 1' },
  { key: 'featureBand2', section: 'Featured Section', label: 'Featured card 2' },
  { key: 'featureBand3', section: 'Featured Section', label: 'Featured card 3' },
]

function parsePlacements(rawValue) {
  if (!rawValue) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawValue)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function emitHomepagePlacementsChange(placements) {
  window.dispatchEvent(
    new CustomEvent(HOMEPAGE_PLACEMENTS_CHANGE_EVENT, {
      detail: placements,
    }),
  )
}

function writeHomepagePlacements(placements) {
  window.localStorage.setItem(HOMEPAGE_PLACEMENTS_KEY, JSON.stringify(placements))
  emitHomepagePlacementsChange(placements)
}

function formatStoryDate(isoValue) {
  const value = isoValue || new Date().toISOString()

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatHeroTime(isoValue) {
  return formatStoryDate(isoValue)
}

function buildPlacementStoryBase(submission) {
  const reporterName = submission.reporter?.name || submission.reporter?.email || 'NewG India'
  const publishedAt =
    submission.publishing?.publishedAt ||
    submission.publishing?.scheduledFor ||
    submission.submittedAt

  return {
    id: submission.id,
    articleId: submission.articleId ?? submission.id,
    slug: submission.slug,
    title: submission.title,
    summary: submission.summary,
    author: reporterName,
    date: formatStoryDate(publishedAt),
    imageUrl: submission.image?.previewUrl ?? submission.publicStory?.imageUrl ?? '',
    imageAlt: submission.title,
    imageClass: '',
    storySections:
      submission.publicStory?.storySections ??
      submission.publicArticle?.storySections ??
      [],
  }
}

function buildHeroPlacementStory(submission) {
  const baseStory = buildPlacementStoryBase(submission)

  return {
    ...baseStory,
    type: 'article',
    time: formatHeroTime(
      submission.publishing?.publishedAt ||
        submission.publishing?.scheduledFor ||
        submission.submittedAt,
    ),
  }
}

function buildShowcasePlacementStory(submission) {
  const baseStory = buildPlacementStoryBase(submission)

  return {
    ...baseStory,
  }
}

function buildTopicPlacementStory(submission) {
  const baseStory = buildPlacementStoryBase(submission)

  return {
    ...baseStory,
  }
}

function buildFeatureBandPlacementStory(submission) {
  const baseStory = buildPlacementStoryBase(submission)

  return {
    id: baseStory.id,
    articleId: baseStory.articleId,
    slug: baseStory.slug,
    title: baseStory.title,
    author: baseStory.author,
    date: baseStory.date,
    imageUrl: baseStory.imageUrl,
    imageAlt: baseStory.imageAlt,
  }
}

function createPlacementTargetMap(content) {
  return {
    heroLead: {
      getSubmissionShape: buildHeroPlacementStory,
      apply(submission) {
        content.hero = {
          ...content.hero,
          leadStory: buildHeroPlacementStory(submission),
        }
      },
    },
    heroSide1: {
      getSubmissionShape: buildHeroPlacementStory,
      apply(submission) {
        const sideStories = [...content.hero.sideStories]
        sideStories[0] = buildHeroPlacementStory(submission)
        content.hero = {
          ...content.hero,
          sideStories,
        }
      },
    },
    heroSide2: {
      getSubmissionShape: buildHeroPlacementStory,
      apply(submission) {
        const sideStories = [...content.hero.sideStories]
        sideStories[1] = buildHeroPlacementStory(submission)
        content.hero = {
          ...content.hero,
          sideStories,
        }
      },
    },
    heroSide3: {
      getSubmissionShape: buildHeroPlacementStory,
      apply(submission) {
        const sideStories = [...content.hero.sideStories]
        sideStories[2] = buildHeroPlacementStory(submission)
        content.hero = {
          ...content.hero,
          sideStories,
        }
      },
    },
    heroSide4: {
      getSubmissionShape: buildHeroPlacementStory,
      apply(submission) {
        const sideStories = [...content.hero.sideStories]
        sideStories[3] = buildHeroPlacementStory(submission)
        content.hero = {
          ...content.hero,
          sideStories,
        }
      },
    },
    showcaseLeftFeatured1: {
      getSubmissionShape: buildShowcasePlacementStory,
      apply(submission) {
        const featuredStories = [...content.showcase.leftSection.featuredStories]
        featuredStories[0] = buildShowcasePlacementStory(submission)
        content.showcase = {
          ...content.showcase,
          leftSection: {
            ...content.showcase.leftSection,
            featuredStories,
          },
        }
      },
    },
    showcaseLeftFeatured2: {
      getSubmissionShape: buildShowcasePlacementStory,
      apply(submission) {
        const featuredStories = [...content.showcase.leftSection.featuredStories]
        featuredStories[1] = buildShowcasePlacementStory(submission)
        content.showcase = {
          ...content.showcase,
          leftSection: {
            ...content.showcase.leftSection,
            featuredStories,
          },
        }
      },
    },
    showcaseRightFeatured: {
      getSubmissionShape: buildShowcasePlacementStory,
      apply(submission) {
        content.showcase = {
          ...content.showcase,
          rightSection: {
            ...content.showcase.rightSection,
            featuredStory: buildShowcasePlacementStory(submission),
          },
        }
      },
    },
    topicLeftFeatured: {
      getSubmissionShape: buildTopicPlacementStory,
      apply(submission) {
        content.topicSection = {
          ...content.topicSection,
          leftSection: {
            ...content.topicSection.leftSection,
            featuredStory: buildTopicPlacementStory(submission),
          },
        }
      },
    },
    topicRightFeatured: {
      getSubmissionShape: buildTopicPlacementStory,
      apply(submission) {
        content.topicSection = {
          ...content.topicSection,
          rightSection: {
            ...content.topicSection.rightSection,
            featuredStory: buildTopicPlacementStory(submission),
          },
        }
      },
    },
    featureBand1: {
      getSubmissionShape: buildFeatureBandPlacementStory,
      apply(submission) {
        const items = [...content.featureBandSection.items]
        items[0] = buildFeatureBandPlacementStory(submission)
        content.featureBandSection = {
          ...content.featureBandSection,
          items,
        }
      },
    },
    featureBand2: {
      getSubmissionShape: buildFeatureBandPlacementStory,
      apply(submission) {
        const items = [...content.featureBandSection.items]
        items[1] = buildFeatureBandPlacementStory(submission)
        content.featureBandSection = {
          ...content.featureBandSection,
          items,
        }
      },
    },
    featureBand3: {
      getSubmissionShape: buildFeatureBandPlacementStory,
      apply(submission) {
        const items = [...content.featureBandSection.items]
        items[2] = buildFeatureBandPlacementStory(submission)
        content.featureBandSection = {
          ...content.featureBandSection,
          items,
        }
      },
    },
  }
}

export function getHomepagePlacements() {
  return parsePlacements(window.localStorage.getItem(HOMEPAGE_PLACEMENTS_KEY))
}

export function updateHomepagePlacement(slotKey, submissionId, editor = null) {
  const nextPlacements = {
    ...getHomepagePlacements(),
  }

  if (!submissionId) {
    delete nextPlacements[slotKey]
  } else {
    nextPlacements[slotKey] = {
      slotKey,
      submissionId,
      updatedAt: new Date().toISOString(),
      editor,
    }
  }

  writeHomepagePlacements(nextPlacements)
  return nextPlacements[slotKey] ?? null
}

export function setHomepagePlacementsForSubmission(submissionId, slotKeys = [], editor = null) {
  const currentPlacements = getHomepagePlacements()
  const normalizedSlotKeys = [...new Set(slotKeys.filter(Boolean))]
  const nextPlacements = Object.fromEntries(
    Object.entries(currentPlacements).filter(
      ([slotKey, placement]) =>
        placement?.submissionId !== submissionId && !normalizedSlotKeys.includes(slotKey),
    ),
  )

  normalizedSlotKeys.forEach((slotKey) => {
    nextPlacements[slotKey] = {
      slotKey,
      submissionId,
      updatedAt: new Date().toISOString(),
      editor,
    }
  })

  writeHomepagePlacements(nextPlacements)
  return nextPlacements
}

export function clearHomepagePlacementsForSubmission(submissionId) {
  const currentPlacements = getHomepagePlacements()
  const nextPlacements = Object.fromEntries(
    Object.entries(currentPlacements).filter(
      ([, placement]) => placement?.submissionId !== submissionId,
    ),
  )

  if (JSON.stringify(nextPlacements) !== JSON.stringify(currentPlacements)) {
    writeHomepagePlacements(nextPlacements)
  }

  return nextPlacements
}

export function applyHomepagePlacements(content, publishedSubmissions = []) {
  const placements = getHomepagePlacements()
  const placementTargets = createPlacementTargetMap(content)
  const publishedSubmissionMap = new Map(
    publishedSubmissions.map((submission) => [submission.id, submission]),
  )

  Object.entries(placements).forEach(([slotKey, placement]) => {
    const target = placementTargets[slotKey]
    const submission = publishedSubmissionMap.get(placement?.submissionId)

    if (!target || !submission) {
      return
    }

    target.apply(submission)
  })

  return content
}

export { HOMEPAGE_PLACEMENTS_KEY }
