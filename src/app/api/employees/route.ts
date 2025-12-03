import type { Employee, ErrorResponse } from '@/lib/api';
import { apiClient } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * GET /api/employees
 * 従業員情報を取得
 * - モックモード: mocks/employee.json から従業員情報を取得
 * - 本番モード: バックエンドAPI /v1/get_employee から従業員情報を取得
 *
 * クエリパラメータ:
 * - MIAMID: 従業員のMIAMID (必須)
 *
 * 例: GET /api/employees?MIAMID=testuser@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const miamid = searchParams.get('MIAMID');

    if (!miamid) {
      return NextResponse.json(
        { message: 'MIAMID query parameter is required' },
        { status: 400 }
      );
    }

    // モックモードの場合
    if (useMockApi) {
      const employeeJsonPath = join(
        process.cwd(),
        'src',
        'mocks',
        'employee.json'
      );
      const employeeData = JSON.parse(
        readFileSync(employeeJsonPath, 'utf-8')
      ) as Employee;
      return NextResponse.json(employeeData, { status: 200 });
    }

    // 本番モードの場合
    const response = await apiClient.get<Employee>('/v1/get_employee', {
      MIAMID: miamid,
    });

    return NextResponse.json(response as Employee, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error && typeof error === 'object' && 'error' in error) {
      return NextResponse.json(error as ErrorResponse, { status: 500 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
