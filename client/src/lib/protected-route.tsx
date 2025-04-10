import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route path={path}>
      {() => {
        // Use direct query instead of auth context
        const { data: user, isLoading } = useQuery({
          queryKey: ["/api/user"],
          retry: false,
          refetchOnWindowFocus: false,
        });

        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-discord-dark">
              <Loader2 className="h-8 w-8 animate-spin text-discord-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        return <Component />;
      }}
    </Route>
  );
}
