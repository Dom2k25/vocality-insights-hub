import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, BarChart, Users, Mic } from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');

  const kpis = [
    {
      title: 'Total Calls',
      value: '1,234',
      change: '+12%',
      icon: Mic,
    },
    {
      title: 'Average Duration',
      value: '12:34',
      change: '+5%',
      icon: Calendar,
    },
    {
      title: 'Quality Score',
      value: '87%',
      change: '+3%',
      icon: BarChart,
    },
    {
      title: 'Active Agents',
      value: '24',
      change: '+2',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeRange('day')}
          >
            Day
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{kpi.change}</span> from last {timeRange}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Call Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add chart component here */}
            <div className="h-[300px] flex items-center justify-center">
              Call Volume Chart
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Customer Service', 'Technical Support', 'Billing', 'Account'].map((keyword) => (
                <div key={keyword} className="flex items-center justify-between">
                  <span>{keyword}</span>
                  <span className="text-sm text-muted-foreground">123 mentions</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 