
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VoiceAnalysisPanel } from "@/components/audio/VoiceAnalysisPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const VoiceAnalysis = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Voice Analysis">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Voice Analysis</CardTitle>
            <CardDescription>
              Record and analyze your customer conversations to improve quality and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="record">
              <TabsList className="mb-4">
                <TabsTrigger value="record">Record & Analyze</TabsTrigger>
                <TabsTrigger value="history">Analysis History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="record">
                <VoiceAnalysisPanel />
              </TabsContent>
              
              <TabsContent value="history">
                <div className="h-40 flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Your previous analyses will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VoiceAnalysis;
