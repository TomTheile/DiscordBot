import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CommandsPage from "@/pages/commands-page";
import ModerationPage from "@/pages/moderation-page";
import GamblingPage from "@/pages/gambling-page";
import UtilityPage from "@/pages/utility-page";
import SettingsPage from "@/pages/settings-page";
import LogsPage from "@/pages/logs-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/commands" component={CommandsPage} />
      <ProtectedRoute path="/moderation" component={ModerationPage} />
      <ProtectedRoute path="/gambling" component={GamblingPage} />
      <ProtectedRoute path="/utility" component={UtilityPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/logs" component={LogsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
