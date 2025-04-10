import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");
  const [channelName, setChannelName] = useState("");
  const [messageCount, setMessageCount] = useState("10");
  const [announcement, setAnnouncement] = useState("");

  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
  });

  const handleAction = (action: string) => {
    // In a real implementation, these would be API calls
    toast({
      title: "Action triggered",
      description: `${action} action would be executed on the Discord server`,
    });
    setOpenDialog(null);
    
    // Reset form values
    setUsername("");
    setReason("");
    setChannelName("");
    setMessageCount("10");
    setAnnouncement("");
  };

  return (
    <>
      <div className="bg-discord-secondary rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => setOpenDialog("ban")}
            className="w-full bg-discord-dark hover:bg-opacity-80 text-left px-4 py-3 rounded-md flex items-center transition-colors duration-150"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-discord-primary bg-opacity-20 text-discord-primary">
              <i className="fas fa-ban"></i>
            </div>
            <span className="ml-3 text-sm font-medium">Ban User</span>
          </button>
          
          <button
            onClick={() => setOpenDialog("mute")}
            className="w-full bg-discord-dark hover:bg-opacity-80 text-left px-4 py-3 rounded-md flex items-center transition-colors duration-150"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-discord-primary bg-opacity-20 text-discord-primary">
              <i className="fas fa-volume-mute"></i>
            </div>
            <span className="ml-3 text-sm font-medium">Mute User</span>
          </button>
          
          <button
            onClick={() => setOpenDialog("announcement")}
            className="w-full bg-discord-dark hover:bg-opacity-80 text-left px-4 py-3 rounded-md flex items-center transition-colors duration-150"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-discord-primary bg-opacity-20 text-discord-primary">
              <i className="fas fa-bullhorn"></i>
            </div>
            <span className="ml-3 text-sm font-medium">Send Announcement</span>
          </button>
          
          <button
            onClick={() => setOpenDialog("clear")}
            className="w-full bg-discord-dark hover:bg-opacity-80 text-left px-4 py-3 rounded-md flex items-center transition-colors duration-150"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-discord-primary bg-opacity-20 text-discord-primary">
              <i className="fas fa-trash"></i>
            </div>
            <span className="ml-3 text-sm font-medium">Clear Messages</span>
          </button>
          
          <button
            onClick={() => setOpenDialog("settings")}
            className="w-full bg-discord-dark hover:bg-opacity-80 text-left px-4 py-3 rounded-md flex items-center transition-colors duration-150"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-discord-primary bg-opacity-20 text-discord-primary">
              <i className="fas fa-cog"></i>
            </div>
            <span className="ml-3 text-sm font-medium">Bot Settings</span>
          </button>
        </div>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={openDialog === "ban"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-discord-secondary text-white">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or ID</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Enter username or ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Reason for ban"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="server">Server</Label>
              <select
                id="server"
                className="w-full p-2 bg-discord-darker border border-gray-700 rounded-md text-white focus:ring-discord-primary focus:border-discord-primary"
              >
                {servers?.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(null)}
              className="border-gray-700 text-white hover:bg-discord-dark hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("Ban")}
              className="bg-discord-danger hover:bg-opacity-90"
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mute User Dialog */}
      <Dialog open={openDialog === "mute"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-discord-secondary text-white">
          <DialogHeader>
            <DialogTitle>Mute User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="muteUsername">Username or ID</Label>
              <Input
                id="muteUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Enter username or ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                className="bg-discord-darker border-gray-700"
                placeholder="Duration in minutes"
                min="1"
                defaultValue="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muteReason">Reason</Label>
              <Textarea
                id="muteReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Reason for mute"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(null)}
              className="border-gray-700 text-white hover:bg-discord-dark hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("Mute")}
              className="bg-discord-primary hover:bg-opacity-90"
            >
              Mute User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Announcement Dialog */}
      <Dialog open={openDialog === "announcement"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-discord-secondary text-white">
          <DialogHeader>
            <DialogTitle>Send Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Channel name or ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement">Announcement</Label>
              <Textarea
                id="announcement"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Your announcement message"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(null)}
              className="border-gray-700 text-white hover:bg-discord-dark hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("Announcement")}
              className="bg-discord-primary hover:bg-opacity-90"
            >
              Send Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Messages Dialog */}
      <Dialog open={openDialog === "clear"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-discord-secondary text-white">
          <DialogHeader>
            <DialogTitle>Clear Messages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clearChannel">Channel</Label>
              <Input
                id="clearChannel"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Channel name or ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageCount">Number of Messages</Label>
              <Input
                id="messageCount"
                type="number"
                value={messageCount}
                onChange={(e) => setMessageCount(e.target.value)}
                className="bg-discord-darker border-gray-700"
                placeholder="Number of messages to delete"
                min="1"
                max="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(null)}
              className="border-gray-700 text-white hover:bg-discord-dark hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("Clear")}
              className="bg-discord-warning hover:bg-opacity-90"
            >
              Clear Messages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bot Settings Dialog - Simple redirect */}
      <Dialog open={openDialog === "settings"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-discord-secondary text-white">
          <DialogHeader>
            <DialogTitle>Bot Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-discord-light">
              Bot settings can be configured in the Settings page for more advanced options.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(null)}
              className="border-gray-700 text-white hover:bg-discord-dark hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => window.location.href = "/settings"}
              className="bg-discord-primary hover:bg-opacity-90"
            >
              Go to Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
