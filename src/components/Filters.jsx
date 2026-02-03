import { useState } from 'react'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export function SelectFilter({ value, onChange, options, placeholder = 'Select...' }) {
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="input-field pr-10 appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
    </div>
  )
}

export function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => onStartChange(e.target.value || null)}
        className="input-field"
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={endDate || ''}
        onChange={(e) => onEndChange(e.target.value || null)}
        className="input-field"
      />
    </div>
  )
}

export function FilterPanel({ filters, onFilterChange, onClearAll }) {
  const [expanded, setExpanded] = useState(false)
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  
  return (
    <div className="glass-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-elite-400" />
          <span className="font-medium text-white">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-elite-400/20 text-elite-400 text-xs rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-gray-400 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add your filter fields here based on the filters prop */}
          </div>
          
          {activeFilterCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClearAll}
                className="text-sm text-gray-400 hover:text-white"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function QuickFilters({ options, activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === option.value
              ? 'bg-elite-400 text-cargo-dark'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-2 text-xs opacity-70">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}

