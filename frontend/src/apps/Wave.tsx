import React, { useState, useEffect } from "react";
// @ts-ignore
import {
  GetCallLogs,
  InitiateCall,
  Hangup,
} from "../../wailsjs/go/wave/WaveBridge";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  History,
  Mic,
  MicOff,
  Volume2,
  Keyboard,
  Users,
  MessageSquare,
  Voicemail,
  Plus,
  Zap,
  Radio,
  Circle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const WaveApp: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [dialNumber, setDialNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [sipData, setSipData] = useState({
    user: "",
    pass: "",
    domain: "voip.sent.internal",
  });

  const handleProvision = async () => {
    toast.success("SIP Profile Initialized", {
      description: `Endpoint ${sipData.user}@${sipData.domain} is now authoritative.`,
    });
    setIsProvisionOpen(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(
      isRecording ? "Recording saved to Vault" : "Call recording initiated",
      {
        icon: isRecording ? null : (
          <Radio className="h-4 w-4 text-red-500 animate-pulse" />
        ),
      },
    );
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      if (window.go) {
        const l = await GetCallLogs();
        setLogs(l || []);
      }
    } catch (err) {
      toast.error("Failed to load call history");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleCall = async () => {
    if (!dialNumber) return;
    try {
      const callID = await InitiateCall(dialNumber);
      setActiveCall(callID);
      toast.success(`Calling ${dialNumber}...`);
    } catch (err) {
      toast.error("Call initialization failed");
    }
  };

  const handleHangup = async () => {
    if (!activeCall) return;
    try {
      await Hangup(activeCall);
      setActiveCall(null);
      toast.info("Call Terminated");
      loadLogs();
    } catch (err) {
      toast.error("Failed to hang up");
    }
  };

  const breadcrumbs = [{ label: "Infrastructure" }, { label: "SENTwave VoIP" }];

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <PageHeader
        title="SENTwave"
        description="Cloud VoIP, PBX Management & Real-time Communications"
        icon={Phone}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Provision SIP",
          icon: Zap,
          onClick: () => setIsProvisionOpen(true),
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dialer Section */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl overflow-hidden bg-primary/5 border-t border-t-primary/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">
                Unified Softphone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  placeholder="Enter number or name"
                  className="w-full bg-background border-none text-3xl font-black text-center py-4 rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-14 text-xl font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                    onClick={() => setDialNumber((prev) => prev + key)}
                  >
                    {key}
                  </Button>
                ))}
              </div>

              {activeCall ? (
                <div className="space-y-4 animate-pulse">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      In Call (00:42)
                    </span>
                    <span className="text-lg font-bold">{dialNumber}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={() => setIsMuted(!isMuted)}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <MicOff className="h-5 w-5 text-red-500" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex-1 h-12 ${isRecording ? "border-red-500 bg-red-500/10" : ""}`}
                      onClick={toggleRecording}
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                      <Radio
                        className={`h-5 w-5 ${isRecording ? "text-red-500 animate-pulse" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-2 h-12 gap-2 font-bold"
                      onClick={handleHangup}
                    >
                      <PhoneOff className="h-5 w-5" /> End Call
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 gap-3 text-lg font-black uppercase tracking-widest"
                  onClick={handleCall}
                  disabled={!dialNumber}
                >
                  <PhoneCall className="h-6 w-6" /> Call
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-2 flex justify-around">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-muted-foreground hover:text-primary"
              >
                <Keyboard className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-muted-foreground hover:text-primary"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-muted-foreground hover:text-primary"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-muted-foreground hover:text-primary"
              >
                <Voicemail className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History & Logs Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Recent Calls
              </TabsTrigger>
              <TabsTrigger value="voicemail" className="gap-2">
                <Voicemail className="h-4 w-4" />
                Visual Voicemail
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="history"
              className="animate-in fade-in slide-in-from-right-4 duration-500"
            >
              {logs.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No call history"
                  description="Your recent calls and missed notifications will appear here."
                />
              ) : (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="pl-6">Party</TableHead>
                          <TableHead>Direction</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="text-right pr-6">
                            Time
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log, i) => (
                          <TableRow
                            key={i}
                            className="hover:bg-muted/50 transition-colors group cursor-pointer"
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                                  {log.from[0]}
                                </div>
                                <div className="font-bold text-sm">
                                  {log.from}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[9px] h-5 font-bold uppercase tracking-tighter"
                              >
                                Inbound
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              04:12
                            </TableCell>
                            <TableCell className="text-right pr-6 text-[10px] text-muted-foreground font-medium">
                              {new Date(log.startTime).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="voicemail">
              <EmptyState
                icon={Voicemail}
                title="Inbox Empty"
                description="You don't have any new voicemail messages."
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* SIP Provisioning Dialog */}
      <Dialog open={isProvisionOpen} onOpenChange={setIsProvisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SIP Endpoint Provisioning</DialogTitle>
            <DialogDescription>
              Configure authoritative SIP credentials for the SENTwave signaling
              mesh.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sip-user">SIP Username</Label>
              <Input
                id="sip-user"
                value={sipData.user}
                onChange={(e) =>
                  setSipData({ ...sipData, user: e.target.value })
                }
                placeholder="e.g. extension_101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sip-pass">SIP Password</Label>
              <Input
                id="sip-pass"
                type="password"
                value={sipData.pass}
                onChange={(e) =>
                  setSipData({ ...sipData, pass: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sip-domain">Signaling Domain</Label>
              <Input
                id="sip-domain"
                value={sipData.domain}
                onChange={(e) =>
                  setSipData({ ...sipData, domain: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProvisionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProvision}
              className="bg-primary hover:bg-primary/90"
            >
              Initialize Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaveApp;
