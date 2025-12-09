"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock,
  LogOut,
  RefreshCw,
  Mail,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

interface ApprovalStatusResponse {
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  message?: string;
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">(
    "PENDING",
  );

  // Check current approval status on mount
  useEffect(() => {
    checkApprovalStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkApprovalStatus = async () => {
    setChecking(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || null);

      // Check approval status via API
      const response = await fetch("/api/auth/approval-status");
      if (response.ok) {
        const data: ApprovalStatusResponse = await response.json();
        setStatus(data.approvalStatus);

        if (data.approvalStatus === "APPROVED") {
          // User is now approved, redirect to dashboard
          router.push("/dashboard");
        }
      } else if (response.status === 403) {
        const data = await response.json();
        if (data.code === "ACCOUNT_REJECTED") {
          setStatus("REJECTED");
        }
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    checkApprovalStatus();
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Checking account status...</span>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                Your account access request has been denied
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Account Rejected</AlertTitle>
                <AlertDescription>
                  Unfortunately, your request to access {APP_NAME} has been
                  denied by an administrator. If you believe this is an error,
                  please contact support.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button variant="link" asChild className="w-full">
                  <a href="mailto:support@cdgefir.com">Contact Support</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Almost There!</h1>
          <p className="text-muted-foreground">
            Your account is pending approval
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>
              An administrator needs to approve your account before you can
              access {APP_NAME}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Account Email</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">What happens next?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• An administrator will review your request</li>
                    <li>• You&apos;ll receive an email once approved</li>
                    <li>
                      • Check back here to see if you&apos;ve been approved
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRefresh}
                disabled={checking}
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`}
                />
                Check Status
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <a
              href="mailto:support@cdgefir.com"
              className="text-primary hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
