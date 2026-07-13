import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        // Path to your JSON file (relative to project root)
        const filePath = path.join(process.cwd(), 'map-course-data/example/student-academic-data.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error reading feature data:', error);
        return NextResponse.json(
            { error: 'Failed to load feature data' },
            { status: 500 }
        );
    }
}