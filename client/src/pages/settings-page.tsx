import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DiscordServer } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeServer, setActiveServer] = useState<string | null>(null);

  const { data: servers, isLoading: serversLoading } = useQuery<DiscordServer[]>({
    queryKey: ["/api/servers"],
  });

  const { data: serverData, isLoading: serverDataLoading } = useQuery<DiscordServer>({
    queryKey: ["/api/servers", activeServer],
    enabled: !!activeServer,
  });

  const [formData, setFormData] = useState<Partial<DiscordServer>>({
    prefix: "!",
  });

  // Set form data when server data loads
  if (serverData && !formData.id) {
    setFormData(serverData);
  }

  const updateServerMutation = useMutation({
    mutationFn: async (data: Partial<DiscordServer>) => {
      const res = await apiRequest(
        "PATCH",
        `/api/servers/${activeServer}`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Server updated",
        description: "Server settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servers", activeServer] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleServerChange = (serverId: string) => {
    setActiveServer(serverId);
    // Reset form when changing servers
    setFormData({
      prefix: "!",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (activeServer) {
      updateServerMutation.mutate(formData);
    }
  };

  const isLoading = serversLoading || (activeServer && serverDataLoading);

  return (
    <DashboardLayout title="Settings">
      <div className="mb-6">
        <Card className="bg-discord-secondary border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Bot Settings</CardTitle>
            <CardDescription className="text-discord-light">
              Configure your Discord bot settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="server-select" className="block mb-2">Select Server</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full max-w-md bg-discord-darker" />
                ) : (
                  <Select value={activeServer || ""} onValueChange={handleServerChange}>
                    <SelectTrigger className="w-full max-w-md bg-discord-darker border-gray-700 text-white">
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
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeServer ? (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-discord-darker mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="commands" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
              Commands
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
              Advanced
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="bg-discord-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {serverDataLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64 bg-discord-darker" />
                    <Skeleton className="h-10 w-full max-w-md bg-discord-darker" />
                    <Skeleton className="h-8 w-64 bg-discord-darker" />
                    <Skeleton className="h-10 w-full max-w-md bg-discord-darker" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prefix" className="block mb-2">Command Prefix</Label>
                      <Input
                        id="prefix"
                        name="prefix"
                        value={formData.prefix || "!"}
                        onChange={handleInputChange}
                        placeholder="!"
                        className="max-w-md bg-discord-darker border-gray-700 text-white"
                      />
                      <p className="text-discord-light text-sm mt-1">
                        This is the character that users will type before commands.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="welcomeMessage" className="block mb-2">Welcome Message</Label>
                      <Input
                        id="welcomeMessage"
                        name="welcomeMessage"
                        value={formData.welcomeMessage || ""}
                        onChange={handleInputChange}
                        placeholder="Welcome to the server, {user}!"
                        className="max-w-md bg-discord-darker border-gray-700 text-white"
                      />
                      <p className="text-discord-light text-sm mt-1">
                        Message sent when a new user joins. Use {"{user}"} to mention the user.
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={updateServerMutation.isPending}
                        className="bg-discord-primary hover:bg-opacity-90"
                      >
                        {updateServerMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="commands">
            <Card className="bg-discord-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Command Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-discord-light mb-4">
                  Configure which commands are enabled and command-specific settings.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-discord-dark p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2">Moderation Commands</h3>
                    <p className="text-discord-light text-sm mb-2">
                      Ban, kick, mute, and other moderation commands
                    </p>
                    <Button variant="outline" className="text-discord-light border-gray-700 hover:text-white hover:bg-discord-darker">
                      Configure
                    </Button>
                  </div>
                  <div className="bg-discord-dark p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2">Gambling Commands</h3>
                    <p className="text-discord-light text-sm mb-2">
                      Slots, roulette, coinflip, and other gambling games
                    </p>
                    <Button variant="outline" className="text-discord-light border-gray-700 hover:text-white hover:bg-discord-darker">
                      Configure
                    </Button>
                  </div>
                  <div className="bg-discord-dark p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2">Utility Commands</h3>
                    <p className="text-discord-light text-sm mb-2">
                      Help, info, poll, and other utility commands
                    </p>
                    <Button variant="outline" className="text-discord-light border-gray-700 hover:text-white hover:bg-discord-darker">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card className="bg-discord-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminRoleId" className="block mb-2">Admin Role ID</Label>
                    <Input
                      id="adminRoleId"
                      name="adminRoleId"
                      placeholder="Role ID for admin commands"
                      className="max-w-md bg-discord-darker border-gray-700 text-white"
                    />
                    <p className="text-discord-light text-sm mt-1">
                      Role that will have access to all bot commands.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="logChannelId" className="block mb-2">Log Channel ID</Label>
                    <Input
                      id="logChannelId"
                      name="logChannelId"
                      placeholder="Channel ID for bot logs"
                      className="max-w-md bg-discord-darker border-gray-700 text-white"
                    />
                    <p className="text-discord-light text-sm mt-1">
                      Channel where bot activity logs will be sent.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      className="bg-discord-primary hover:bg-opacity-90"
                    >
                      Save Advanced Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-discord-secondary border-gray-700">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-discord-darker flex items-center justify-center text-discord-light mb-4">
                <i className="fas fa-server fa-lg"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Select a Server</h3>
              <p className="text-discord-light max-w-md mx-auto">
                Please select a server from the dropdown above to configure its settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
