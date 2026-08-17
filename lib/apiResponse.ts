import { NextResponse } from 'next/server';

export function successResponse(data: unknown, message = 'Success', statusCode = 200) {
  return NextResponse.json(
    { success: true, message, data },
    { status: statusCode }
  );
}

export function errorResponse(message = 'Error', statusCode = 500, errors?: unknown) {
  return NextResponse.json(
    { success: false, message, errors },
    { status: statusCode }
  );
}
