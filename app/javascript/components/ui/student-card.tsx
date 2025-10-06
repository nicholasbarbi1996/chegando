import { Card, CardContent } from "@/components/ui/card";
import { Check, User, Clock } from "lucide-react";
import type { Student } from "@shared/schema";

interface StudentCardProps {
  student: Student;
  isSelected: boolean;
  onToggle: () => void;
  hasActiveRequest?: boolean;
  requestStatus?: string;
}

export default function StudentCard({ student, isSelected, onToggle, hasActiveRequest, requestStatus }: StudentCardProps) {
  const isDisabled = hasActiveRequest && (requestStatus === 'waiting' || requestStatus === 'ready');
  
  const getStatusInfo = () => {
    if (!hasActiveRequest) return null;
    
    switch (requestStatus) {
      case 'waiting':
        return { label: 'Aguardando', color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'ready':
        return { label: 'Pronto', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card 
      className={`transition-all duration-200 ${
        isDisabled 
          ? 'opacity-60 cursor-not-allowed bg-gray-50' 
          : `cursor-pointer hover:shadow-md ${
              isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-lg'
            }`
      }`}
      onClick={isDisabled ? undefined : onToggle}
    >
      <CardContent className="p-4 min-h-[80px]">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-[#d4d4d4]">
            <User className="h-7 w-7 text-gray-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg text-gray-900">{student.name}</h3>
              {statusInfo && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                  <Clock className={`h-3 w-3 ${statusInfo.color}`} />
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              )}
            </div>

            {hasActiveRequest && (
              <p className="text-xs text-purple-600 mt-1">Já notificado para a escola</p>
            )}
          </div>
          {!isDisabled && (
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelected 
                ? 'border-purple-500 bg-purple-500' 
                : 'border-gray-300'
            }`}>
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
