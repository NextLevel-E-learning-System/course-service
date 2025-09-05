import { getEmployeeDashboardData, getInstructorDashboardData } from '../repositories/dashboardRepository.js';
export async function getEmployeeDashboard(userId:string){ return getEmployeeDashboardData(userId); }
export async function getInstructorDashboard(userId:string){ return getInstructorDashboardData(userId); }
