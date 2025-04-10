import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModerationLog } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LogsTableProps = {
  serverId?: string;
  limit?: number;
};

export default function LogsTable({ serverId, limit = 50 }: LogsTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
  });

  const effectiveServerId = serverId || servers?.[0]?.id;

  const { data: logs, isLoading } = useQuery<ModerationLog[]>({
    queryKey: ["/api/servers", effectiveServerId, "moderation-logs"],
    enabled: !!effectiveServerId,
  });

  if (isLoading || !logs) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Skeleton className="h-10 w-full sm:w-64 bg-discord-darker" />
          <Skeleton className="h-10 w-full sm:w-32 bg-discord-darker" />
        </div>
        <Skeleton className="h-96 w-full bg-discord-darker" />
      </div>
    );
  }

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    const searchMatch =
      search === "" ||
      log.targetName.toLowerCase().includes(search.toLowerCase()) ||
      log.moderatorName.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

    const typeMatch = typeFilter === "all" || log.type === typeFilter;

    return searchMatch && typeMatch;
  });

  // Get unique log types for filter
  const logTypes = Array.from(new Set(logs.map((log) => log.type)));

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-discord-darker border-gray-700 text-white"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-discord-darker border-gray-700 text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-discord-darker border-gray-700 text-white">
            <SelectItem value="all">All Types</SelectItem>
            {logTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-gray-700">
        <Table>
          <TableHeader className="bg-discord-darker">
            <TableRow className="border-gray-700">
              <TableHead className="text-discord-light">Type</TableHead>
              <TableHead className="text-discord-light">Moderator</TableHead>
              <TableHead className="text-discord-light">Target</TableHead>
              <TableHead className="text-discord-light">Reason</TableHead>
              <TableHead className="text-discord-light">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} className="border-gray-700">
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </TableCell>
                  <TableCell>{log.moderatorName}</TableCell>
                  <TableCell>{log.targetName}</TableCell>
                  <TableCell>{log.reason || "No reason provided"}</TableCell>
                  <TableCell title={format(new Date(log.timestamp), "PPpp")}>
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === pageNum}
                    onClick={() => setPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {totalPages > 5 && (
              <PaginationItem>
                <PaginationLink disabled>...</PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function getTypeColor(type: string): string {
  switch (type) {
    case "ban":
      return "bg-discord-danger bg-opacity-20 text-discord-danger";
    case "kick":
      return "bg-discord-warning bg-opacity-20 text-discord-warning";
    case "mute":
      return "bg-yellow-500 bg-opacity-20 text-yellow-500";
    case "warn":
      return "bg-blue-500 bg-opacity-20 text-blue-500";
    case "clear":
      return "bg-purple-500 bg-opacity-20 text-purple-500";
    default:
      return "bg-discord-primary bg-opacity-20 text-discord-primary";
  }
}
