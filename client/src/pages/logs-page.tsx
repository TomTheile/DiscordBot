import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LogsTable from "@/components/tables/logs-table";
import { useQuery } from "@tanstack/react-query";
import { DiscordServer } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function LogsPage() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const { data: servers, isLoading } = useQuery<DiscordServer[]>({
    queryKey: ["/api/servers"],
    onSuccess: (data) => {
      if (data.length > 0 && !selectedServerId) {
        setSelectedServerId(data[0].id);
      }
    },
  });

  const handleServerChange = (serverId: string) => {
    setSelectedServerId(serverId);
  };

  return (
    <DashboardLayout title="Logs">
      <div className="mb-6">
        <Card className="bg-discord-secondary border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Moderation Logs</CardTitle>
            <CardDescription className="text-discord-light">
              View all moderation actions performed by bot users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="server-select" className="block mb-2">
                Select Server
              </Label>
              <Select
                value={selectedServerId || ""}
                onValueChange={handleServerChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="server-select"
                  className="w-full max-w-md bg-discord-darker border-gray-700 text-white"
                >
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent className="bg-discord-darker border-gray-700 text-white">
                  {servers && servers.length > 0 ? (
                    servers.map((server) => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No servers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-discord-secondary border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Log History</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedServerId ? (
            <LogsTable serverId={selectedServerId} limit={100} />
          ) : (
            <div className="text-center py-10 text-discord-light">
              Please select a server to view logs
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
