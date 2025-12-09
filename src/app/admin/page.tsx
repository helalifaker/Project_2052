"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/lib/types/roles";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import {
  Database,
  Settings,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();

  const [systemStatus, setSystemStatus] = useState({
    historicalDataConfirmed: false,
    configurationComplete: false,
    capexModuleSetup: false,
    loading: true,
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [configRes, historicalRes, capexRes] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/historical"),
          fetch("/api/capex"),
        ]);

        const config = configRes.ok ? await configRes.json() : null;
        const historical = historicalRes.ok ? await historicalRes.json() : [];
        const capex = capexRes.ok ? await capexRes.json() : null;

        const historicalDataConfirmed = Array.isArray(historical)
          ? historical.some((item) => item.confirmed)
          : false;
        const configurationComplete = Boolean(
          config?.confirmedAt || config?.id,
        );
        const capexModuleSetup = Boolean(capex?.isConfigured);

        setSystemStatus({
          historicalDataConfirmed,
          configurationComplete,
          capexModuleSetup,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load system status", error);
        setSystemStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    loadStatus();
  }, []);

  const { loading, ...statusFlags } = systemStatus;
  const allSetupComplete = Object.values(statusFlags).every((status) => status);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Navigation */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin" },
          ]}
        />
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Configure system settings, manage historical data, and set up the
          CapEx module
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allSetupComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
            System Status
          </CardTitle>
          <CardDescription>
            {loading
              ? "Checking system configuration..."
              : allSetupComplete
                ? "All setup tasks completed. System ready for use."
                : "Complete the setup tasks below to begin using the system."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Historical Data Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              {systemStatus.historicalDataConfirmed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">Historical Data</p>
                <p className="text-sm text-muted-foreground">
                  {systemStatus.historicalDataConfirmed
                    ? "Confirmed"
                    : "Not confirmed"}
                </p>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              {systemStatus.configurationComplete ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">System Configuration</p>
                <p className="text-sm text-muted-foreground">
                  {systemStatus.configurationComplete
                    ? "Complete"
                    : "Incomplete"}
                </p>
              </div>
            </div>

            {/* CapEx Module Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              {systemStatus.capexModuleSetup ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">CapEx Module</p>
                <p className="text-sm text-muted-foreground">
                  {systemStatus.capexModuleSetup ? "Set up" : "Not set up"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Historical Data Entry */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/admin/historical")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Database className="h-8 w-8 text-primary" />
              {!systemStatus.historicalDataConfirmed && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <CardTitle className="mt-4">Historical Data</CardTitle>
            <CardDescription>
              Input financial statements for 2023-2024 and confirm historical
              data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant={
                systemStatus.historicalDataConfirmed ? "outline" : "default"
              }
            >
              {systemStatus.historicalDataConfirmed
                ? "View Data"
                : "Enter Data"}
            </Button>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/admin/config")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Settings className="h-8 w-8 text-primary" />
              {!systemStatus.configurationComplete && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <CardTitle className="mt-4">System Configuration</CardTitle>
            <CardDescription>
              Configure Zakat rates, interest rates, and minimum cash balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant={
                systemStatus.configurationComplete ? "outline" : "default"
              }
            >
              {systemStatus.configurationComplete
                ? "View Settings"
                : "Configure"}
            </Button>
          </CardContent>
        </Card>

        {/* CapEx Module */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/admin/capex")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <HardDrive className="h-8 w-8 text-primary" />
              {!systemStatus.capexModuleSetup && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <CardTitle className="mt-4">CapEx Module</CardTitle>
            <CardDescription>
              Set up auto-reinvestment and manage manual CapEx items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant={systemStatus.capexModuleSetup ? "outline" : "default"}
            >
              {systemStatus.capexModuleSetup ? "Manage CapEx" : "Set Up"}
            </Button>
          </CardContent>
        </Card>

        {/* Transition Period Setup */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/admin/transition")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Transition Period</CardTitle>
            <CardDescription>
              Configure 2025-2027 bridge period used by ALL proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Config
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/admin/users")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">User Management</CardTitle>
            <CardDescription>
              Approve new users and manage roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Insights
          </CardTitle>
          <CardDescription>
            Quick overview of key system metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Historical Years</p>
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">2023 - 2024</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transition Period</p>
              <p className="text-2xl font-bold">3 years</p>
              <p className="text-xs text-muted-foreground">2025 - 2027</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Projection Period</p>
              <p className="text-2xl font-bold">26 years</p>
              <p className="text-xs text-muted-foreground">
                2028 - 2053 (Dynamic)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <AdminDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
