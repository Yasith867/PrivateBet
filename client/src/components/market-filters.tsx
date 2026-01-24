import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
];

const sortOptions = [
  { value: 'volume', label: 'Highest Volume' },
  { value: 'newest', label: 'Newest First' },
  { value: 'ending_soon', label: 'Ending Soon' },
];

export function MarketFilters() {
  const { filters, setFilters } = useAppStore();

  const hasActiveFilters = filters.category !== 'all' || filters.status !== 'all' || filters.searchQuery;

  const clearFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      searchQuery: '',
      sortBy: 'volume',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="pl-10"
            data-testid="input-search-markets"
          />
        </div>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => setFilters({ sortBy: value })}
        >
          <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value: any) => setFilters({ category: value })}
        >
          <SelectTrigger className="w-auto h-8 text-sm" data-testid="select-category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value: any) => setFilters({ status: value })}
        >
          <SelectTrigger className="w-auto h-8 text-sm" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-muted-foreground"
            data-testid="button-clear-filters"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}

        {/* Active Filter Count */}
        {hasActiveFilters && (
          <Badge variant="secondary" className="h-6">
            {[
              filters.category !== 'all' ? 1 : 0,
              filters.status !== 'all' ? 1 : 0,
              filters.searchQuery ? 1 : 0,
            ].reduce((a, b) => a + b, 0)} active
          </Badge>
        )}
      </div>
    </div>
  );
}
