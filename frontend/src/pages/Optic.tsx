import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// @ts-ignore
import {
  GetCameras,
  PTZMove,
  PTZClickToCenter,
} from "../../wailsjs/go/optic/OpticBridge";
import {
  ScanLine,
  Crosshair,
  Move,
  Maximize2,
  Search,
  History,
  Settings,
  Square,
  Video,
  ShieldAlert,
  Zap,
  LayoutGrid,
  Info,
  HardDrive,
  Cloud,
  FileSearch,
  Activity,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";

export function Optic() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCam, setSelectedCam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setContextSidebar, toggleContext, isContextOpen } = useAppStore();

  // Mock data for inference chart
  const inferenceData = [
    { time: "14:15", events: 12 },
    { time: "14:16", events: 18 },
    { time: "14:17", events: 5 },
    { time: "14:18", events: 25 }, // Spike
    { time: "14:19", events: 8 },
    { time: "14:20", events: 10 },
    { time: "14:21", events: 15 },
    { time: "14:22", events: 22 },
  ];

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      console.log("[OPTIC] Initiating camera fetch...");
      setLoading(true);

      // Safety timeout for bridge methods
      const bridgePromise = GetCameras();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("BRIDGE_TIMEOUT")), 5000),
      );

      let res: any[] = [];
      try {
        res = (await Promise.race([bridgePromise, timeoutPromise])) as any[];
        console.log(
          "[OPTIC] Bridge response received:",
          res?.length || 0,
          "cameras found.",
        );
      } catch (raceErr: any) {
        if (raceErr.message === "BRIDGE_TIMEOUT") {
          console.warn(
            "[OPTIC] GetCameras timed out. Falling back to mock data or empty state.",
          );
        } else {
          throw raceErr;
        }
      }

      // Mocking health status if backend doesn't provide it yet
      const processedCams =
        res?.map((c: any, i: number) => ({
          ...c,
          status: i === 1 ? "error" : i === 3 ? "warning" : "healthy",
          latency: i === 1 ? "ERR" : i === 3 ? "142ms" : "12ms",
        })) || [];

      // Fallback for development/missing backend if no result returned
      if (processedCams.length === 0) {
        console.log(
          "[OPTIC] No backend cameras found, checking if fallback needed.",
        );
        // If we want mock data in dev, we can add it here
      }

      setCameras(processedCams);
      if (processedCams.length > 0) setSelectedCam(processedCams[0]);
    } catch (err) {
      console.error("[OPTIC] fetchCameras Error:", err);
      toast.error("Failed to load cameras");
    } finally {
      // Ensure loading is cleared
      setLoading(false);
    }
  };

  const handleInfoClick = (cam: any) => {
    setContextSidebar(<CameraDetails cam={cam} />);
    toggleContext(true);
  };

  const handlePTZ = async (direction: string) => {
    if (!selectedCam) return;
    try {
      await PTZMove(selectedCam.id, direction, 0.5);
      toast.info(`Moving ${direction}`);
    } catch (err) {
      toast.error("PTZ Command Failed");
    }
  };

  const handleClickToCenter = async (
    e: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    if (!selectedCam || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    try {
      await PTZClickToCenter(selectedCam.id, x, y);
      toast.success("Centering on ROI...");
    } catch (err) {
      toast.error("Click-to-Center failed");
    }
  };

  const breadcrumbs = [
    { label: "Infrastructure" },
    { label: "SENToptic NVR" },
    { label: "Live Matrix" },
  ];

  if (loading && cameras.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="flex gap-6 h-[600px]">
          <Skeleton className="w-80 h-full rounded-xl" />
          <Skeleton className="flex-1 h-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <PageHeader
        title="SENToptic"
        description="Physical Security, Visual Surveillance & AI Inference Engine"
        icon={Camera}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Matrix View",
          icon: LayoutGrid,
          onClick: () =>
            toast.info("Matrix View", {
              description: "Toggling high-density grid mode.",
            }),
        }}
      >
        <Button
          variant="outline"
          className="h-9 text-xs gap-2"
          onClick={() => handleInfoClick(selectedCam)}
        >
          <Info className="h-3.5 w-3.5" /> Stream Metadata
        </Button>
      </PageHeader>

      {cameras.length === 0 && !loading ? (
        <EmptyState
          icon={Camera}
          title="No Cameras Found"
          description="No ONVIF or RTSP streams have been registered. Connect your first IP camera to start monitoring."
          action={{ label: "Add Camera", onClick: () => {} }}
        />
      ) : (
        <div className="flex flex-1 gap-6 overflow-hidden pb-4">
          {/* Left: Camera List & Controls */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
            <Card className="shrink-0 border-none shadow-lg overflow-hidden flex flex-col max-h-[50%]">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-3.5 w-3.5 text-primary" /> Camera Matrix
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[300px] px-2 py-2">
                  <div className="space-y-1">
                    {cameras.map((cam) => (
                      <div
                        key={cam.id}
                        onClick={() => setSelectedCam(cam)}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-between group cursor-pointer ${
                          selectedCam?.id === cam.id
                            ? "bg-primary/5 border-primary/20 shadow-sm"
                            : "hover:bg-muted/50 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                cam.status === "healthy"
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                  : cam.status === "warning"
                                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                    : "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                              }`}
                            />
                          </div>
                          <div>
                            <p
                              className={`font-bold text-xs transition-colors ${selectedCam?.id === cam.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                            >
                              {cam.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-70">
                              {cam.ip}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-white/5 bg-black/20 text-muted-foreground font-mono"
                          >
                            {cam.id % 2 === 0 ? "WEBRTC" : "RTSP"}
                          </Badge>
                          {cam.latency && (
                            <span
                              className={`text-[9px] font-mono ${
                                cam.status === "healthy"
                                  ? "text-emerald-500"
                                  : cam.status === "warning"
                                    ? "text-amber-500"
                                    : "text-red-500"
                              }`}
                            >
                              {cam.latency}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Move className="h-3.5 w-3.5 text-primary" /> Precision PTZ
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 py-6">
                <div className="grid grid-cols-3 gap-2">
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shadow-sm hover:active:scale-95 transition-transform"
                    onClick={() => handlePTZ("up")}
                  >
                    <ScanLine className="h-4 w-4 rotate-180" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shadow-sm hover:active:scale-95 transition-transform"
                    onClick={() => handlePTZ("left")}
                  >
                    <ScanLine className="h-4 w-4 -rotate-90" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                    onClick={() => toast.info("Auto-track enabled")}
                  >
                    <Crosshair className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shadow-sm hover:active:scale-95 transition-transform"
                    onClick={() => handlePTZ("right")}
                  >
                    <ScanLine className="h-4 w-4 rotate-90" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shadow-sm hover:active:scale-95 transition-transform"
                    onClick={() => handlePTZ("down")}
                  >
                    <ScanLine className="h-4 w-4" />
                  </Button>
                  <div />
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-[10px] h-8 font-bold uppercase tracking-tighter hover:bg-muted/50"
                  >
                    Zoom +
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-[10px] h-8 font-bold uppercase tracking-tighter hover:bg-muted/50"
                  >
                    Zoom -
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Stream & Analytics */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="relative flex-1 bg-black rounded-xl overflow-hidden border border-border/40 group shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                {!selectedCam ? (
                  <div className="text-center">
                    <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No Stream Selected</p>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      {selectedCam.status === "error" ? (
                        <Badge className="bg-red-600 animate-pulse border-none text-[10px] font-black h-5 px-2">
                          OFFLINE
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600 border-none text-[10px] font-black h-5 px-2">
                          LIVE
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="bg-black/60 backdrop-blur-xl border-white/10 text-[10px] font-bold h-5 text-white shadow-lg"
                      >
                        {selectedCam.name}
                      </Badge>
                    </div>

                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover opacity-90"
                      autoPlay
                      muted
                      playsInline
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px] pointer-events-none" />

                    <canvas
                      ref={canvasRef}
                      onClick={handleClickToCenter}
                      className="absolute inset-0 z-20 cursor-crosshair opacity-50 hover:opacity-100 transition-opacity"
                    />

                    <div className="absolute bottom-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-[10px] gap-1.5 font-bold bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md"
                      >
                        <Maximize2 className="h-3 w-3" /> Fullscreen
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-[10px] gap-1.5 font-bold"
                      >
                        <Square className="h-3 w-3" /> Stop
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-64 flex gap-4 shrink-0">
              <Card className="flex-1 overflow-hidden border-none shadow-lg flex flex-col">
                <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 shrink-0 h-10">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-amber-500" /> TFLite
                    Inference Logs
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 font-bold text-muted-foreground"
                    >
                      <History className="h-3 w-3" /> History
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 font-bold text-muted-foreground"
                    >
                      <Settings className="h-3 w-3" /> Config
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-full overflow-hidden">
                  {/* Visual Forensics Chart */}
                  <div className="h-[80px] w-full bg-slate-950/20 border-b border-border/40 pt-2 px-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inferenceData}>
                        <Tooltip
                          contentStyle={{
                            background: "#111",
                            border: "1px solid #333",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        />
                        <Bar
                          dataKey="events"
                          fill="#eab308"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-primary/10 group"
                        >
                          <div className="h-10 w-14 bg-slate-900 rounded-md flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-yellow-500/30 transition-colors shrink-0">
                            <ScanLine className="h-4 w-4 text-slate-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold group-hover:text-primary transition-colors truncate">
                                Person Detected (Zone B)
                              </p>
                              <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                14:22:0{i}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              North Perimeter Entrance • {(90 + i).toFixed(1)}%
                              Conf
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Forensic Search - High Contrast Mode */}
              <Card className="w-80 overflow-hidden border border-cyan-900/50 shadow-lg bg-black text-white">
                <CardHeader className="py-2 px-4 border-b border-cyan-500/20 h-10 flex justify-center bg-cyan-950/20">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <FileSearch className="h-3.5 w-3.5" /> Forensic ROI Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-cyan-800 pl-3">
                    Draw a region on the stream to search historical motion
                    events within that specific spatial area.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-xs h-10 border-dashed border-cyan-800 bg-transparent hover:bg-cyan-950/30 text-cyan-200 hover:text-cyan-100 transition-colors"
                  >
                    <ScanLine className="h-3.5 w-3.5" /> Define Matrix Box
                  </Button>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 h-9 text-xs font-black bg-cyan-700 hover:bg-cyan-600 text-white uppercase tracking-widest border border-cyan-500/20">
                      Init Search
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="text-[9px] text-center text-cyan-900 font-mono mt-2">
                    SENToptic Forensic Engine v2.4
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {isContextOpen && (
        <ContextSidebar
          isOpen={isContextOpen}
          onClose={() => toggleContext(false)}
          title="Stream Metadata"
        >
          <CameraDetails cam={selectedCam} />
        </ContextSidebar>
      )}
    </div>
  );
}

function CameraDetails({ cam }: any) {
  if (!cam) return null;
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div
          className={`h-16 w-16 rounded-xl flex items-center justify-center ${
            cam.status === "error"
              ? "bg-red-500/10 text-red-500"
              : "bg-cyan-500/10 text-cyan-600"
          }`}
        >
          <Video className="h-8 w-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight">{cam.name}</h2>
            {cam.status === "error" && (
              <Badge variant="destructive" className="h-5 text-[10px]">
                OFFLINE
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-medium">
            ONVIF-Compliant Device
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <DetailRow label="Device IP" value={cam.ip} font="font-mono" />
        <DetailRow
          label="Latency"
          value={cam.latency}
          color={cam.status === "healthy" ? "text-emerald-500" : "text-red-500"}
        />
        <DetailRow label="Model" value="HIK-VISION-4242-PTZ" />
        <DetailRow
          label="Stream Quality"
          value="4K (3840x2160) @ 30FPS"
          color="text-emerald-600 font-bold"
        />
        <DetailRow label="Transport" value="RTP/UDP (Encrypted)" />
      </div>

      <div className="space-y-3 pt-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
          Storage Strategy
        </h4>
        <div className="grid gap-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase">
                Tier 1 (Local)
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] h-5">
              7 DAYS
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold uppercase">
                Tier 2 (Vault)
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] h-5">
              FORENSIC
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
          Admin Actions
        </h4>
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <Settings className="h-3.5 w-3.5 text-slate-500" /> Advanced Config
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Trigger Reboot
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <History className="h-3.5 w-3.5 text-blue-500" /> Access Logs
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, font = "", color = "" }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm font-medium ${font} ${color}`}>{value}</span>
    </div>
  );
}
