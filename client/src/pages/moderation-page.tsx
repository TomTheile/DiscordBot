import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommandsTable from "@/components/tables/commands-table";
import ModSettings from "@/components/moderation/mod-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

export default function ModerationPage() {
  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
  });

  const serverId = servers?.[0]?.id;

  return (
    <DashboardLayout title="Moderation">
      <Tabs defaultValue="commands" className="w-full">
        <TabsList className="bg-discord-darker mb-6">
          <TabsTrigger value="commands" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
            Commands
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="commands">
          <Card className="bg-discord-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Moderation Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-discord-light mb-4">
                Moderation commands help you keep your server clean and organized. 
                These commands allow you to ban, kick, mute, and warn users, as well as manage messages.
              </p>
              <CommandsTable category="moderation" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          {serverId ? (
            <ModSettings serverId={serverId} />
          ) : (
            <Card className="bg-discord-secondary border-gray-700">
              <CardContent className="pt-6">
                <p className="text-center text-discord-light">
                  Please select a server to configure moderation settings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
