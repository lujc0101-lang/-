import { ClubsHubNav } from "@/components/ClubsHubNav";

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 md:space-y-8">
      <ClubsHubNav />
      {children}
    </div>
  );
}
