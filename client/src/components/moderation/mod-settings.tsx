import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ServerSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModSettings({ serverId }: { serverId: string }) {
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
        description: "Moderation settings have been saved successfully",
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
      <div className="mt-8 bg-discord-secondary rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48 bg-discord-darker" />
          <Skeleton className="h-9 w-32 bg-discord-darker" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-7 w-40 mb-4 bg-discord-darker" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1 bg-discord-darker" />
                    <Skeleton className="h-4 w-48 bg-discord-darker" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full bg-discord-darker" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-7 w-40 mb-4 bg-discord-darker" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-5 w-32 mb-1 bg-discord-darker" />
                <Skeleton className="h-10 w-full bg-discord-darker rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-discord-secondary rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Moderation Settings</h2>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
          className="bg-discord-primary hover:bg-opacity-90"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Auto-Moderation</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Anti-Spam Protection</p>
                <p className="text-discord-light text-sm">Automatically delete spam messages</p>
              </div>
              <Switch
                checked={!!settings.antiSpam}
                onCheckedChange={(checked) => handleChange("antiSpam", checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Link Filter</p>
                <p className="text-discord-light text-sm">Remove messages with unauthorized links</p>
              </div>
              <Switch
                checked={!!settings.linkFilter}
                onCheckedChange={(checked) => handleChange("linkFilter", checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Profanity Filter</p>
                <p className="text-discord-light text-sm">Censor inappropriate language</p>
              </div>
              <Switch
                checked={!!settings.profanityFilter}
                onCheckedChange={(checked) => handleChange("profanityFilter", checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Auto-Warn</p>
                <p className="text-discord-light text-sm">Warn users who break rules</p>
              </div>
              <Switch
                checked={!!settings.autoWarn}
                onCheckedChange={(checked) => handleChange("autoWarn", checked)}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Command Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="banCommandCooldown">Ban Command Cooldown</Label>
              <div className="flex">
                <Input
                  id="banCommandCooldown"
                  type="number"
                  value={settings.banCommandCooldown || 10}
                  onChange={(e) => handleChange("banCommandCooldown", parseInt(e.target.value))}
                  className="bg-discord-darker border-gray-700 rounded-l-md"
                  min={1}
                />
                <span className="inline-flex items-center px-3 bg-gray-700 border border-l-0 border-gray-700 rounded-r-md text-sm">
                  seconds
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modRoleId">Required Role for Moderation</Label>
              <Input
                id="modRoleId"
                placeholder="Role ID for moderation commands"
                value={settings.modRoleId || ""}
                onChange={(e) => handleChange("modRoleId", e.target.value)}
                className="bg-discord-darker border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="banMessageTemplate">Ban Message Template</Label>
              <Textarea
                id="banMessageTemplate"
                value={settings.banMessageTemplate || "You have been banned from {server} for {reason}. If you believe this is a mistake, please contact the server administrators."}
                onChange={(e) => handleChange("banMessageTemplate", e.target.value)}
                className="bg-discord-darker border-gray-700 h-24"
                placeholder="Message sent to banned users"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
