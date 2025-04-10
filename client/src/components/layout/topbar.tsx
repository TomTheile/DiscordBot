import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DiscordServer } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type TopBarProps = {
  title: string;
};

export default function TopBar({ title }: TopBarProps) {
  const [selectedServer, setSelectedServer] = useState<DiscordServer | null>(null);

  const { data: servers } = useQuery<DiscordServer[]>({
    queryKey: ["/api/servers"],
  });

  const handleServerSelect = (server: DiscordServer) => {
    setSelectedServer(server);
  };

  return (
    <div className="bg-discord-secondary border-b border-gray-800 py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-discord-darker text-discord-light py-1.5 px-3 border-gray-700">
              <span>
                {selectedServer
                  ? selectedServer.name
                  : "Select Server"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-discord-darker border-gray-700 text-white">
            {servers && servers.length > 0 ? (
              servers.map((server) => (
                <DropdownMenuItem
                  key={server.id}
                  onClick={() => handleServerSelect(server)}
                  className="cursor-pointer hover:bg-discord-dark"
                >
                  {server.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No servers available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="bg-discord-primary hover:bg-opacity-90 px-3 py-1.5 rounded-md text-sm font-medium">
          <span className="hidden sm:inline">Add to Server</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}
