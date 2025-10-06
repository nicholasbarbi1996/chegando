import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de usuários (seguindo estrutura da Agenda Edu)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  agendaEduUserId: text("agenda_edu_user_id").unique().notNull(), // user_id da Agenda Edu
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  userType: text("user_type").notNull(), // "responsible", "teacher", "admin"
  schoolId: text("school_id").notNull(), // school_id da Agenda Edu
});

// Tabela de alunos (seguindo estrutura da Agenda Edu)
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  agendaEduStudentId: text("agenda_edu_student_id").unique().notNull(), // student_id da Agenda Edu
  name: text("name").notNull(),
  classroomId: text("classroom_id").notNull(), // classroom_id da Agenda Edu
  schoolId: text("school_id").notNull(), // school_id da Agenda Edu
});

// Relacionamento entre responsáveis e alunos (seguindo estrutura da Agenda Edu)
export const studentResponsibles = pgTable("student_responsibles", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  userId: integer("user_id").notNull().references(() => users.id),
  agendaEduStudentId: text("agenda_edu_student_id").notNull(), // Para sincronização
  agendaEduUserId: text("agenda_edu_user_id").notNull(), // Para sincronização
});

// Pessoas autorizadas (não fazem login, criadas pelos responsáveis)
export const authorizations = pgTable("authorizations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  userId: integer("user_id").notNull().references(() => users.id), // Responsável que criou a autorização
  authorizedName: text("authorized_name").notNull(),
  authorizedCpf: text("authorized_cpf").notNull(),
  agendaEduStudentId: text("agenda_edu_student_id").notNull(), // Para sincronização
  agendaEduUserId: text("agenda_edu_user_id").notNull(), // Para sincronização
  schoolId: text("school_id").notNull(), // school_id da Agenda Edu
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const pickupRequests = pgTable("pickup_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  userId: integer("user_id").notNull().references(() => users.id), // Responsável que fez a solicitação
  gate: text("gate").notNull(),
  status: text("status").notNull().default("waiting"), // waiting, ready, completed, cancelled
  pickupPersonName: text("pickup_person_name").notNull(), // Nome de quem vai buscar
  pickupPersonCpf: text("pickup_person_cpf"), // CPF de quem vai buscar (opcional)
  pickupPersonType: text("pickup_person_type").notNull().default("responsible"), // "responsible" ou "authorized"
  authorizationId: integer("authorization_id").references(() => authorizations.id), // Se for pessoa autorizada
  agendaEduStudentId: text("agenda_edu_student_id").notNull(), // Para sincronização
  agendaEduUserId: text("agenda_edu_user_id").notNull(), // Para sincronização
  schoolId: text("school_id").notNull(), // school_id da Agenda Edu
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const gates = pgTable("gates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  schoolId: text("school_id").notNull(), // school_id da Agenda Edu
});

// Tabela de turmas/salas (seguindo estrutura da Agenda Edu)
export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  agendaEduClassroomId: text("agenda_edu_classroom_id").unique().notNull(), // classroom_id da Agenda Edu
  name: text("name").notNull(),
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  gateId: integer("gate_id").references(() => gates.id).notNull(),
  schoolId: text("school_id").notNull(), // school_id da Agenda Edu
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertStudentResponsibleSchema = createInsertSchema(studentResponsibles).omit({
  id: true,
});

export const insertAuthorizationSchema = createInsertSchema(authorizations).omit({
  id: true,
  createdAt: true,
});

export const insertPickupRequestSchema = createInsertSchema(pickupRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertGateSchema = createInsertSchema(gates).omit({
  id: true,
});

export const insertClassroomSchema = createInsertSchema(classrooms).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type StudentResponsible = typeof studentResponsibles.$inferSelect;
export type InsertStudentResponsible = z.infer<typeof insertStudentResponsibleSchema>;

export type Authorization = typeof authorizations.$inferSelect;
export type InsertAuthorization = z.infer<typeof insertAuthorizationSchema>;

export type PickupRequest = typeof pickupRequests.$inferSelect;
export type InsertPickupRequest = z.infer<typeof insertPickupRequestSchema>;

export type Gate = typeof gates.$inferSelect;
export type InsertGate = z.infer<typeof insertGateSchema>;

export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;

// Extended types for API responses (seguindo estrutura da Agenda Edu)
export type StudentWithUser = Student & { 
  userName: string;
  userEmail: string;
};
export type StudentWithClassroom = Student & { 
  classroomName: string; 
  gateName: string;
  startTime: string;
  endTime: string;
};
export type ClassroomWithGate = Classroom & {
  gateName: string;
};
export type PickupRequestWithStudent = PickupRequest & { 
  studentName: string; 
  classroomName: string;
  userName: string;
  timeElapsed: string;
};

// Tipos para integração com Agenda Edu
export type AgendaEduUser = {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  user_type: "responsible" | "teacher" | "admin";
  school_id: string;
};

export type AgendaEduStudent = {
  student_id: string;
  name: string;
  classroom_id: string;
  school_id: string;
};

export type AgendaEduClassroom = {
  classroom_id: string;
  name: string;
  school_id: string;
};