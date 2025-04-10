import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ModerationLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type ActivityIconProps = {
  type: string;
};

function ActivityIcon({ type }: ActivityIconProps) {
  let icon = "fas fa-cog";
  
  switch (type) {
    case "ban":
    case "kick":
    case "warn":
    case "mute":
    case "clear":
      icon = "fas fa-gavel";
      break;
    case "roulette":
    case "slots":
    case "coinflip":
      icon = "fas fa-dice";
      break;
    default:
      icon = "fas fa-cog";
  }
  
  return (
    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-discord-darker text-discord-light">
      <i className={icon}></i>
    </div>
  );
}

function getActivityText(log: ModerationLog): string {
  switch (log.type) {
    case "ban":
      return `banned @${log.targetName}`;
    case "kick":
      return `kicked @${log.targetName}`;
    case "warn":
      return `warned @${log.targetName}`;
    case "mute":
      return `muted @${log.targetName}`;
    case "clear":
      return `cleared messages in ${log.targetName}`;
    default:
      return `performed ${log.type} on ${log.targetName}`;
  }
}

export default function RecentActivity() {
  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
  });
  
  const serverId = servers?.[0]?.id;
  
  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/servers", serverId, "moderation-logs"],
    enabled: !!serverId,
  });

  if (isLoading || !logs) {
    return (
      <div className="bg-discord-secondary rounded-lg shadow-sm p-6 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48 bg-discord-darker" />
          <Skeleton className="h-5 w-20 bg-discord-darker" />
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start pb-4 border-b border-gray-700">
              <Skeleton className="h-10 w-10 rounded-full bg-discord-darker" />
              <div className="ml-3 w-full">
                <Skeleton className="h-5 w-3/4 mb-1 bg-discord-darker" />
                <Skeleton className="h-4 w-1/2 mb-1 bg-discord-darker" />
                <Skeleton className="h-4 w-1/4 bg-discord-darker" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-discord-secondary rounded-lg shadow-sm p-6 md:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <button className="text-discord-light hover:text-white text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-discord-light text-center py-6">No recent activity to display</p>
        ) : (
          logs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start pb-4 border-b border-gray-700">
              <ActivityIcon type={log.type} />
              <div className="ml-3">
                <p className="text-sm font-medium">
                  <span className="text-discord-primary">@{log.moderatorName}</span> {getActivityText(log)}
                </p>
                {log.reason && (
                  <p className="text-xs text-discord-light mt-1">Reason: {log.reason}</p>
                )}
                <p className="text-xs text-discord-light mt-1">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
