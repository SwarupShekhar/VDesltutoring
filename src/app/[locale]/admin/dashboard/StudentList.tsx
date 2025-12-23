
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type Student = {
    id: string
    name: string
    email: string
    credits: number
}

export function StudentList({ students }: { students: Student[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Registry ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Credits</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {student.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={student.credits > 0 ? 'default' : 'destructive'}>
                                                {student.credits}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.credits > 0 ? 'Active' : 'No Credits'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No students registered.</p>
                )}
            </CardContent>
        </Card>
    )
}
