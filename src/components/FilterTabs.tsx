
type Filter = 'all' | 'completed' | 'active';

interface FilterTabsProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export const FilterTabs = ({ filter, onFilterChange }: FilterTabsProps) => {
  return (
    <div className="flex justify-center gap-8 text-sm mb-6">
      <button
        onClick={() => onFilterChange('all')}
        aria-pressed={filter === 'all'}
        className={`pb-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          filter === 'all' 
            ? 'text-yellow-600 border-b-2 border-yellow-400' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        aria-pressed={filter === 'completed'}
        className={`pb-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          filter === 'completed' 
            ? 'text-yellow-600 border-b-2 border-yellow-400' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        Completed
      </button>
      <button
        onClick={() => onFilterChange('active')}
        aria-pressed={filter === 'active'}
        className={`pb-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          filter === 'active' 
            ? 'text-yellow-600 border-b-2 border-yellow-400' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        Active
      </button>
    </div>
  );
};
