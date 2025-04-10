import DashboardLayout from "@/components/layout/dashboard-layout";
import CommandsTable from "@/components/tables/commands-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BotStatusResponse } from "@/lib/discord-types";

export default function CommandsPage() {
  const { data: botStatus } = useQuery<BotStatusResponse>({
    queryKey: ["/api/bot/status"],
  });

  return (
    <DashboardLayout title="Commands">
      <div className="mb-6">
        <Card className="bg-discord-secondary border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Bot Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-discord-light mb-4">
              Your Discord bot has {botStatus?.commandCount || 0} commands across multiple categories.
              Use the table below to explore all available commands.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {botStatus?.commandsByCategory.map((category, index) => (
                <div key={index} className="bg-discord-dark rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-lg capitalize mb-2">{category.category}</h3>
                  <p className="text-discord-light mb-2">{category.count} commands</p>
                  <div className="flex flex-wrap gap-2">
                    {category.commands.slice(0, 3).map((cmd, i) => (
                      <span key={i} className="bg-discord-darker px-2 py-1 rounded-md text-xs">
                        !{cmd}
                      </span>
                    ))}
                    {category.count > 3 && (
                      <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">
                        +{category.count - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-discord-secondary border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <CommandsTable />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
