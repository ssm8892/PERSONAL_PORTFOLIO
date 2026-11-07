import { BrainHero } from "@/components/brain/BrainHero";
import { site } from "@/content/site";

export default function Home() {
  return <BrainHero name={site.name} tagline={site.tagline} />;
}
