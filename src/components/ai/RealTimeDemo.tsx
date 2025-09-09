import React, { useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Clock, CheckCircle } from 'lucide-react';

const RealTimeDemo: React.FC = () => {
  const { forceRealTimeUpdate, isLoading, context } = useAI();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleRealTimeUpdate = async () => {
    try {
      await forceRealTimeUpdate();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Real-time update failed:', error);
    }
  };

  const memory = context.memory;
  const hasData = memory && (
    (memory.events && memory.events.length > 0) ||
    (memory.categories && memory.categories.length > 0) ||
    (memory.tickets && memory.tickets.length > 0)
  );

  const getDataAge = (dataType: 'events' | 'categories' | 'tickets') => {
    const lastFetch = memory?.lastFetchTime?.[dataType];
    if (!lastFetch) return 'ไม่มีข้อมูล';
    
    const ageMs = Date.now() - lastFetch.getTime();
    const ageMinutes = Math.floor(ageMs / 60000);
    const ageSeconds = Math.floor((ageMs % 60000) / 1000);
    
    if (ageMinutes > 0) {
      return `${ageMinutes} นาที ${ageSeconds} วินาที`;
    }
    return `${ageSeconds} วินาที`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Real-time Data Status
        </CardTitle>
        <CardDescription>
          ตรวจสอบและอัปเดตข้อมูลแบบ real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">สถานะข้อมูล:</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">Events</div>
              <Badge variant={memory?.events?.length > 0 ? "default" : "secondary"}>
                {memory?.events?.length || 0}
              </Badge>
              <div className="text-muted-foreground mt-1">
                {getDataAge('events')}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Categories</div>
              <Badge variant={memory?.categories?.length > 0 ? "default" : "secondary"}>
                {memory?.categories?.length || 0}
              </Badge>
              <div className="text-muted-foreground mt-1">
                {getDataAge('categories')}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Tickets</div>
              <Badge variant={memory?.tickets?.length > 0 ? "default" : "secondary"}>
                {memory?.tickets?.length || 0}
              </Badge>
              <div className="text-muted-foreground mt-1">
                {getDataAge('tickets')}
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString('th-TH')}
          </div>
        )}

        {/* Update Button */}
        <Button 
          onClick={handleRealTimeUpdate} 
          disabled={isLoading}
          className="w-full"
          variant={hasData ? "outline" : "default"}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              กำลังอัปเดต...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              อัปเดตข้อมูล Real-time
            </>
          )}
        </Button>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 ลองถาม AI:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>"ข้อมูลล่าสุด"</li>
            <li>"อัปเดตข้อมูล"</li>
            <li>"รีเฟรช"</li>
            <li>"ข้อมูลปัจจุบัน"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeDemo;