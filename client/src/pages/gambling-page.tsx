import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommandsTable from "@/components/tables/commands-table";
import GamblingSettings from "@/components/gambling/gambling-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

export default function GamblingPage() {
  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
  });

  const serverId = servers?.[0]?.id;

  return (
    <DashboardLayout title="Gambling">
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
              <CardTitle className="text-white">Gambling Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-discord-light mb-4">
                Gambling commands provide fun games with virtual currency for your users.
                These games include slots, roulette, coinflip, and more!
              </p>
              <CommandsTable category="gambling" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          {serverId ? (
            <GamblingSettings serverId={serverId} />
          ) : (
            <Card className="bg-discord-secondary border-gray-700">
              <CardContent className="pt-6">
                <p className="text-center text-discord-light">
                  Please select a server to configure gambling settings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
