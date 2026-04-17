import AdBanner from '../Component/AdBanner'
import FeatureBandSection from '../Component/FeatureBandSection'
import FooterSection from '../Component/FooterSection'
import HeroNews from '../Component/HeroNews'
import Navbar from '../Component/Navbar'
import NewsMeta from '../Component/NewsMeta'
import NewsColumnsSection from '../Component/NewsColumnsSection'
import NewsShowcase from '../Component/NewsShowcase'
import ShortsSection from '../Component/ShortsSection'
import TopicSection from '../Component/TopicSection'
import TopStoriesBar from '../Component/TopStoriesBar'
import TopStoriesGridSection from '../Component/TopStoriesGridSection'
import VideoSection from '../Component/VideoSection'
import WebStoriesSection from '../Component/WebStoriesSection'
import WhatsAppPromo from '../Component/WhatsAppPromo'
import { getResolvedTrendingTagItems } from '../data/tagPages'
import { getResolvedNavItems } from '../utils/navigation'
import './Home.css'

function Home({ content }) {
  return (
    <main className="news-page" lang="hi">
      <Navbar
        navItems={getResolvedNavItems(content.navbar.items)}
        brand={content.brand}
        labels={content.navbar}
        activeItem="होम"
      />
      <TopStoriesBar
        label={content.topStories.sectionLabel}
        ariaLabel={content.topStories.ariaLabel}
        stories={content.topStories.stories}
      />
      
      <NewsMeta
        ariaLabel={content.meta.ariaLabel}
        label={content.meta.label}
        items={getResolvedTrendingTagItems(content)}
      />
      
      <HeroNews
        ariaLabel={content.hero.ariaLabel}
        content={content.hero}
      />
      <AdBanner content={content.ads.heroTop} />
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
      <FeatureBandSection content={content.featureBandSection} />
      <WhatsAppPromo content={content.whatsAppPromo} />
      <NewsColumnsSection content={content.newsColumnsSection} />
      <WebStoriesSection content={content.webStoriesSection} />
      <TopStoriesGridSection
        title={content.topStories.sectionLabel}
        ariaLabel={content.topStories.ariaLabel}
        stories={content.topStories.stories}
      />
      <FooterSection content={content.footerSection} />
    </main>
  )
}

export default Home
