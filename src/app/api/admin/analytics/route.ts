import { handleGetAnalytics } from '@/modules/analytics/api'

export async function GET(req: Request) {
    return handleGetAnalytics(req)
}
