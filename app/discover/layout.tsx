import DiscoverTabs from "../components/discover-tabs";

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DiscoverTabs>{children}</DiscoverTabs>;
}
