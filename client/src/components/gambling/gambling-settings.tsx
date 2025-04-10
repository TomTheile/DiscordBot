import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ServerSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function GamblingSettings({ serverId }: { serverId: string }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<ServerSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/servers", serverId, "settings"],
    enabled: !!serverId,
    onSuccess: (data) => {
      setSettings(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<ServerSettings>) => {
      const res = await apiRequest(
        "PATCH",
        `/api/servers/${serverId}/settings`,
        updatedSettings
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Gambling settings have been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId, "settings"] });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (key: keyof ServerSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <Card className="bg-discord-secondary border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 bg-discord-darker" />
            <Skeleton className="h-9 w-32 bg-discord-darker" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-32 mb-1 bg-discord-darker" />
                  <Skeleton className="h-4 w-48 bg-discord-darker" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full bg-discord-darker" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-discord-secondary border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Gambling Settings</CardTitle>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="bg-discord-primary hover:bg-opacity-90"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Enable Gambling</p>
              <p className="text-discord-light text-sm">Allow gambling commands on this server</p>
            </div>
            <Switch
              checked={!!settings.gamblingEnabled}
              onCheckedChange={(checked) => handleChange("gamblingEnabled", checked)}
            />
          </div>

          <div>
            <Label htmlFor="startingBalance" className="mb-1 block">Starting Balance</Label>
            <p className="text-discord-light text-sm mb-2">Amount of coins new users receive</p>
            <Input
              id="startingBalance"
              type="number"
              placeholder="1000"
              className="max-w-xs bg-discord-darker border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="dailyBonus" className="mb-1 block">Daily Bonus</Label>
            <p className="text-discord-light text-sm mb-2">Amount of coins users receive daily</p>
            <Input
              id="dailyBonus"
              type="number"
              placeholder="200"
              className="max-w-xs bg-discord-darker border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="maxBet" className="mb-1 block">Maximum Bet</Label>
            <p className="text-discord-light text-sm mb-2">Maximum amount users can bet per game</p>
            <Input
              id="maxBet"
              type="number"
              placeholder="10000"
              className="max-w-xs bg-discord-darker border-gray-700"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
