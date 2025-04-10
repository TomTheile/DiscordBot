import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

type Command = {
  name: string;
  description: string;
  category: string;
};

type CommandsTableProps = {
  category?: string;
};

export default function CommandsTable({ category }: CommandsTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: botStatus, isLoading } = useQuery({
    queryKey: ["/api/bot/status"],
  });

  // Get all commands and filter by category if provided
  const commands: Command[] = 
    botStatus?.commandsByCategory
      ?.filter(cat => !category || cat.category.toLowerCase() === category.toLowerCase())
      ?.flatMap(cat => cat.commands.map(name => ({
        name,
        category: cat.category,
        description: `${cat.category} command`
      }))) || [];

  // Add pagination
  const filteredCommands = commands.filter(
    (command) =>
      command.name.toLowerCase().includes(search.toLowerCase()) ||
      command.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCommands.length / itemsPerPage);
  const paginatedCommands = filteredCommands.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full bg-discord-darker" />
        <Skeleton className="h-96 w-full bg-discord-darker" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Search commands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-discord-darker border-gray-700 text-white"
        />
      </div>

      <div className="rounded-md border border-gray-700">
        <Table>
          <TableHeader className="bg-discord-darker">
            <TableRow className="border-gray-700">
              <TableHead className="text-discord-light">Command</TableHead>
              <TableHead className="text-discord-light">Description</TableHead>
              {!category && (
                <TableHead className="text-discord-light">Category</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCommands.length > 0 ? (
              paginatedCommands.map((command, index) => (
                <TableRow key={index} className="border-gray-700">
                  <TableCell className="font-medium">!{command.name}</TableCell>
                  <TableCell>{command.description}</TableCell>
                  {!category && (
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-discord-primary bg-opacity-20 text-discord-primary">
                        {command.category}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={category ? 2 : 3} className="text-center py-10">
                  No commands found
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
