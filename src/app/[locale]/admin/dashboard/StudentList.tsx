'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BrainCircuit, Search, Download, Filter, ArrowUpDown, X } from 'lucide-react'

type Student = {
    id: string
    name: string
    email: string
    credits: number
    cefr_level?: string
    fluency_score?: number
}

export function StudentList({ students }: { students: Student[] }) {
    const { locale } = useParams()
    const [search, setSearch] = useState('')
    const [cefrFilter, setCefrFilter] = useState<string>('ALL')
    const [creditFilter, setCreditFilter] = useState<string>('ALL')
    const [sortBy, setSortBy] = useState<string>('name_asc')

    // Handle clearing all filters
    const clearFilters = () => {
        setSearch('')
        setCefrFilter('ALL')
        setCreditFilter('ALL')
        setSortBy('name_asc')
    }

    const hasActiveFilters = search !== '' || cefrFilter !== 'ALL' || creditFilter !== 'ALL' || sortBy !== 'name_asc'

    // Filter and Sort Students
    const filteredStudents = useMemo(() => {
        let result = [...students]

        // 1. Text Search Filter (name and email)
        if (search.trim()) {
            const query = search.toLowerCase()
            result = result.filter(s => 
                (s.name && s.name.toLowerCase().includes(query)) || 
                (s.email && s.email.toLowerCase().includes(query))
            )
        }

        // 2. CEFR level Filter
        if (cefrFilter !== 'ALL') {
            result = result.filter(s => s.cefr_level === cefrFilter)
        }

        // 3. Credit status Filter
        if (creditFilter === 'ACTIVE') {
            result = result.filter(s => s.credits > 0)
        } else if (creditFilter === 'EXHAUSTED') {
            result = result.filter(s => s.credits === 0)
        }

        // 4. Sorting logic
        result.sort((a, b) => {
            if (sortBy === 'name_asc') {
                return (a.name || '').localeCompare(b.name || '')
            }
            if (sortBy === 'name_desc') {
                return (b.name || '').localeCompare(a.name || '')
            }
            if (sortBy === 'credits_desc') {
                return b.credits - a.credits
            }
            if (sortBy === 'credits_asc') {
                return a.credits - b.credits
            }
            if (sortBy === 'fluency_desc') {
                return (b.fluency_score || 0) - (a.fluency_score || 0)
            }
            return 0
        })

        return result
    }, [students, search, cefrFilter, creditFilter, sortBy])

    // CSV Export function
    const handleExportCSV = () => {
        if (filteredStudents.length === 0) return

        const headers = ['Student ID', 'Full Name', 'Email Address', 'Credits Available', 'CEFR Level', 'Fluency Score']
        const rows = filteredStudents.map(s => [
            s.id,
            s.name || 'N/A',
            s.email || 'N/A',
            s.credits,
            s.cefr_level || 'Unassessed',
            s.fluency_score ? s.fluency_score.toFixed(1) : '0.0'
        ])

        const csvContent = 'data:text/csv;charset=utf-8,' 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `student_registry_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Custom coloring helper for CEFR levels
    const getCefrBadgeClass = (level?: string) => {
        if (!level) return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        
        const l = level.toUpperCase()
        if (l.startsWith('A')) {
            return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/50'
        }
        if (l.startsWith('B')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
        }
        if (l.startsWith('C')) {
            return 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50'
        }
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }

    return (
        <Card className="shadow-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            Student Registry
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">
                                {filteredStudents.length} of {students.length}
                            </span>
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Search, filter, and monitor student academic standing and credit balances.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button 
                                id="btn-clear-student-filters"
                                variant="ghost" 
                                size="sm" 
                                onClick={clearFilters}
                                className="h-9 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                        
                        <Button 
                            id="btn-export-students"
                            onClick={handleExportCSV}
                            disabled={filteredStudents.length === 0}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-1.5 h-9"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* SEARCH & FILTERS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            id="input-student-search"
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                        />
                    </div>

                    {/* CEFR level Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            id="select-cefr-filter"
                            value={cefrFilter}
                            onChange={(e) => setCefrFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">All CEFR Levels</option>
                            <option value="A1">A1 - Beginner</option>
                            <option value="A2">A2 - Elementary</option>
                            <option value="B1">B1 - Intermediate</option>
                            <option value="B2">B2 - Upper Intermediate</option>
                            <option value="C1">C1 - Advanced</option>
                            <option value="C2">C2 - Proficient</option>
                        </select>
                    </div>

                    {/* Credit Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            id="select-credits-filter"
                            value={creditFilter}
                            onChange={(e) => setCreditFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Credit Statuses</option>
                            <option value="ACTIVE">Active (Positive Balance)</option>
                            <option value="EXHAUSTED">Exhausted (0 Credits)</option>
                        </select>
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            id="select-students-sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="name_asc">Name (A to Z)</option>
                            <option value="name_desc">Name (Z to A)</option>
                            <option value="credits_desc">Credits (High to Low)</option>
                            <option value="credits_asc">Credits (Low to High)</option>
                            <option value="fluency_desc">Fluency (Highest first)</option>
                        </select>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Name</th>
                                    <th className="px-6 py-4 font-bold">Email</th>
                                    <th className="px-6 py-4 font-bold text-center">CEFR level</th>
                                    <th className="px-6 py-4 font-bold text-center">Fluency</th>
                                    <th className="px-6 py-4 font-bold text-center">Credits</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                        <td className="px-6 py-4.5 font-semibold text-slate-900 dark:text-white">
                                            {student.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4.5 text-center">
                                            <Badge className={`px-2.5 py-0.5 border text-xs font-bold rounded-lg ${getCefrBadgeClass(student.cefr_level)}`}>
                                                {student.cefr_level || 'A1'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4.5 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {student.fluency_score ? student.fluency_score.toFixed(0) : '0'}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4.5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${student.credits > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'}`}>
                                                {student.credits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4.5">
                                            {student.credits > 0 ? (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                    Exhausted
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4.5 text-right">
                                            <Link
                                                id={`student-action-${student.id}`}
                                                href={`/${locale}/admin/students/${student.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs transition-colors"
                                            >
                                                <BrainCircuit className="w-3.5 h-3.5" />
                                                View Analysis
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No students match current filters.</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try resetting search query or filtering criteria.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
