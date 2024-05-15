import Database from "@/utils/database";
import { NextResponse } from "next/server";

type Params = {
    projectID: string
}

export async function GET(_: Request, context: {params: Params}) {
    const db = new Database()
    try {
        const completeProject = await db.getCompleteProject(context.params.projectID)
        if (!completeProject) {
            return new NextResponse(JSON.stringify({error: "project id doesn't exist"}), {status: 404})
        }
        
        return NextResponse.json(completeProject)
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
    } finally {
        await db.disconnect()
    }
}
