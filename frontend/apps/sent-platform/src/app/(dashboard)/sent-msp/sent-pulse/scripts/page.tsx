export const dynamic = "force-dynamic";

import { rmmService } from "@sent/feature-sent-msp";
import { ScriptLibrary } from "./script-library";

export default async function ScriptsPage() {
    const scripts = await rmmService.getScripts();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Automation Library</h1>
                <p className="text-muted-foreground">
                    Manage and execute automation scripts across your environments.
                </p>
            </div>

            <ScriptLibrary initialScripts={scripts} />
        </div>
    );
}
