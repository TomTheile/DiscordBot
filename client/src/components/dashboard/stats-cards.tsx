import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: botStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["/api/bot/status"],
  });

  const { data: servers, isLoading: isServersLoading } = useQuery({
    queryKey: ["/api/servers"],
  });

  if (isStatusLoading || isServersLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-discord-secondary rounded-lg shadow-sm p-5">
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-2 bg-discord-darker" />
                <Skeleton className="h-8 w-16 bg-discord-darker" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg bg-discord-darker" />
            </div>
            <Skeleton className="h-4 w-24 mt-3 bg-discord-darker" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate total users from all servers
  const totalUsers = servers?.reduce((acc, server) => acc + (server.memberCount || 0), 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-discord-secondary rounded-lg shadow-sm p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-discord-light text-sm font-medium">Servers</p>
            <h3 className="text-2xl font-semibold mt-1">{servers?.length || 0}</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-100 bg-opacity-10 rounded-lg flex items-center justify-center text-discord-primary">
            <i className="fas fa-server fa-lg"></i>
          </div>
        </div>
        {servers && servers.length > 0 && (
          <p className="text-xs text-discord-success mt-3 flex items-center">
            <i className="fas fa-check-circle mr-1"></i> All servers connected
          </p>
        )}
      </div>

      <div className="bg-discord-secondary rounded-lg shadow-sm p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-discord-light text-sm font-medium">Users Reached</p>
            <h3 className="text-2xl font-semibold mt-1">
              {totalUsers > 1000
                ? `${(totalUsers / 1000).toFixed(1)}K`
                : totalUsers}
            </h3>
          </div>
          <div className="h-12 w-12 bg-green-100 bg-opacity-10 rounded-lg flex items-center justify-center text-discord-success">
            <i className="fas fa-users fa-lg"></i>
          </div>
        </div>
        <p className="text-xs text-discord-success mt-3 flex items-center">
          <i className="fas fa-arrow-up mr-1"></i> Active across all servers
        </p>
      </div>

      <div className="bg-discord-secondary rounded-lg shadow-sm p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-discord-light text-sm font-medium">Commands</p>
            <h3 className="text-2xl font-semibold mt-1">{botStatus?.commandCount || 0}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-100 bg-opacity-10 rounded-lg flex items-center justify-center text-blue-400">
            <i className="fas fa-terminal fa-lg"></i>
          </div>
        </div>
        <p className="text-xs text-discord-success mt-3 flex items-center">
          <i className="fas fa-check-circle mr-1"></i> All commands available
        </p>
      </div>

      <div className="bg-discord-secondary rounded-lg shadow-sm p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-discord-light text-sm font-medium">Status</p>
            <h3 className="text-2xl font-semibold mt-1">
              {botStatus?.status === "online" ? "Online" : "Offline"}
            </h3>
          </div>
          <div className="h-12 w-12 bg-purple-100 bg-opacity-10 rounded-lg flex items-center justify-center text-purple-400">
            <i className="fas fa-clock fa-lg"></i>
          </div>
        </div>
        {botStatus?.status === "online" ? (
          <p className="text-xs text-discord-success mt-3 flex items-center">
            <i className="fas fa-check-circle mr-1"></i> Bot is running properly
          </p>
        ) : (
          <p className="text-xs text-discord-danger mt-3 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i> Bot is offline
          </p>
        )}
      </div>
    </div>
  );
}
