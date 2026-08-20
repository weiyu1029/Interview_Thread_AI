import { informationMetadata, renderInformationRoute, type InformationRouteProps } from "../../info-route";

export function generateMetadata(props: InformationRouteProps) {
  return informationMetadata(props, "contact");
}

export default function ContactPage(props: InformationRouteProps) {
  return renderInformationRoute(props, "contact");
}

