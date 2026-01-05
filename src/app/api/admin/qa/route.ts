import { handleGetQATurn } from '@/modules/qa/api'

export async function GET(req: Request) {
    return handleGetQATurn(req)
}
