import Database from "@/utils/database";
import { NextResponse } from "next/server";

export async function GET() {
    const db = new Database()
    try {
        const categories = await db.getAllCategories()
        return NextResponse.json(categories)
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
    } finally {
        await db.disconnect()
    }
}
