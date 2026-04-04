import AdBanner from '../Component/AdBanner'
import HeroNews from '../Component/HeroNews'
import Navbar from '../Component/Navbar'
import NewsMeta from '../Component/NewsMeta'
import NewsShowcase from '../Component/NewsShowcase'
import ShortsSection from '../Component/ShortsSection'
import TopicSection from '../Component/TopicSection'
import TopStoriesBar from '../Component/TopStoriesBar'
import VideoSection from '../Component/VideoSection'
import WhatsAppPromo from '../Component/WhatsAppPromo'
import './Home.css'

function Home({ content }) {
  return (
    <main className="news-page" lang="hi">
      <Navbar
        navItems={content.navbar.items}
        brand={content.brand}
        labels={content.navbar}
      />
      <TopStoriesBar
        label={content.topStories.sectionLabel}
        ariaLabel={content.topStories.ariaLabel}
        stories={content.topStories.stories}
      />
      <NewsMeta
        ariaLabel={content.meta.ariaLabel}
        items={content.meta.items}
      />
      <AdBanner content={content.ads.heroTop} />
      <HeroNews
        ariaLabel={content.hero.ariaLabel}
        content={content.hero}
      />
      <NewsShowcase
        ariaLabel={content.showcase.ariaLabel}
        content={content.showcase}
      />
      <WhatsAppPromo content={content.whatsAppPromo} />
      <TopicSection
        ariaLabel={content.topicSection.ariaLabel}
        content={content.topicSection}
      />
      <AdBanner content={content.ads.afterTopics} />
      <VideoSection
        ariaLabel={content.videoSection.ariaLabel}
        content={content.videoSection}
      />
      <ShortsSection content={content.shortsSection} />
    </main>
  )
}

export default Home
