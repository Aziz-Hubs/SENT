import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Loader2, LogIn } from "lucide-react"
import { Login as AuthLogin } from "../../wailsjs/go/auth/AuthBridge"

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      const res = await AuthLogin()
      console.log(res)
      onLoginSuccess()
    } catch (err: any) {
      setError(err || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-500/10 p-3 ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <ShieldCheck className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">SENT Native</CardTitle>
          <CardDescription className="text-slate-400">
            Secure Unified Monolith Access
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          <div className="py-6 flex flex-col items-center gap-6">
            <p className="text-sm text-center text-slate-400 px-6">
                Clicking the button below will open your system browser to sign in via our secure identity provider.
            </p>
            <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold gap-3 shadow-lg shadow-blue-500/20" 
                onClick={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Waiting for Browser...
                    </>
                ) : (
                    <>
                        <ShieldCheck className="h-6 w-6" />
                        Sign in with Zitadel
                    </>
                )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-slate-500">
          Managed by SENTd Kernel • OIDC Opaque PKCE Flow
        </CardFooter>
      </Card>
    </div>
  )
}
