import { informationMetadata, renderInformationRoute, type InformationRouteProps } from "../../info-route";

export function generateMetadata(props: InformationRouteProps) {
  return informationMetadata(props, "privacy");
}

export default function PrivacyPage(props: InformationRouteProps) {
  return renderInformationRoute(props, "privacy");
}

