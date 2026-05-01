import { protectedApi } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type { CreateCompanyData, CompanyData } from '@/types/company'
import type { ApiResponse } from '@/types/common'

export const createCompany = async (data: CreateCompanyData): Promise<ApiResponse<CompanyData>> => {
  try {
    const response = await protectedApi.post<ApiResponse<CompanyData>>('/companies', data)
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

export const getCompanies = async (): Promise<ApiResponse<CompanyData[]>> => {
  try {
    const response = await protectedApi.get<ApiResponse<CompanyData[]>>('/companies')
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

export const getCompany = async (id: string): Promise<ApiResponse<CompanyData>> => {
  try {
    const response = await protectedApi.get<ApiResponse<CompanyData>>(`/companies/${id}`)
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

export const updateCompany = async (id: string, data: Partial<CreateCompanyData>): Promise<ApiResponse<CompanyData>> => {
  try {
    const response = await protectedApi.put<ApiResponse<CompanyData>>(`/companies/${id}`, data)
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

export const deleteCompany = async (id: string): Promise<void> => {
  try {
    await protectedApi.delete(`/companies/${id}`)
  } catch (error) {
    throw error as ApiError
  }
}
