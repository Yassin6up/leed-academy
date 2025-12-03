import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
    const [location, setLocation] = useLocation();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const { toast } = useToast();

    // Parse query parameters manually since wouter doesn't have a built-in hook for it
    const getQueryParam = (param: string) => {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        return params.get(param);
    };

    useEffect(() => {
        const verify = async () => {
            const token = getQueryParam("token");

            if (!token) {
                setStatus("error");
                return;
            }

            try {
                await apiRequest("POST", "/api/auth/verify", { token });
                setStatus("success");
                toast({
                    title: "Email verified",
                    description: "Your email has been verified successfully. You can now login.",
                });
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                toast({
                    title: "Verification failed",
                    description: "Invalid or expired verification token.",
                    variant: "destructive",
                });
            }
        };

        verify();
    }, [toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 py-8">
                    {status === "verifying" && (
                        <>
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <p className="text-muted-foreground">Verifying your email...</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg">Verification Successful!</h3>
                                <p className="text-muted-foreground">
                                    Your email has been successfully verified. You can now access your account.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => setLocation("/auth")}
                            >
                                Go to Login
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <XCircle className="h-16 w-16 text-destructive" />
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg">Verification Failed</h3>
                                <p className="text-muted-foreground">
                                    The verification link is invalid or has expired. Please try registering again or contact support.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setLocation("/auth")}
                            >
                                Back to Login
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
