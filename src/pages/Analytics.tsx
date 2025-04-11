
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data
const callData = [
  { name: "Mon", calls: 23, handled: 20, abandoned: 3 },
  { name: "Tue", calls: 32, handled: 29, abandoned: 3 },
  { name: "Wed", calls: 28, handled: 25, abandoned: 3 },
  { name: "Thu", calls: 35, handled: 32, abandoned: 3 },
  { name: "Fri", calls: 40, handled: 36, abandoned: 4 },
  { name: "Sat", calls: 18, handled: 17, abandoned: 1 },
  { name: "Sun", calls: 12, handled: 11, abandoned: 1 },
];

const sentimentData = [
  { name: "Positive", value: 65, color: "#10b981" },
  { name: "Neutral", value: 25, color: "#6366f1" },
  { name: "Negative", value: 10, color: "#ef4444" },
];

const topicData = [
  { name: "Product Info", value: 35, color: "#6271f1" },
  { name: "Technical Support", value: 25, color: "#4e4de4" },
  { name: "Billing", value: 20, color: "#4039c4" },
  { name: "Complaints", value: 12, color: "#36319d" },
  { name: "Feedback", value: 8, color: "#302d7a" },
];

const Analytics = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("week");
  
  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";
  const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  
  return (
    <DashboardLayout title="Analytics">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Call Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={callData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                      borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                      color: textColor,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="handled" stackId="a" fill="#6271f1" />
                  <Bar dataKey="abandoned" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                        borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                        color: textColor,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Call Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                        borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                        color: textColor,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quality">
              <TabsList className="mb-4">
                <TabsTrigger value="quality">Quality Score</TabsTrigger>
                <TabsTrigger value="volume">Call Volume</TabsTrigger>
                <TabsTrigger value="duration">Avg Duration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quality" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: "Maria R.", score: 94 },
                      { name: "John D.", score: 91 },
                      { name: "Sarah J.", score: 88 },
                      { name: "Alex T.", score: 86 },
                      { name: "Emma L.", score: 82 },
                      { name: "David M.", score: 79 },
                      { name: "Sandra K.", score: 76 },
                    ]}
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis type="number" tick={{ fill: textColor }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: textColor }}
                      width={80} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                        borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                        color: textColor,
                      }}
                    />
                    <Bar dataKey="score" fill="#6271f1" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="volume" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: "David M.", calls: 45 },
                      { name: "Maria R.", calls: 37 },
                      { name: "John D.", calls: 32 },
                      { name: "Emma L.", calls: 29 },
                      { name: "Alex T.", calls: 25 },
                      { name: "Sandra K.", calls: 22 },
                      { name: "Sarah J.", calls: 18 },
                    ]}
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis type="number" tick={{ fill: textColor }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: textColor }}
                      width={80} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                        borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                        color: textColor,
                      }}
                    />
                    <Bar dataKey="calls" fill="#4e4de4" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="duration" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: "Sandra K.", duration: 7.2 },
                      { name: "Emma L.", duration: 6.5 },
                      { name: "David M.", duration: 5.8 },
                      { name: "Maria R.", duration: 5.3 },
                      { name: "Sarah J.", duration: 4.9 },
                      { name: "Alex T.", duration: 4.5 },
                      { name: "John D.", duration: 4.1 },
                    ]}
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      type="number" 
                      tick={{ fill: textColor }}
                      tickFormatter={(value) => `${value} min`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: textColor }}
                      width={80} 
                    />
                    <Tooltip
                      formatter={(value) => [`${value} min`, "Avg Duration"]}
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                        borderColor: theme === "dark" ? "#333" : "#e2e8f0",
                        color: textColor,
                      }}
                    />
                    <Bar dataKey="duration" fill="#4039c4" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
