
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Settings = () => {
  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="api">API Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Organization Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        placeholder="Your Organization"
                        defaultValue="Vocality Demo Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-email">Contact Email</Label>
                      <Input
                        id="org-email"
                        type="email"
                        placeholder="contact@yourorganization.com"
                        defaultValue="admin@vocality.app"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interface Settings</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="theme-mode" className="block">
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable dark mode for all users
                        </p>
                      </div>
                      <Switch id="theme-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="language-mode" className="block">
                          Use 24-hour Format
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Display time in 24-hour format
                        </p>
                      </div>
                      <Switch id="language-mode" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => toast.success("Settings saved successfully")}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-reports" className="block">
                          Daily Reports
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive daily summary reports via email
                        </p>
                      </div>
                      <Switch id="notify-reports" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-alerts" className="block">
                          Performance Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when performance metrics change significantly
                        </p>
                      </div>
                      <Switch id="notify-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-system" className="block">
                          System Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about system updates
                        </p>
                      </div>
                      <Switch id="notify-system" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-notify-calls" className="block">
                          Missed Calls
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications for missed calls
                        </p>
                      </div>
                      <Switch id="app-notify-calls" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-notify-messages" className="block">
                          New Messages
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications for new messages
                        </p>
                      </div>
                      <Switch id="app-notify-messages" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => toast.success("Notification settings saved successfully")}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Settings</CardTitle>
                <CardDescription>
                  Configure compliance requirements and mandatory phrases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Required Phrases</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="greeting-phrase">Greeting Phrase</Label>
                      <Input
                        id="greeting-phrase"
                        placeholder="Enter required greeting phrase"
                        defaultValue="Thank you for calling [Company]. My name is [Name]. How may I assist you today?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verification-phrase">Identity Verification</Label>
                      <Input
                        id="verification-phrase"
                        placeholder="Enter verification phrase"
                        defaultValue="For security purposes, could you please verify your account by providing [Verification Item]?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disclosure-phrase">Required Disclosure</Label>
                      <Input
                        id="disclosure-phrase"
                        placeholder="Enter required disclosure"
                        defaultValue="Please note that this call may be recorded for quality and training purposes."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farewell-phrase">Farewell Phrase</Label>
                      <Input
                        id="farewell-phrase"
                        placeholder="Enter farewell phrase"
                        defaultValue="Thank you for calling [Company]. Is there anything else I can help you with today?"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Compliance Settings</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="record-calls" className="block">
                          Record All Calls
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically record all customer calls
                        </p>
                      </div>
                      <Switch id="record-calls" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enforce-compliance" className="block">
                          Enforce Compliance
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show warnings when compliance phrases are missed
                        </p>
                      </div>
                      <Switch id="enforce-compliance" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-disclosure" className="block">
                          Auto-Disclosure
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Play automatic disclosure at start of call
                        </p>
                      </div>
                      <Switch id="auto-disclosure" />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => toast.success("Compliance settings saved successfully")}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>
                  Manage API keys and integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="api-key"
                          type="password"
                          value="sk_live_vocality_a1b2c3d4e5f6g7h8i9j0"
                          readOnly
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => toast.success("API key copied to clipboard")}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This key provides full access to your Vocality account.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="rotate-key" className="block">
                          Rotate API Key
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Generate a new API key and invalidate the current one
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => toast.info("This would rotate your API key in a real system")}
                      >
                        Rotate Key
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Webhook Settings</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://your-server.com/webhook"
                        defaultValue="https://example.com/vocality-webhook"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="webhook-active" className="block">
                          Webhook Active
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable webhook notifications
                        </p>
                      </div>
                      <Switch id="webhook-active" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook Events</Label>
                      <div className="grid gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="webhook-call-started" defaultChecked />
                          <Label htmlFor="webhook-call-started">Call Started</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="webhook-call-ended" defaultChecked />
                          <Label htmlFor="webhook-call-ended">Call Ended</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="webhook-compliance-issue" />
                          <Label htmlFor="webhook-compliance-issue">Compliance Issue</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => toast.success("API settings saved successfully")}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
