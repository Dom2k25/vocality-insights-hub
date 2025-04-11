
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Sample data
const recentCalls = [
  {
    id: "1",
    customer: "John Smith",
    duration: "4:32",
    timestamp: "Today, 10:30 AM",
    score: 92,
  },
  {
    id: "2",
    customer: "Maria Garcia",
    duration: "8:17",
    timestamp: "Today, 9:45 AM",
    score: 78,
  },
  {
    id: "3",
    customer: "Robert Chen",
    duration: "2:51",
    timestamp: "Yesterday, 4:30 PM",
    score: 85,
  },
  {
    id: "4",
    customer: "Sarah Johnson",
    duration: "5:22",
    timestamp: "Yesterday, 2:15 PM",
    score: 63,
  },
  {
    id: "5",
    customer: "David Williams",
    duration: "6:08",
    timestamp: "Yesterday, 11:20 AM",
    score: 89,
  },
];

interface RecentCallsProps {
  className?: string;
}

export function RecentCalls({ className }: RecentCallsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
        <CardDescription>Latest customer interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentCalls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">{call.customer}</TableCell>
                <TableCell>{call.duration}</TableCell>
                <TableCell>{call.timestamp}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    className={cn(
                      "text-xs",
                      call.score >= 90
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                        : call.score >= 75
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40"
                        : "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
                    )}
                  >
                    {call.score}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
