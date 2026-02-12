export const dynamic = "force-dynamic";

import { rmmService } from "@sent/feature-sent-msp";
import { AlertsFeed } from "./alerts-feed";

export default async function AlertsPage() {
    const alerts = await rmmService.getAlerts();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                <p className="text-muted-foreground">
                    Unified stream of all critical events and warnings.
                </p>
            </div>

            <AlertsFeed initialAlerts={alerts} />
        </div>
    );
}
