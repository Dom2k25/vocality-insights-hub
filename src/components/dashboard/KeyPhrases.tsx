
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample data
const keyPhrases = [
  { text: "customer satisfaction", count: 24, sentiment: "positive" },
  { text: "technical issue", count: 18, sentiment: "negative" },
  { text: "pricing question", count: 15, sentiment: "neutral" },
  { text: "thank you", count: 12, sentiment: "positive" },
  { text: "upgrade plan", count: 10, sentiment: "positive" },
  { text: "waiting time", count: 8, sentiment: "negative" },
  { text: "product features", count: 7, sentiment: "neutral" },
  { text: "excellent service", count: 6, sentiment: "positive" },
];

interface KeyPhrasesProps {
  className?: string;
}

export function KeyPhrases({ className }: KeyPhrasesProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Key Phrases</CardTitle>
        <CardDescription>Common topics in conversations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keyPhrases.map((phrase, index) => (
            <div
              key={index}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                phrase.sentiment === "positive"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : phrase.sentiment === "negative"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
              style={{ fontSize: `${Math.max(0.7, Math.min(1.3, 0.8 + phrase.count / 30))}rem` }}
            >
              {phrase.text}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
