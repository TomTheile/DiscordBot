import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function CommandCategories() {
  const { data: botStatus, isLoading } = useQuery({
    queryKey: ["/api/bot/status"],
  });

  if (isLoading) {
    return (
      <div className="bg-discord-secondary rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48 bg-discord-darker" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className="bg-discord-darker rounded-lg h-52 w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  const categories = botStatus?.commandsByCategory || [];
  
  return (
    <div className="bg-discord-secondary rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Command Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, idx) => (
          <Link key={idx} href={`/${category.category.toLowerCase()}`}>
            <a className="bg-discord-dark rounded-lg p-5 border border-gray-700 hover:border-discord-primary transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg capitalize">{category.category}</h3>
                <span className="bg-discord-primary bg-opacity-20 text-discord-primary px-2 py-1 rounded text-xs font-medium">
                  {category.count} Commands
                </span>
              </div>
              <p className="text-discord-light text-sm mb-4">
                {getCategoryDescription(category.category)}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.commands.map((cmd, i) => (
                  <span key={i} className="bg-discord-darker px-2 py-1 rounded-md text-xs">
                    !{cmd}
                  </span>
                ))}
                {category.count > 5 && (
                  <span className="bg-discord-darker px-2 py-1 rounded-md text-xs">
                    +{category.count - 5} more
                  </span>
                )}
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getCategoryDescription(category: string): string {
  switch (category.toLowerCase()) {
    case "moderation":
      return "Manage your server with powerful moderation tools.";
    case "gambling":
      return "Fun gambling games with virtual currency.";
    case "utility":
      return "Helpful tools and utilities for your server.";
    default:
      return `Various ${category.toLowerCase()} commands for your server.`;
  }
}
