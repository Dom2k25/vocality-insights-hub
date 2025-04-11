
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { KeyPhrases } from "@/components/dashboard/KeyPhrases";
import { 
  PhoneCall, 
  Clock, 
  BarChart3, 
  Users,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Calls"
          value="183"
          icon={<PhoneCall className="h-4 w-4" />}
          description="This month"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Average Duration"
          value="5:32"
          icon={<Clock className="h-4 w-4" />}
          description="Per call"
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Quality Score"
          value="84%"
          icon={<BarChart3 className="h-4 w-4" />}
          description="Overall"
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Active Agents"
          value="12"
          icon={<Users className="h-4 w-4" />}
          description="Of 15 total"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ActivityChart className="md:col-span-2" />
        <RecentCalls />
        <KeyPhrases />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Your Calls"
            value="27"
            icon={<PhoneCall className="h-4 w-4" />}
            description="This month"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Average Duration"
            value="4:48"
            icon={<Clock className="h-4 w-4" />}
            description="Per call"
            trend={{ value: 2, isPositive: false }}
          />
          <StatCard
            title="Your Quality Score"
            value="88%"
            icon={<BarChart3 className="h-4 w-4" />}
            description="Overall"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Team Rank"
            value="#2"
            icon={<UserCheck className="h-4 w-4" />}
            description="Of 12 agents"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
