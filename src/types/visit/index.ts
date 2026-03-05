import type { Department } from "@/types/department"
export interface Visit {
    _id: string;
    date: Date;
    departmentId: string | Department;
    maxPatient: number;
    hospitalName: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;

}

export interface CreateVisit {
    date: Date;
    departmentId: string;
    maxPatient: number;
    hospitalName: string;
}

