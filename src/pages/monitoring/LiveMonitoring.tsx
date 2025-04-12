import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Mic, Headphones, Volume2, VolumeX } from 'lucide-react';

const LiveMonitoring = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [activeCalls, setActiveCalls] = useState([
    {
      id: '1',
      agent: 'John Doe',
      customer: 'Alice Smith',
      duration: '12:34',
      status: 'in-progress',
    },
    {
      id: '2',
      agent: 'Jane Wilson',
      customer: 'Bob Johnson',
      duration: '05:12',
      status: 'in-progress',
    },
  ]);

  // Mock function to simulate real-time updates
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setActiveCalls((prevCalls) =>
          prevCalls.map((call) => ({
            ...call,
            duration: incrementDuration(call.duration),
          }))
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isListening]);

  const incrementDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(':').map(Number);
    let newSeconds = seconds + 1;
    let newMinutes = minutes;

    if (newSeconds >= 60) {
      newSeconds = 0;
      newMinutes += 1;
    }

    return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
  };

  const handleJoinCall = (callId: string) => {
    setIsListening(true);
    // Here you would implement the actual call joining logic
  };

  const handleLeaveCall = () => {
    setIsListening(false);
    // Here you would implement the actual call leaving logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Live Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={isListening ? 'destructive' : 'default'}
            onClick={isListening ? handleLeaveCall : () => handleJoinCall('1')}
          >
            {isListening ? (
              <>
                <Headphones className="mr-2 h-4 w-4" />
                Leave Call
              </>
            ) : (
              <>
                <Headphones className="mr-2 h-4 w-4" />
                Join Call
              </>
            )}
          </Button>
          {isListening && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {call.agent} → {call.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {call.duration}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJoinCall(call.id)}
                  >
                    Listen
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Volume</label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Current Call</h3>
                {isListening ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Listening to: {activeCalls[0].agent} → {activeCalls[0].customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {activeCalls[0].duration}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not currently monitoring any calls
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveMonitoring; 