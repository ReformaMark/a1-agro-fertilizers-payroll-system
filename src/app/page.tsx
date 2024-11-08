import { AttendanceButtons } from '@/components/attendance-btn';
import { TimeDisplay } from '@/components/time-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function AttendanceCard() {
 
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-5xl font-bold">
            <TimeDisplay />
          </CardTitle>
         
        </CardHeader>
        <CardContent className="space-y-4">
          <AttendanceButtons />
          
        </CardContent>
      </Card>
    </div>
  );
}