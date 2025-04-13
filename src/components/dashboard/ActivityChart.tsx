
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeProvider";

// Sample data
const data = [
  { day: "Mon", calls: 12, score: 78 },
  { day: "Tue", calls: 18, score: 82 },
  { day: "Wed", calls: 15, score: 85 },
  { day: "Thu", calls: 20, score: 79 },
  { day: "Fri", calls: 25, score: 80 },
  { day: "Sat", calls: 8, score: 92 },
  { day: "Sun", calls: 5, score: 89 },
];

interface ActivityChartProps {
  className?: string;
}

export function ActivityChart({ className }: ActivityChartProps) {
  const { theme } = useTheme();
  
  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";
  const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Call volume and quality scores</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6271f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6271f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4e4de4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4e4de4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="day" 
              tick={{ fill: textColor }}
              tickLine={{ stroke: textColor }}
            />
            <YAxis 
              tick={{ fill: textColor }}
              tickLine={{ stroke: textColor }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                color: textColor
              }}
            />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="#6271f1"
              fillOpacity={1}
              fill="url(#colorCalls)"
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#4e4de4"
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
