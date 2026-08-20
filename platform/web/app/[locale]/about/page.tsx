import { informationMetadata, renderInformationRoute, type InformationRouteProps } from "../../info-route";

export function generateMetadata(props: InformationRouteProps) {
  return informationMetadata(props, "about");
}

export default function AboutPage(props: InformationRouteProps) {
  return renderInformationRoute(props, "about");
}

