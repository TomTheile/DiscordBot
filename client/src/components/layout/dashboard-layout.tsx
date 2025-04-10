import { ReactNode, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import TopBar from "@/components/layout/topbar";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-discord-dark">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={toggleMobileSidebar} />

      {/* Mobile sidebar toggle */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <button 
          onClick={toggleMobileSidebar}
          className="bg-discord-primary text-white p-3 rounded-full shadow-lg"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-discord-dark">
        <TopBar title={title} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
