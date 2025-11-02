"use client"
import React from 'react'
import { Search, Filter, SortDesc, SortAsc } from 'lucide-react'

interface TaskFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  sortOrder: 'newest' | 'oldest'
  onSortOrderChange: (order: 'newest' | 'oldest') => void
}

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: TaskFiltersProps) {
  return (
    <div className="bg-[#131313] border border-zinc-800 rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by URL or question..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Sort Order */}
        <button
          onClick={() => onSortOrderChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-white transition-colors"
          title={sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        >
          {sortOrder === 'newest' ? (
            <>
              <SortDesc className="w-4 h-4" />
              <span className="hidden sm:inline">Newest</span>
            </>
          ) : (
            <>
              <SortAsc className="w-4 h-4" />
              <span className="hidden sm:inline">Oldest</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
