import { NextRequest, NextResponse } from 'next/server';
import { validateEmailServer } from '@/lib/email-validation';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { valid: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await validateEmailServer(email.toLowerCase());

    if (!result.isValid) {
      return NextResponse.json({
        valid: false,
        message: result.error,
      });
    }

    return NextResponse.json({
      valid: true,
      suggestion: result.suggestion,
      warning: result.warning,
    });
  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to validate email' },
      { status: 500 }
    );
  }
}
