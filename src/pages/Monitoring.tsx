
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Headphones, PhoneCall, Clock, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const activeCalls = [
  {
    id: "1",
    agent: {
      name: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=4039c4&color=fff",
    },
    customer: "John Smith",
    duration: "04:32",
    status: "in-progress",
  },
  {
    id: "2",
    agent: {
      name: "David Williams",
      avatar: "https://ui-avatars.com/api/?name=David+Williams&background=6271f1&color=fff",
    },
    customer: "Maria Garcia",
    duration: "01:17",
    status: "in-progress",
  },
  {
    id: "3",
    agent: {
      name: "Emma Lewis",
      avatar: "https://ui-avatars.com/api/?name=Emma+Lewis&background=36319d&color=fff",
    },
    customer: "Robert Chen",
    duration: "08:05",
    status: "in-progress",
  },
  {
    id: "4",
    agent: {
      name: "Alex Thompson",
      avatar: "https://ui-avatars.com/api/?name=Alex+Thompson&background=302d7a&color=fff",
    },
    customer: "Jennifer Lopez",
    duration: "00:45",
    status: "in-progress",
  },
];

const agentQueue = [
  {
    id: "1",
    name: "Michael Brown",
    status: "available",
    lastCall: "10:25 AM",
    avatar: "https://ui-avatars.com/api/?name=Michael+Brown&background=6271f1&color=fff",
  },
  {
    id: "2",
    name: "Lisa Wang",
    status: "break",
    lastCall: "09:48 AM",
    avatar: "https://ui-avatars.com/api/?name=Lisa+Wang&background=4e4de4&color=fff",
  },
  {
    id: "3",
    name: "James Wilson",
    status: "available",
    lastCall: "11:02 AM",
    avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=4039c4&color=fff",
  },
];

const Monitoring = () => {
  const handleJoinCall = (agentName: string) => {
    toast.success(`Joining ${agentName}'s call for monitoring`);
  };

  return (
    <DashboardLayout title="Live Monitoring">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Active Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeCalls.map((call) => (
                <Card key={call.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-vocality-600 to-vocality-800 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white">
                          <img
                            src={call.agent.avatar}
                            alt={call.agent.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{call.agent.name}</h3>
                          <p className="text-xs text-white/80">Agent</p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "bg-white/20 hover:bg-white/30 text-white border-0",
                          call.status === "in-progress" && "animate-pulse"
                        )}
                      >
                        Live
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">Customer</div>
                        <div className="font-medium">{call.customer}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">{call.duration}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">Quality</div>
                        <div className="font-medium">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                              style={{ width: `${Math.random() * 50 + 50}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleJoinCall(call.agent.name)}
                      >
                        <Headphones className="h-4 w-4" />
                        Join Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Analysis (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <img
                        src={activeCalls[0].agent.avatar}
                        alt={activeCalls[0].agent.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{activeCalls[0].agent.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-vocality-50 text-vocality-700 border-vocality-200 dark:bg-vocality-950/50 dark:text-vocality-300 dark:border-vocality-800"
                  >
                    Listening
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Speech Clarity</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-vocality-600" style={{ width: "85%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Speaking Pace</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-vocality-600" style={{ width: "92%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Customer Engagement</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-vocality-600" style={{ width: "78%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Script Compliance</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-vocality-600" style={{ width: "95%" }} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Live Transcript</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-vocality-600 dark:text-vocality-400">Agent:</span> 
                      Thank you for calling our support line. How can I assist you today?
                    </p>
                    <p>
                      <span className="font-medium">Customer:</span> 
                      I'm having trouble accessing my account online. It keeps saying my password is incorrect.
                    </p>
                    <p>
                      <span className="font-medium text-vocality-600 dark:text-vocality-400">Agent:</span> 
                      I understand how frustrating that can be. Let me help you reset your password. 
                      Can I please verify your account information first?
                    </p>
                    <p className="animate-pulse">
                      <span className="font-medium">Customer:</span> 
                      Sure, my account number is...
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agent Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentQueue.map((agent) => (
                  <div key={agent.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background",
                            agent.status === "available"
                              ? "bg-green-500"
                              : "bg-amber-500"
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Last call: {agent.lastCall}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        agent.status === "available"
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : "border-amber-500 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {agent.status === "available" ? "Available" : "On Break"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Monitoring;
