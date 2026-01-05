import { getRecentQATurns } from '@/modules/qa'
import { QASessionInspector } from '@/modules/qa'

export default async function GAPage() {
    const turns = await getRecentQATurns()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">QA Inspector</h1>
                <p className="text-slate-500">Inspect recent AI decisions, logic, and scoring.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
                <QASessionInspector turns={turns} />
            </div>
        </div>
    )
}
