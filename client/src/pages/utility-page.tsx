import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommandsTable from "@/components/tables/commands-table";

export default function UtilityPage() {
  return (
    <DashboardLayout title="Utility">
      <Card className="bg-discord-secondary border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Utility Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-discord-light mb-4">
            Utility commands provide helpful tools and features for your server.
            These include commands for server information, user lookups, polls, and more.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-discord-secondary border-gray-700">
          <CardHeader>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 bg-opacity-10 flex items-center justify-center text-blue-400 mr-2">
                <i className="fas fa-info-circle"></i>
              </div>
              <CardTitle className="text-white text-lg">Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-discord-light text-sm mb-3">Commands to get information about users, servers, and the bot.</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!serverinfo</span>
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!userinfo</span>
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!help</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-discord-secondary border-gray-700">
          <CardHeader>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 bg-opacity-10 flex items-center justify-center text-green-400 mr-2">
                <i className="fas fa-poll"></i>
              </div>
              <CardTitle className="text-white text-lg">Polls & Voting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-discord-light text-sm mb-3">Create polls and voting systems for your community.</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!poll</span>
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!vote</span>
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!survey</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-discord-secondary border-gray-700">
          <CardHeader>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 bg-opacity-10 flex items-center justify-center text-purple-400 mr-2">
                <i className="fas fa-tools"></i>
              </div>
              <CardTitle className="text-white text-lg">Miscellaneous</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-discord-light text-sm mb-3">Various utility commands for different purposes.</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!ping</span>
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!remind</span>
              <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">!weather</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-discord-secondary border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Utility Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <CommandsTable category="utility" />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
