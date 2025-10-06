import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "./loading-spinner";
import type { Student } from "@shared/schema";

interface AuthorizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; cpf: string; studentIds: number[] }) => void;
  isLoading?: boolean;
  editData?: { name: string; cpf: string };
  students: Student[];
}

export default function AuthorizationModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  editData,
  students
}: AuthorizationModalProps) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setCpf(editData.cpf);
    } else {
      setName("");
      setCpf("");
    }
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && cpf.trim() && selectedStudents.size > 0) {
      onSubmit({ 
        name: name.trim(), 
        cpf: cpf.trim(),
        studentIds: Array.from(selectedStudents)
      });
      setName("");
      setCpf("");
      setSelectedStudents(new Set());
    }
  };

  const toggleStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setCpf("");
    setSelectedStudents(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="slide-up">
        <DialogHeader>
          <DialogTitle>{editData ? 'Editar autorização' : 'Nova autorização'}</DialogTitle>
          <DialogDescription>
            {editData 
              ? 'Atualize os dados da pessoa autorizada a buscar o aluno.'
              : 'Adicione uma nova pessoa autorizada a buscar o aluno.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Selecionar alunos*</Label>
            <div className="space-y-2 mt-2 max-h-32 overflow-y-auto border rounded-lg p-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`student-${student.id}`} className="text-sm font-normal">
                    {student.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedStudents.size === 0 && (
              <p className="text-sm text-red-500 mt-1">Selecione pelo menos um aluno</p>
            )}
          </div>
          <div>
            <Label htmlFor="name">Nome da pessoa*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF da pessoa autorizada*</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !cpf.trim() || selectedStudents.size === 0}
              className="flex-1 bg-primary hover:bg-blue-700"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
