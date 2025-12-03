/**
 * Employee Mock Data
 * 従業員情報のモックデータとユーティリティ関数
 */

import type { Employee } from '@/lib/api';
import employeeData from './employee.json';

/**
 * モック従業員データ
 */
export const mockEmployees: Employee[] = [employeeData.employee];

/**
 * MIAMIDで従業員を検索
 * @param miamid - 従業員のMIAMID
 * @returns 従業員情報 or undefined
 */
export function getEmployeeByMiamid(miamid: string): Employee | undefined {
  // 実際のアプリケーションでは、miamidでフィルタリングしますが、
  // 現在は単一の従業員データしかないため、常に最初の従業員を返します
  return mockEmployees[0];
}
