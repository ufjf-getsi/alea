import PageContainer from "@/components/layout/pageContainer/pageContainer";
import HeroSection from "@/components/sections/heroSection/heroSection";
import ContentSection from "@/components/sections/contentSection/contentSection";

export default function Home() {
  return (
    <PageContainer>
      <HeroSection />
      <ContentSection />
    </PageContainer>
  );
}
