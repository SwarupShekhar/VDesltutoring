import { AdminControls } from '@/modules/admin'

export default function ControlPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Engine Control Center</h1>
                <p className="text-slate-500">Tune AI parameters in real-time. Changes affect all new sessions immediately.</p>
            </div>
            <AdminControls />
        </div>
    )
}
