
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VoiceAnalysisPanel } from "@/components/audio/VoiceAnalysisPanel";

const VoiceAnalysis = () => {
  return (
    <DashboardLayout title="Voice Analysis">
      <VoiceAnalysisPanel />
    </DashboardLayout>
  );
};

export default VoiceAnalysis;
