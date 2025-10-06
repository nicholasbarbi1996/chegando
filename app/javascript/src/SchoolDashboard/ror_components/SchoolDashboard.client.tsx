//import React, { useState } from 'react';
//import * as style from './SchoolDashboard.module.css';

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Clock, Users, Settings, Upload, Download, Calendar, FileText, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { apiRequest } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PickupRequestWithStudent, Gate, ClassroomWithGate } from "@shared/schema";


export default function SchoolDashboard() {
    const [selectedGateFilter, setSelectedGateFilter] = useState<string>("all");
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [timeFilter, setTimeFilter] = useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [importData, setImportData] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [newGateName, setNewGateName] = useState<string>("");
    const [newGateLocation, setNewGateLocation] = useState<string>("");
    const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Reset time filter when gate filter changes
    useEffect(() => {
        setTimeFilter("all");
    }, [selectedGateFilter]);

    // Fetch pickup requests for selected date
    const { data: pickupRequests = [], isLoading } = useQuery<PickupRequestWithStudent[]>({
        queryKey: ["/api/pickup-requests/by-date", selectedDate],
        queryFn: async () => {
            const response = await fetch(`/api/pickup-requests/by-date?date=${selectedDate}`);
            if (!response.ok) throw new Error('Failed to fetch pickup requests');
            return response.json();
        },
        refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    });

    // Fetch gates for filtering
    const { data: gates = [] } = useQuery<Gate[]>({
        queryKey: ["/api/gates"],
    });

    // Fetch classes for configuration
    const { data: classes = [] } = useQuery<ClassroomWithGate[]>({
        queryKey: ["/api/classrooms"],
    });

    // Mark as left mutation
    const markAsLeftMutation = useMutation({
        mutationFn: async (requestId: number) => {
            setLoadingRequestId(requestId);
            return apiRequest("PATCH", `/api/pickup-requests/${requestId}/complete`);
        },
        onSuccess: () => {
            toast({
                title: "Aluno marcado como saiu!",
                description: "Registro atualizado com sucesso.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/pickup-requests/active"] });
            queryClient.invalidateQueries({ queryKey: ["/api/pickup-requests/by-date"] });
            setLoadingRequestId(null);
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível marcar o aluno como saiu.",
                variant: "destructive",
            });
            setLoadingRequestId(null);
        }
    });

    // Mark as ready mutation
    const markAsReadyMutation = useMutation({
        mutationFn: async (requestId: number) => {
            setLoadingRequestId(requestId);
            return apiRequest("PATCH", `/api/pickup-requests/${requestId}/ready`);
        },
        onSuccess: () => {
            toast({
                title: "Aluno preparado!",
                description: "Aluno está pronto para retirada.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/pickup-requests/active"] });
            queryClient.invalidateQueries({ queryKey: ["/api/pickup-requests/by-date"] });
            setLoadingRequestId(null);
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível preparar o aluno.",
                variant: "destructive",
            });
            setLoadingRequestId(null);
        }
    });

    // Mark as waiting mutation (revert)
    const markAsWaitingMutation = useMutation({
        mutationFn: async (requestId: number) => {
            return apiRequest("PATCH", `/api/pickup-requests/${requestId}/waiting`);
        },
        onSuccess: () => {
            toast({
                title: "Status revertido!",
                description: "Aluno voltou para aguardando.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/pickup-requests/active"] });
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível reverter o status.",
                variant: "destructive",
            });
        }
    });

    // Import classes mutation
    const importClassesMutation = useMutation({
        mutationFn: async (classesData: any[]) => {
            return apiRequest("POST", "/api/classrooms/import", classesData);
        },
        onSuccess: (data: any) => {
            toast({
                title: "Configurações importadas!",
                description: "Horários e portarias configurados com sucesso para as turmas da Agenda Edu.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/classrooms"] });
            setImportData("");
            setSelectedFile(null);
            setShowConfigModal(false);
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível importar as turmas.",
                variant: "destructive",
            });
        }
    });

    // Create gate mutation
    const createGateMutation = useMutation({
        mutationFn: async (gateData: { name: string; location: string }) => {
            return apiRequest("POST", "/api/gates", gateData);
        },
        onSuccess: (data: any) => {
            toast({
                title: "Portaria criada!",
                description: `Portaria "${newGateName}" criada com sucesso.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/gates"] });
            setNewGateName("");
            setNewGateLocation("");
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível criar a portaria.",
                variant: "destructive",
            });
        }
    });

    // Helper function to check if selected date is from a previous day
    const isPreviousDay = (dateString: string) => {
        const today = new Date().toISOString().split('T')[0];
        return dateString < today;
    };

    // Check if current view is showing historical data (read-only)
    const isReadOnlyView = isPreviousDay(selectedDate);

    // Get unique time periods for the selected gate
    const getTimePeriodsForGate = (gateName: string) => {
        if (!classes || classes.length === 0 || gateName === "all") return [];

        const gateClasses = classes.filter(classItem => classItem.gateName === gateName);
        const timePeriods = gateClasses.map(classItem => ({
            value: `${classItem.startTime}-${classItem.endTime}`,
            label: `${classItem.startTime} - ${classItem.endTime}`,
            startTime: classItem.startTime,
            endTime: classItem.endTime
        }));

        // Remove duplicates
        const uniquePeriods = timePeriods.filter((period, index, self) =>
            index === self.findIndex(p => p.value === period.value)
        );

        return uniquePeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    // Check if a request matches the selected time filter
    const matchesTimeFilter = (request: any) => {
        if (timeFilter === "all") return true;
        if (!request.gate || !classes) return true;

        // Find the class for this request
        const studentClass = classes.find(classItem =>
            classItem.gateName === request.gate &&
            request.studentClass.includes(classItem.name)
        );

        if (!studentClass) return true;

        const classTimePeriod = `${studentClass.startTime}-${studentClass.endTime}`;
        return timeFilter === classTimePeriod;
    };

    // Filter requests based on selected filters
    const filteredRequests = pickupRequests.filter(request => {
        const matchesGate = selectedGateFilter === "all" || request.gate === selectedGateFilter;
        const matchesClass = selectedClassFilter === "all" || request.classroomName.includes(selectedClassFilter);
        const matchesStatus = statusFilter === "all" || request.status === statusFilter;
        const matchesTime = matchesTimeFilter(request);

        return matchesGate && matchesClass && matchesStatus && matchesTime;
    });

    // Get unique classes for filter dropdown
    const uniqueClasses = Array.from(new Set(pickupRequests.map(r => r.classroomName)));

    // Get gate options with time periods
    const getGateOptionsWithTimes = () => {
        if (!classes || classes.length === 0) {
            // Fallback to just gate names if no classroom data is available
            return gates.map(gate => ({
                value: gate.name,
                label: gate.name
            }));
        }

        const gateTimeMap = new Map<string, Set<string>>();

        // Collect all time periods for each gate from classroom data
        classes.forEach(classItem => {
            const gateName = classItem.gateName;
            if (!gateTimeMap.has(gateName)) {
                gateTimeMap.set(gateName, new Set());
            }
            gateTimeMap.get(gateName)?.add(`${classItem.startTime}-${classItem.endTime}`);
        });

        const gateOptions: Array<{ value: string; label: string }> = [];

        // Create options for each gate-time combination
        gateTimeMap.forEach((timePeriods, gateName) => {
            const sortedTimes = Array.from(timePeriods).sort();
            if (sortedTimes.length === 1) {
                // Single time period for this gate
                gateOptions.push({
                    value: gateName,
                    label: `${gateName} ${sortedTimes[0]}`
                });
            } else {
                // Multiple time periods - show each one separately
                sortedTimes.forEach(timeRange => {
                    gateOptions.push({
                        value: gateName,
                        label: `${gateName} ${timeRange}`
                    });
                });
            }
        });

        return gateOptions.sort((a, b) => a.label.localeCompare(b.label));
    };

    // Handle CSV import for classroom configurations
    const handleImportClasses = () => {
        try {
            const lines = importData.trim().split('\n');

            // Detect separator (comma or semicolon)
            const firstDataLine = lines[1] || '';
            const separator = firstDataLine.includes(';') ? ';' : ',';

            const classroomConfigs = lines.slice(1).map(line => {
                const [agendaEduClassroomId, startTime, endTime, gateName] = line.split(separator).map(s => s.trim());

                if (!agendaEduClassroomId || !startTime || !endTime || !gateName) {
                    throw new Error(`Linha inválida: "${line}". Verifique se todas as colunas estão preenchidas.`);
                }

                const gate = gates.find(g => g.name === gateName);

                if (!gate) {
                    throw new Error(`Portaria "${gateName}" não encontrada. Portarias disponíveis: ${gates.map(g => g.name).join(', ')}`);
                }

                return {
                    agendaEduClassroomId,
                    name: `Turma ${agendaEduClassroomId}`, // Temporary name until synced with Agenda Edu
                    startTime,
                    endTime,
                    gateId: gate.id,
                    schoolId: 'school_001' // Default school ID
                };
            });

            importClassesMutation.mutate(classroomConfigs);
        } catch (error: any) {
            toast({
                title: "Erro na importação",
                description: error.message || "Formato de dados inválido",
                variant: "destructive",
            });
        }
    };

    // Download CSV template
    const downloadTemplate = () => {
        const csvContent = `ID Agenda Edu,Horário Início,Horário Fim,Portaria
agenda_class_001,07:00,11:30,Portaria Infantil
agenda_class_002,13:00,17:30,Portaria Principal
agenda_class_003,07:30,12:00,Portaria Infantil
agenda_class_004,08:00,12:30,Portaria Infantil
agenda_class_005,13:30,18:00,Portaria Principal
agenda_class_006,07:00,11:30,Portaria Nossa Senhora de Fátima`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        //const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        //link.setAttribute('href', url);
        //link.setAttribute('download', 'modelo_configuracao_horarios.csv');
       // link.style.visibility = 'hidden';
        //document.body.appendChild(link);
        //link.click();
        //document.body.removeChild(link);
    };



    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast({
                title: "Formato inválido",
                description: "Por favor, selecione um arquivo CSV.",
                variant: "destructive",
            });
            return;
        }

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setImportData(content);
            toast({
                title: "Arquivo carregado!",
                description: `Arquivo ${file.name} foi carregado com sucesso.`,
            });
        };
        reader.readAsText(file);
    };

    // Export pickup requests report
    const exportReport = async () => {
        if (!startDate || !endDate) {
            toast({
                title: "Selecione o período",
                description: "Por favor, selecione um período completo para gerar o relatório.",
                variant: "destructive",
            });
            return;
        }

        // Validate date range
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');

        if (end < start) {
            toast({
                title: "Período inválido",
                description: "A data final não pode ser anterior à data inicial.",
                variant: "destructive",
            });
            return;
        }

        // Check if range is too large (more than 1 year)
        const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
        if (end.getTime() - start.getTime() > maxRange) {
            toast({
                title: "Período muito extenso",
                description: "Por favor, selecione um período de até 1 ano.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`/api/pickup-requests/report?startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch report');
            }
            const reportData = await response.json() as PickupRequestWithStudent[];

            if (reportData.length === 0) {
                toast({
                    title: "Nenhum dado encontrado",
                    description: "Não há registros no período selecionado.",
                    variant: "destructive",
                });
                return;
            }

            // Generate CSV content
            const header = 'Data,Horário,Aluno,Turma,Responsável,Quem Buscou,CPF,Tipo,Status,Portaria,Horário Saída';
            const rows = reportData.map(request => {
                const createdDate = new Date(request.createdAt).toLocaleDateString('pt-BR');
                const createdTime = new Date(request.createdAt).toLocaleTimeString('pt-BR');
                const completedTime = request.completedAt ? new Date(request.completedAt).toLocaleTimeString('pt-BR') : '';
                const statusText = request.status === 'completed' ? 'Liberado' : request.status === 'ready' ? 'Pronto' : 'Aguardando';
                const typeText = request.pickupPersonType === 'parent' ? 'Responsável' : 'Pessoa Autorizada';

                return `${createdDate},${createdTime},${request.studentName},${request.classroomName},${request.userName},${request.pickupPersonName},${request.pickupPersonCpf},${typeText},${statusText},${request.gate},${completedTime}`;
            });

            const csvContent = [header, ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            //const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            //link.setAttribute('href', url);

            const startDateFormatted = new Date(startDate).toLocaleDateString('pt-BR').replace(/\//g, '-');
            const endDateFormatted = new Date(endDate).toLocaleDateString('pt-BR').replace(/\//g, '-');
            //link.setAttribute('download', `relatorio-alunos-${startDateFormatted}_${endDateFormatted}.csv`);

            //link.style.visibility = 'hidden';
            //document.body.appendChild(link);
           //link.click();
            //document.body.removeChild(link);

            toast({
                title: "Relatório exportado!",
                description: `${reportData.length} registros exportados para CSV.`,
            });

            setShowReportModal(false);
        } catch (error) {
            toast({
                title: "Erro ao gerar relatório",
                description: "Não foi possível gerar o relatório. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    // Set default dates (today and yesterday)
    const setDefaultDates = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(yesterday.toISOString().split('T')[0]);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'hsl(220, 13%, 97%)' }}>
            {/* Header */}
            <header className="app-header shadow-lg">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                        {/*<Link href="/">*/}
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 rounded-xl p-3">*/}
                                <ArrowLeft className="h-6 w-6" />*/}
                            </Button>
                        {/*</Link>*/}
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-bold text-gray-900">Portaria: Entrada e Saída</h1>
                            {isReadOnlyView && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Visualização Histórica
                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 rounded-xl p-3">
                                    <FileText className="h-6 w-6" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Relatório de Alunos Liberados</DialogTitle>
                                    <p className="text-sm text-gray-600">
                                        Selecione o período desejado para gerar o relatório de alunos liberados em formato CSV.
                                    </p>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Período do Relatório</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-white border border-gray-300 text-gray-700 h-12 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 justify-between"
                                                >
                          <span>
                            {startDate && endDate
                                ? `${new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} - ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
                                : 'Selecione o período'}
                          </span>
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="range"
                                                    selected={{
                                                        from: startDate ? new Date(startDate + 'T00:00:00') : undefined,
                                                        to: endDate ? new Date(endDate + 'T00:00:00') : undefined
                                                    }}
                                                    onSelect={(range) => {
                                                        if (range?.from) {
                                                            setStartDate(range.from.toISOString().split('T')[0]);
                                                        }
                                                        if (range?.to) {
                                                            setEndDate(range.to.toISOString().split('T')[0]);
                                                        } else if (range?.from && !range?.to) {
                                                            // If only start date is selected, clear end date
                                                            setEndDate('');
                                                        }
                                                    }}
                                                    disabled={(date) => date > new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const today = new Date();
                                                const yesterday = new Date(today);
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                setStartDate(yesterday.toISOString().split('T')[0]);
                                                setEndDate(today.toISOString().split('T')[0]);
                                            }}
                                            className="flex-1"
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Últimas 24h
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const today = new Date();
                                                const weekAgo = new Date(today);
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                setStartDate(weekAgo.toISOString().split('T')[0]);
                                                setEndDate(today.toISOString().split('T')[0]);
                                            }}
                                            className="flex-1"
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Última semana
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const today = new Date();
                                                const monthAgo = new Date(today);
                                                monthAgo.setDate(monthAgo.getDate() - 30);
                                                setStartDate(monthAgo.toISOString().split('T')[0]);
                                                setEndDate(today.toISOString().split('T')[0]);
                                            }}
                                            className="flex-1"
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Último mês
                                        </Button>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <Button variant="outline" onClick={() => setShowReportModal(false)}>
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={exportReport}
                                            disabled={!startDate || !endDate || new Date(endDate + 'T00:00:00') < new Date(startDate + 'T00:00:00')}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Exportar CSV
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 rounded-xl p-3">
                                    <Settings className="h-6 w-6" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Configurações e Parametrização</DialogTitle>
                                </DialogHeader>

                                <Tabs defaultValue="import" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="import">Configurar Horários</TabsTrigger>
                                        <TabsTrigger value="gates">Portarias</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="import" className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Configurar Horários e Portarias por Turma</h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Importe as configurações de horários e portarias para as turmas vindas da Agenda Edu.
                                                    <br/>
                                                    <span className="text-blue-600 font-medium">Formato: ID Agenda Edu, Horário Início, Horário Fim, Portaria</span>
                                                </p>



                                                {/* File Upload Section */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium mb-2">
                                                        Selecionar arquivo CSV da sua máquina:
                                                    </label>
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="file"
                                                            accept=".csv"
                                                            onChange={handleFileUpload}
                                                            className="hidden"
                                                            id="csv-upload"
                                                        />
                                                        <label
                                                            htmlFor="csv-upload"
                                                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Selecionar Arquivo CSV
                                                        </label>
                                                        {selectedFile && (
                                                            <span className="text-sm text-green-600 font-medium">
                                ✓ {selectedFile.name}
                              </span>
                                                        )}
                                                    </div>
                                                </div>



                                                <div className="flex justify-between items-center mt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={downloadTemplate}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Baixar Modelo CSV
                                                    </Button>

                                                    <Button
                                                        onClick={handleImportClasses}
                                                        disabled={!importData.trim() || importClassesMutation.isPending}
                                                    >
                                                        {importClassesMutation.isPending ? (
                                                            <LoadingSpinner className="w-4 h-4 mr-2" />
                                                        ) : (
                                                            <Upload className="w-4 h-4 mr-2" />
                                                        )}
                                                        Importar Configurações
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>



                                    <TabsContent value="gates" className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold">Gerenciar Portarias</h3>
                                            </div>

                                            {/* Create new gate form */}
                                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                                <h4 className="font-medium mb-3">Criar Nova Portaria</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="gate-name">Nome da Portaria</Label>
                                                        <Input
                                                            id="gate-name"
                                                            value={newGateName}
                                                            onChange={(e) => setNewGateName(e.target.value)}
                                                            placeholder="Ex: Portaria Principal"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="gate-location">Localização</Label>
                                                        <Input
                                                            id="gate-location"
                                                            value={newGateLocation}
                                                            onChange={(e) => setNewGateLocation(e.target.value)}
                                                            placeholder="Ex: Entrada principal"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end mt-4">
                                                    <Button
                                                        onClick={() => {
                                                            if (!newGateName.trim() || !newGateLocation.trim()) {
                                                                toast({
                                                                    title: "Campos obrigatórios",
                                                                    description: "Preencha o nome e localização da portaria.",
                                                                    variant: "destructive",
                                                                });
                                                                return;
                                                            }
                                                            createGateMutation.mutate({
                                                                name: newGateName.trim(),
                                                                location: newGateLocation.trim()
                                                            });
                                                        }}
                                                        disabled={createGateMutation.isPending}
                                                    >
                                                        {createGateMutation.isPending ? (
                                                            <LoadingSpinner className="w-4 h-4 mr-2" />
                                                        ) : (
                                                            <Upload className="w-4 h-4 mr-2" />
                                                        )}
                                                        Criar Portaria
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Existing gates list */}
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Portarias Cadastradas</h4>
                                                {gates.map((gate) => (
                                                    <Card key={gate.id}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-medium">{gate.name}</h4>
                                                                    <p className="text-sm text-gray-600">{gate.location}</p>
                                                                </div>
                                                                <div className="text-right">
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Ativa
                                  </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}

                                                {gates.length === 0 && (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                        <p>Nenhuma portaria cadastrada.</p>
                                                        <p className="text-sm">Use o formulário acima para criar a primeira portaria.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">JF</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 pb-4 flex items-center space-x-4">
                    <div className="flex-1">
                        <Select value={selectedGateFilter} onValueChange={setSelectedGateFilter}>
                            <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 h-12 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Todas as Portarias" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Portarias</SelectItem>
                                {getGateOptionsWithTimes().map((option, index) => (
                                    <SelectItem key={`${option.value}-${index}`} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                            <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 h-12 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Todas as Turmas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Turmas</SelectItem>
                                {uniqueClasses.map((className) => (
                                    <SelectItem key={className} value={className}>
                                        {className}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                            <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 h-12 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Todos os Horários" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Horários</SelectItem>
                                {getTimePeriodsForGate(selectedGateFilter).map((period) => (
                                    <SelectItem key={period.value} value={period.value}>
                                        {period.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full bg-white border border-gray-300 text-gray-700 h-12 rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 justify-between"
                                >
                  <span>
                    {selectedDate === new Date().toISOString().split('T')[0]
                        ? `Hoje (${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')})`
                        : new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date.toISOString().split('T')[0]);
                                        }
                                    }}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>


                </div>
            </header>
            {/* Summary Cards */}
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <Card
                        className={`summary-card ${statusFilter === 'ready' ? 'active' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === 'ready' ? 'all' : 'ready')}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium" style={{ color: 'hsl(220, 9%, 46%)' }}>Chegou</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {pickupRequests.filter(r => r.status === 'ready').length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`summary-card ${statusFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium" style={{ color: 'hsl(220, 9%, 46%)' }}>Liberados</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {pickupRequests.filter(r => r.status === 'completed').length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Student List */}
                <div className="space-y-2">
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    )}

                    {filteredRequests.length === 0 && !isLoading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg font-medium">Nenhum aluno aguardando retirada</p>
                            <p className="text-sm">Todas as solicitações foram processadas</p>
                        </div>
                    ) : (
                        filteredRequests.map((request) => {
                            const getStatusInfo = (status: string) => {
                                switch (status) {
                                    case 'ready':
                                        return {
                                            label: 'Chegou',
                                            badgeColor: 'bg-blue-100 text-blue-600',
                                            buttonText: 'Liberar',
                                            buttonColor: 'bg-blue-500 hover:bg-blue-600 text-white'
                                        };
                                    case 'completed':
                                        return {
                                            label: 'Liberado',
                                            badgeColor: 'bg-green-100 text-green-600',
                                            buttonText: `Saiu às ${new Date(request.completedAt || new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                                            buttonColor: 'bg-gray-100 text-gray-600 cursor-default',
                                            actionText: 'Voltar'
                                        };
                                    default:
                                        return {
                                            label: 'Chegou',
                                            badgeColor: 'bg-blue-100 text-blue-600',
                                            buttonText: 'Liberar',
                                            buttonColor: 'bg-blue-500 hover:bg-blue-600 text-white'
                                        };
                                }
                            };

                            const statusInfo = getStatusInfo(request.status);

                            return (
                                <Card key={request.id} className="bg-white border border-gray-200 rounded-lg mb-2">
                                    <CardContent className="p-3 py-2 pt-[11px] pb-[11px]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ededed] text-[#1c1f26]">
                          <span className="font-semibold text-xs text-[#808080]">
                            {request.studentName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                          </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="mb-0">
                                                        <p className="text-xs text-gray-500">
                                                            {request.pickupPersonType === 'parent'
                                                                ? `Responsável: ${request.userName}`
                                                                : `Responsável: ${request.pickupPersonName}`}
                                                        </p>
                                                        <h3 className="font-semibold text-gray-900 text-base">{request.studentName}</h3>
                                                        <p className="text-xs text-gray-600">{request.classroomName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 font-medium">
                          {request.status === 'completed'
                              ? `Saiu às ${new Date(request.completedAt || new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                              : request.timeElapsed}
                        </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeColor}`}>
                          {statusInfo.label}
                        </span>
                                                {isReadOnlyView ? (
                                                    // Read-only view for historical data
                                                    (<div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Somente Leitura
                            </span>
                                                    </div>)
                                                ) : (
                                                    // Interactive view for current day
                                                    (<>
                                                        {request.status === 'completed' ? (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                                                    onClick={() => markAsReadyMutation.mutate(request.id)}
                                                                    disabled={loadingRequestId === request.id}
                                                                >
                                                                    {loadingRequestId === request.id ? (
                                                                        <LoadingSpinner className="w-4 h-4 mr-2" />
                                                                    ) : null}
                                                                    Voltar
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {request.status === 'ready' && (
                                                                    <Button
                                                                        size="sm"
                                                                        className={`${statusInfo.buttonColor} rounded-lg px-6 py-2`}
                                                                        onClick={() => markAsLeftMutation.mutate(request.id)}
                                                                        disabled={loadingRequestId === request.id}
                                                                    >
                                                                        {loadingRequestId === request.id ? (
                                                                            <LoadingSpinner className="w-4 h-4 mr-2" />
                                                                        ) : null}
                                                                        {statusInfo.buttonText}
                                                                    </Button>
                                                                )}

                                                            </>
                                                        )}
                                                    </>)
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}