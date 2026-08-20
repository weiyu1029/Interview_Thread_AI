import { informationMetadata, renderInformationRoute, type InformationRouteProps } from "../../info-route";

export function generateMetadata(props: InformationRouteProps) {
  return informationMetadata(props, "terms");
}

export default function TermsPage(props: InformationRouteProps) {
  return renderInformationRoute(props, "terms");
}

