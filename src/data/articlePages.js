import { resolveStorySections } from '../utils/storySections'
import { getPublishedArticlePages, getPublishedStorySummaries } from '../services/storySubmissions'

const baseArticle = {
  id: 'default',
  categoryChips: ['देश', 'राजनीति'],
  title:
    '“घायल हूं इसलिए घातक हूं”: राघव चड्ढा ने धुरंधर फिल्म के डायलॉग से विरोधियों को दिया जवाब',
  dek:
    'राघव चड्ढा ने सोशल मीडिया प्लेटफ़ॉर्म एक्स पर वीडियो जारी कर अपनी ही पार्टी के नेताओं को करारा जवाब दिया. उन्होंने हालिया रिलीज फिल्म “धुरंधर” के एक मशहूर डायलॉग का सहारा लेते हुए कहा, “घायल हूं, इसलिए घातक हूं”.',
  author: {
    name: 'DISHA ROJHE',
    email: 'disharojhe007@gmail.com',
    bio:
      'I am a detail-oriented Content Writer with professional experience in digital and broadcast news media. I have worked with reputed platforms crafting engaging, informative, and audience-focused content.',
  },
  date: 'April 4, 2026',
  commentCount: 0,
  heroImageUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1400&q=80',
  shareLinks: [
    { label: 'Facebook', type: 'facebook', href: 'https://facebook.com' },
    { label: 'X', type: 'x', href: 'https://x.com' },
    { label: 'LinkedIn', type: 'linkedin', href: 'https://linkedin.com' },
    {
      label: 'WhatsApp',
      type: 'whatsapp',
      href: 'https://www.whatsapp.com/channel/0029VbARg0EAInPk4QfyIW2m',
    },
    { label: 'Email', type: 'email', href: 'mailto:' },
    { label: 'Telegram', type: 'telegram', href: 'https://t.me/' },
  ],
  blocks: [
    {
      type: 'paragraph',
      content:
        'नई दिल्ली : आम आदमी पार्टी के अंदर सधे घमासान ने अब एक फिल्मी मोड़ ले लिया है. राज्यसभा सांसद राघव चड्ढा और पार्टी के शीर्ष नेतृत्व के बीच तल्ख़ियां खुलकर सामने आ रही हैं.',
    },
    {
      type: 'paragraph',
      content:
        'शनिवार को राघव चड्ढा ने सोशल मीडिया प्लेटफ़ॉर्म “एक्स” पर एक वीडियो जारी कर अपनी ही पार्टी के नेताओं को करारा जवाब दिया. उन्होंने फिल्म “धुरंधर” के डायलॉग का इस्तेमाल करते हुए कहा कि चुप रहने को कमजोरी समझने वालों को अब स्पष्ट उत्तर दिया जाएगा.',
    },
    {
      type: 'embed',
      platform: 'x',
      authorName: 'Raghav Chadha',
      handle: '@raghav_chadha',
      body:
        'ये तीनों नहीं जानते थे, मगर मैं चुप रहता तो बार-बार दोहराया गया झूठ भी सच बनने लगता। Three Allegations. Zero Truth. My Response:',
      imageUrl:
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=900&q=80',
      caption: '4:25 PM · Apr 4, 2026',
    },
    {
      type: 'heading',
      content: 'आप के तीन आरोपों पर राघव का जवाब',
    },
    {
      type: 'paragraph',
      content:
        'पार्टी ने राघव चड्ढा पर अनुशासनहीनता के तीन मुख्य आरोप लगाए थे, जिनका उन्होंने वीडियो में विस्तार से खंडन किया. उन्होंने दावा किया कि पूरा विवाद आंतरिक राजनीति और कथित ग़लत ब्रीफिंग का परिणाम है.',
    },
    {
      type: 'ordered-list',
      items: [
        'बॉयकॉट में साथ न देने का आरोप: राघव ने कहा कि जब पूरा विपक्ष सदन से बाहर जा रहा था, तब वह वहीं बैठे रहे थे. उन्होंने चुनौती देते हुए कहा, “फुटेज निकलवाकर देखो कि मैंने कब विपक्ष का साथ नहीं दिया. यह सरासर झूठ है.”',
        'मुख्य चुनाव आयुक्त के खिलाफ याचिका पर हस्ताक्षर: दूसरे आरोप पर उन्होंने कहा कि किसी औपचारिक या अनौपचारिक दस्तावेज़ पर साइन करने से इनकार करने की बात तथ्यहीन है. उनका दावा था कि इस मुद्दे को बढ़ा-चढ़ाकर पेश किया गया.',
        'स्क्रिप्टेड साज़िश का दावा: राघव चड्ढा ने कहा कि कल से जो भाषा पार्टी के नेता इस्तेमाल कर रहे हैं, वह एक जैसी है. उन्होंने संकेत दिया कि उन्हें दरकिनार करने के लिए पार्टी के भीतर ही साज़िश रची जा रही है.',
      ],
    },
    {
      type: 'heading',
      content: 'क्या “धुरंधर” बनेगा राजनीति का नया चेहरा?',
    },
    {
      type: 'paragraph',
      content:
        'राघव चड्ढा द्वारा फिल्म “धुरंधर” के डायलॉग का इस्तेमाल करना चर्चा का विषय बन गया है. राजनीतिक गलियारों में इसे एक संकेत की तरह देखा जा रहा है कि वह अब सार्वजनिक तौर पर अपने विरोधियों का जवाब देने के मूड में हैं.',
    },
  ],
  tags: ['aam aadmi party', 'aap', 'delhi politics', 'raghav chadha', 'धुरंधर dialogue'],
  previousArticle: {
    id: 'foreign-ministry-reply',
    title: 'दूर देशों में विदेशी खिड़की कहे जाने पर दिया मज़ेदार जवाब',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  nextArticle: {
    id: 'railway-safety-story',
    title: 'पूर्वी रेलवे ने यात्रियों की सुरक्षा, आराम और बेहतर यात्रा अनुभव के लिए किए बड़े बदलाव',
    imageUrl:
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&q=80',
  },
  sidebar: {
    relatedStories: [
      {
        id: 'zulfiya-road-story',
        title: 'उज्बेक की 13 वर्षीय छात्रा विनाशा ने कवयित्री जुल्फिया पर लिखी किताब',
        date: 'April 5, 2026',
        author: 'DISHA ROJHE',
        imageUrl:
          'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'railway-passenger-service',
        title: 'उत्तर रेलवे ने यात्री सेवाओं से लेकर यात्री सुरक्षा तक दर्ज की रिकॉर्ड उपलब्धियां',
        date: 'April 4, 2026',
        author: 'Samiksha Mishra',
        imageUrl:
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'tender-deposit-story',
        title: 'दिल्ली में टेंडर प्रक्रिया में बदलाव, अब earnest money deposit पूरी तरह डिजिटल',
        date: 'April 4, 2026',
        author: 'Sanjay Rai',
        imageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80',
      },
    ],
    subscribeBox: {
      title: 'न्यूज़लेटर के लिए सब्सक्राइब करें',
      placeholder: 'Email',
      buttonLabel: 'सब्सक्राइब',
    },
    categories: [
      {
        label: 'देश',
        count: 1455,
        imageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      },
      {
        label: 'ब्रेकिंग',
        count: 246,
        imageUrl:
          'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=80',
      },
      {
        label: 'राज्य',
        count: 1606,
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      },
      {
        label: 'विदेश',
        count: 375,
        imageUrl:
          'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
}

export const defaultArticlePages = {
  default: baseArticle,
  'lead-drone-story': {
    ...baseArticle,
    id: 'lead-drone-story',
    categoryChips: ['देश', 'रक्षा'],
    title: 'ईरानी ड्रोन और बदलता युद्ध: भारत के लिए नई सुरक्षा रणनीति क्यों जरूरी हो गई है',
    dek:
      'कम लागत वाले ड्रोन और उन्नत वायु रक्षा प्रणालियों के बीच बढ़ती तकनीकी होड़ ने रक्षा विश्लेषकों का ध्यान खींचा है. सवाल यह है कि भारत इस बदलते युद्ध से क्या सीख सकता है.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1400&q=80',
  },
}

export function normalizeSummaryStory(story = {}) {
  if (!story) {
    return null
  }

  return {
    id: story.id ?? story.articleId ?? story.slug ?? '',
    title: story.title ?? story.headline ?? '',
    summary: story.summary ?? story.excerpt ?? story.description ?? '',
    author: story.author ?? story.writer ?? story.byline ?? '',
    date: story.date ?? story.publishedAt ?? '',
    imageUrl: story.imageUrl ?? story.thumbnailUrl ?? story.image ?? '',
    imageClass: story.imageClass ?? '',
    storySections: resolveStorySections(story),
  }
}

export function collectSummaryStories(content = {}) {
  const pool = []
  const publishedStories = getPublishedStorySummaries()

  const pushStory = (story) => {
    const normalized = normalizeSummaryStory(story)
    if (normalized?.id) {
      pool.push(normalized)
    }
  }

  pushStory(content?.hero?.leadStory)
  ;(content?.hero?.sideStories ?? []).forEach(pushStory)
  ;(content?.showcase?.leftSection?.featuredStories ?? []).forEach(pushStory)
  ;(content?.showcase?.leftSection?.secondaryStories ?? []).forEach(pushStory)
  pushStory(content?.showcase?.rightSection?.featuredStory)
  ;(content?.showcase?.rightSection?.listStories ?? []).forEach(pushStory)
  pushStory(content?.topicSection?.leftSection?.featuredStory)
  ;(content?.topicSection?.leftSection?.stories ?? []).forEach(pushStory)
  pushStory(content?.topicSection?.rightSection?.featuredStory)
  ;(content?.topicSection?.rightSection?.stories ?? []).forEach(pushStory)
  ;(content?.featureBandSection?.items ?? []).forEach(pushStory)
  ;(content?.newsColumnsSection?.stories ?? []).forEach(pushStory)
  ;(content?.newsColumnsSection?.sidebarBlocks ?? []).forEach((block) => pushStory(block?.story))
  publishedStories.forEach(pushStory)

  return pool
}

export function buildStoryFromArticle(article = {}) {
  const firstParagraph =
    article.blocks?.find((block) => block.type === 'paragraph')?.content ??
    article.dek ??
    article.summary ??
    ''

  return normalizeSummaryStory({
    id: article.id,
    title: article.title,
    summary: firstParagraph,
    author: article.author?.name,
    date: article.date,
    publishedAt: article.publishedAt,
    imageUrl: article.heroImageUrl,
    imageClass: article.heroImageClass,
    storySections: resolveStorySections({
      storySections: article.storySections ?? article.publishedIn ?? article.categoryChips ?? article.tags ?? [],
    }),
  })
}

function normalizeAuthorName(value = '') {
  return value.trim().toLowerCase()
}

function mergeSidebarContent(baseSidebar = {}, sharedSidebar = {}) {
  return {
    relatedStories: sharedSidebar.relatedStories ?? baseSidebar.relatedStories ?? [],
    subscribeBox: sharedSidebar.subscribeBox ?? baseSidebar.subscribeBox ?? {},
    categories: sharedSidebar.categories ?? baseSidebar.categories ?? [],
  }
}

function mergeSummaryIntoArticle(template, summary, articleId, blocksOverride) {
  if (!summary) {
    return {
      ...template,
      id: articleId || template.id,
    }
  }

  const introParagraph = summary.summary
    ? {
        type: 'paragraph',
        content: summary.summary,
      }
    : null

  return {
    ...template,
    id: articleId || summary.id || template.id,
    title: summary.title || template.title,
    dek: summary.summary || template.dek,
    date: summary.date || template.date,
    categoryChips:
      summary.storySections?.length
        ? summary.storySections.slice(0, 2).map((section) => section.label)
        : template.categoryChips,
    author: {
      ...template.author,
      name: summary.author || template.author.name,
    },
    heroImageUrl: summary.imageUrl || template.heroImageUrl,
    heroImageClass: summary.imageClass || template.heroImageClass || '',
    blocks: introParagraph
      ? [introParagraph, ...(blocksOverride ?? template.blocks).slice(1)]
      : (blocksOverride ?? template.blocks),
  }
}

export function getArticlePageContent(articleId, content = {}) {
  const publishedArticlePages = getPublishedArticlePages()
  const remotePages = {
    ...(content?.articlePages ?? {}),
    ...publishedArticlePages,
  }
  const remoteArticle = remotePages[articleId] ?? null
  const sharedSidebar =
    content?.articleDetailSidebar ??
    content?.articlePageSidebar ??
    content?.articleSidebar ??
    {}
  const availablePages = {
    ...defaultArticlePages,
    ...remotePages,
  }

  const template =
    availablePages[articleId] ??
    remotePages.default ??
    availablePages.default ??
    baseArticle

  const summary = collectSummaryStories(content).find((item) => item.id === articleId)
  const blocksOverride = remoteArticle
    ? remoteArticle.blocks ?? (template.blocks ?? []).filter((block) => block.type !== 'embed')
    : template.blocks

  return mergeSummaryIntoArticle(template, summary, articleId, blocksOverride)
}

export function getResolvedArticlePageContent(articleId, content = {}) {
  const article = getArticlePageContent(articleId, content)
  const sharedSidebar =
    content?.articleDetailSidebar ??
    content?.articlePageSidebar ??
    content?.articleSidebar ??
    {}

  return {
    ...article,
    sidebar: mergeSidebarContent(article.sidebar, sharedSidebar),
  }
}

export function getResolvedAuthorPageContent(authorName, content = {}) {
  const requestedAuthor = authorName?.trim() || ''
  const normalizedAuthor = normalizeAuthorName(requestedAuthor)
  const remoteAuthorPages = content?.authorPages ?? {}
  const remoteAuthorPage =
    remoteAuthorPages[requestedAuthor] ??
    remoteAuthorPages[normalizedAuthor] ??
    null
  const sharedSidebar =
    remoteAuthorPage?.sidebar ??
    content?.articleDetailSidebar ??
    content?.articlePageSidebar ??
    content?.articleSidebar ??
    {}

  const summaryStories = collectSummaryStories(content)
  const articleStories = Object.values({
    ...defaultArticlePages,
    ...(content?.articlePages ?? {}),
  })
    .map(buildStoryFromArticle)
    .filter(Boolean)

  const storyMap = new Map()
  ;[...summaryStories, ...articleStories].forEach((story) => {
    if (!story?.id) {
      return
    }

    if (!storyMap.has(story.id)) {
      storyMap.set(story.id, story)
      return
    }

    const current = storyMap.get(story.id)
    storyMap.set(story.id, {
      ...current,
      ...story,
      summary: current.summary || story.summary,
      imageUrl: current.imageUrl || story.imageUrl,
    })
  })

  const stories = [...storyMap.values()].filter(
    (story) => normalizeAuthorName(story.author) === normalizedAuthor,
  )

  return {
    title: remoteAuthorPage?.title ?? requestedAuthor,
    intro:
      remoteAuthorPage?.intro ??
      (requestedAuthor ? `${requestedAuthor} द्वारा लिखी गई सभी स्टोरीज़` : 'लेखक की सभी स्टोरीज़'),
    readMoreLabel: remoteAuthorPage?.readMoreLabel ?? 'Read More',
    categoryTitle: remoteAuthorPage?.categoryTitle ?? 'कैटेगरीज़',
    subscribeTitle: remoteAuthorPage?.subscribeTitle,
    sidebar: sharedSidebar,
    stories,
  }
}
