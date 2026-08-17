import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const updates = [
      { pattern: 'Goa', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600' },
      { pattern: 'Kashmir', url: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600' },
      { pattern: 'Rajasthan', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600' },
      { pattern: 'Kerala', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600' },
      { pattern: 'Himachal', url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600' },
      { pattern: 'Manali', url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600' },
      { pattern: 'Ladakh', url: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600' },
      { pattern: 'Andaman', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600' },
      { pattern: 'Uttarakhand', url: 'https://images.unsplash.com/photo-1580748218671-d1c0b4c63e4c?w=600' },
      { pattern: 'Shimla', url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600' },
    ];

    const results = [];
    for (const { pattern, url } of updates) {
      const result = await prisma.package.updateMany({
        where: { name: { contains: pattern, mode: 'insensitive' } },
        data: { imageUrl: url }
      });
      results.push({ pattern, updated: result.count });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Images updated successfully!',
      results 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
