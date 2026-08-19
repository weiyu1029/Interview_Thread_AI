import { SeoLandingPage } from "../SeoLandingPage";
import { metadataFor } from "../seo-content";

export const metadata = metadataFor("job-match-recommendations");

export default function Page() {
  return <SeoLandingPage pageKey="job-match-recommendations" />;
}
