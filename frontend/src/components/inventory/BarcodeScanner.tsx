import { useZxing } from "react-zxing"
import { useState } from "react"

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState("")

  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText())
    },
    onError(err) {
      console.error(err)
      setError("Webcam access denied or unavailable.")
    }
  })

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        <video ref={ref} className="w-full h-full object-cover" />
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-32 border-2 border-dashed border-white/50 rounded flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
            </div>
        </div>
      </div>
      
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <p className="text-muted-foreground text-xs text-center uppercase tracking-widest">
            Align barcode within the center frame
        </p>
      )}
      
      <button 
        onClick={onClose}
        className="w-full py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-bold transition-colors"
      >
        Cancel Scanning
      </button>
    </div>
  )
}
