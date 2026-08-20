import { Header } from "@/components/layout/header";
import { SearchContent } from "@/components/search/search-content";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <>
      <Header title="Search" description="Find information by what it means, not by where it came from." />
      <SearchContent />
    </>
  );
}
