
type Filter = 'all' | 'completed' | 'active';

interface FilterTabsProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export const FilterTabs = ({ filter, onFilterChange }: FilterTabsProps) => {
  return (
    <div className="flex justify-center gap-8 text-sm mb-6" role="tablist" aria-label="Task filters">
      <button
        role="tab"
        onClick={() => onFilterChange('active')}
        aria-selected={filter === 'active'}
        className={`pb-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          filter === 'active'
            ? 'text-yellow-600 border-b-2 border-yellow-400' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        Active
      </button>
      <button
        role="tab"
        onClick={() => onFilterChange('all')}
        aria-selected={filter === 'all'}
        className={`pb-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          filter === 'all'
            ? 'text-yellow-600 border-b-2 border-yellow-400' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        All
      </button>
      <button
        role="tab"
        onClick={() => onFilterChange('completed')}
        aria-selected={filter === 'completed'}
        className={`pb-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          filter === 'completed'
            ? 'text-yellow-600 border-b-2 border-yellow-400' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        Completed
      </button>
    </div>
  );
};
