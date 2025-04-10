import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type NavItemProps = {
  href: string;
  icon: string;
  children: React.ReactNode;
  isActive?: boolean;
};

function NavItem({ href, icon, children, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={`flex items-center px-4 py-2.5 ${
          isActive
            ? "text-white bg-discord-dark rounded-md mx-2 mb-1"
            : "text-discord-light hover:text-white hover:bg-discord-dark rounded-md mx-2 mb-1"
        }`}
      >
        <i className={`${icon} w-5`}></i>
        <span className="ml-3">{children}</span>
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const { data: botStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["/api/bot/status"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="bg-discord-darker w-64 flex-shrink-0 hidden md:flex flex-col h-screen overflow-y-auto scrollbar-thin">
      <div className="py-6 px-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-discord-primary flex items-center justify-center text-white font-bold">
            DB
          </div>
          <h1 className="ml-3 text-xl font-semibold">DiscordBot</h1>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          {isStatusLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-discord-light" />
          ) : (
            <span
              className={`w-3 h-3 ${
                botStatus?.status === "online"
                  ? "bg-discord-success"
                  : "bg-discord-danger"
              } rounded-full`}
            ></span>
          )}
          <span className="text-sm text-discord-light">
            {botStatus?.status === "online" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <nav className="pt-4 flex-1">
        <div className="px-4 pb-2">
          <h2 className="text-discord-light uppercase tracking-wider text-xs font-semibold">
            Dashboard
          </h2>
        </div>
        <NavItem
          href="/"
          icon="fas fa-tachometer-alt"
          isActive={location === "/"}
        >
          Overview
        </NavItem>
        <NavItem
          href="/commands"
          icon="fas fa-terminal"
          isActive={location === "/commands"}
        >
          Commands
        </NavItem>
        <NavItem
          href="/moderation"
          icon="fas fa-gavel"
          isActive={location === "/moderation"}
        >
          Moderation
        </NavItem>
        <NavItem
          href="/gambling"
          icon="fas fa-dice"
          isActive={location === "/gambling"}
        >
          Gambling
        </NavItem>
        <NavItem
          href="/utility"
          icon="fas fa-tools"
          isActive={location === "/utility"}
        >
          Utility
        </NavItem>

        <div className="px-4 py-2 mt-4">
          <h2 className="text-discord-light uppercase tracking-wider text-xs font-semibold">
            Configuration
          </h2>
        </div>
        <NavItem
          href="/settings"
          icon="fas fa-cog"
          isActive={location === "/settings"}
        >
          Settings
        </NavItem>
        <NavItem
          href="/logs"
          icon="fas fa-list"
          isActive={location === "/logs"}
        >
          Logs
        </NavItem>
      </nav>

      <div className="mt-auto pt-4 px-4 pb-6 border-t border-gray-800">
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-discord-light">
              {user?.isAdmin ? "Administrator" : "User"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-discord-light hover:text-white text-sm"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>
    </aside>
  );
}
