import { Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TicketSidebar } from "@/components/TicketSidebar";
import { Dashboard } from "@/pages/Dashboard";
import { TicketDetail } from "@/pages/TicketDetail";
import { TrashPage } from "@/pages/TrashPage";

export default function App() {
  return (
    <ThemeProvider>
      <Switch>
        <Route path="/trash">
          <div className="flex h-screen overflow-hidden bg-background">
            <TicketSidebar />
            <TrashPage />
          </div>
        </Route>
        <Route path="/ticket/:id">
          {(params) => (
            <div className="flex h-screen overflow-hidden bg-background">
              <TicketSidebar selectedId={Number(params.id)} />
              <TicketDetail id={Number(params.id)} />
            </div>
          )}
        </Route>
        <Route path="/">
          <div className="flex h-screen overflow-hidden bg-background">
            <TicketSidebar />
            <Dashboard />
          </div>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}
