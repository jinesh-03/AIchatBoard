import WidgetsPage from "@/components/ChatWidget";
import Navigation from "@/components/Navigation";

export default function Widgets() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <WidgetsPage />
      </div>
    </main>
  );
}
