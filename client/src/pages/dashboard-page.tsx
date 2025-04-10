import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import CommandCategories from "@/components/dashboard/command-categories";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard Overview">
      <StatsCards />
      <CommandCategories />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
