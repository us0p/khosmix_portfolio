import Database from "@/utils/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url)
    const db = new Database()
    try {
        const category = url.searchParams.get("category")
        if (category) {
           const projects = await db.getProjectsByCategory(category) 
           return NextResponse.json(projects)
        }
        const projects = await db.getAllProjects()
        return NextResponse.json(projects)
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
    } finally {
        await db.disconnect()
    }
}
