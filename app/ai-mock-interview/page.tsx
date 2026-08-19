import { SeoLandingPage } from "../SeoLandingPage";
import { metadataFor } from "../seo-content";

export const metadata = metadataFor("ai-mock-interview");

export default function Page() {
  return <SeoLandingPage pageKey="ai-mock-interview" />;
}
