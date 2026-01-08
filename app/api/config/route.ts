import { NextResponse } from 'next/server';
import artistConfig from '@/config/artist.config.json';

export async function GET() {
    return NextResponse.json(artistConfig);
}


export const runtime = 'edge';