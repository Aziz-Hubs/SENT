import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2 } from "lucide-react"

interface WorkflowJob {
    id: string
    name: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    progress: number
}

/**
 * WorkflowStatus provides real-time feedback on automation orchestration.
 */
export function WorkflowStatus() {
    const [workflows, setWorkflows] = useState<WorkflowJob[]>([
        { id: '1', name: 'M365 License Revocation', status: 'running', progress: 45 },
        { id: '2', name: 'Asset Unassignment', status: 'pending', progress: 0 },
        { id: '3', name: 'VoIP Call Redirection', status: 'completed', progress: 100 }
    ])

    // In a real implementation, we would listen to Centrifugo events
    useEffect(() => {
        // Simulate progress for the 'running' job
        const interval = setInterval(() => {
            setWorkflows(prev => prev.map(w => {
                if (w.status === 'running') {
                    const nextProgress = w.progress + 5
                    return {
                        ...w,
                        progress: nextProgress >= 100 ? 100 : nextProgress,
                        status: nextProgress >= 100 ? 'completed' : 'running'
                    }
                }
                return w
            }))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    Active Orchestration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {workflows.map(w => (
                    <div key={w.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{w.name}</span>
                            {w.status === 'completed' ? (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none h-4 px-1.5">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground">{w.progress}%</span>
                            )}
                        </div>
                        <Progress value={w.progress} className="h-1" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
