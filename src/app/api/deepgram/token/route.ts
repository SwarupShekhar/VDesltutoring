import { NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "No API key configured" }, { status: 500 });
        }

        const deepgram = createClient(apiKey);
        
        // Auto-discover the project ID to avoid needing another env variable
        const { result: projectsResult, error: projectsError } = await deepgram.manage.getProjects();
        if (projectsError || !projectsResult?.projects?.length) {
            throw new Error(`Failed to get Deepgram project: ${projectsError?.message || 'No projects found'}`);
        }
        
        const projectId = projectsResult.projects[0].project_id;
        
        // Create a temporary key that expires in 1 hour
        const { result: keyResult, error: keyError } = await deepgram.manage.createProjectKey(projectId, {
            comment: "Temp Client-Side Token",
            scopes: ["usage:write"],
            time_to_live_in_seconds: 3600
        });

        if (keyError) {
            throw new Error(`Failed to generate key: ${keyError.message}`);
        }

        return NextResponse.json({ token: keyResult.key });
    } catch (err) {
        console.error("Deepgram Token Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
