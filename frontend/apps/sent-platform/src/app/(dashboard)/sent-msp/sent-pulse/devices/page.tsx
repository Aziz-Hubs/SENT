export const dynamic = "force-dynamic";

import { rmmService } from "@sent/feature-sent-msp";
import { DevicesTable } from "./devices-table";

export default async function DevicesPage() {
    const devices = await rmmService.getDevices();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
                <p className="text-muted-foreground">
                    Manage and monitor all endpoints across your clients.
                </p>
            </div>

            <DevicesTable initialDevices={devices} />
        </div>
    );
}
