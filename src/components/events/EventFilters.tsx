import React from 'react';
import { Search, Filter, X } from 'lucide-react';
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
import { EventFilters as Filters, EventCategory } from '@/types/event';

interface EventFiltersProps {
  filters: Filters;
  categories: EventCategory[];
  onFiltersChange: (filters: Filters) => void;
  onClear: () => void;
}

const locationTypes = [
  { value: 'onsite', label: 'ที่งาน' },
  { value: 'online', label: 'ออนไลน์' },
  { value: 'hybrid', label: 'ไฮบริด' },
];

const dateRanges = [
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: 'สัปดาห์นี้' },
  { value: 'month', label: 'เดือนนี้' },
  { value: 'quarter', label: 'ไตรมาสนี้' },
  { value: 'year', label: 'ปีนี้' },
];

const priceRanges = [
  { value: 'free', label: 'ฟรี', min: 0, max: 0 },
  { value: 'under1000', label: 'ต่ำกว่า 1,000 บาท', min: 1, max: 1000 },
  { value: '1000-3000', label: '1,000 - 3,000 บาท', min: 1000, max: 3000 },
  { value: '3000-6000', label: '3,000 - 6,000 บาท', min: 3000, max: 6000 },
  { value: 'over6000', label: 'มากกว่า 6,000 บาท', min: 6000, max: undefined },
];

const sortOptions = [
  { value: 'newest', label: 'ล่าสุด' },
  { value: 'oldest', label: 'เก่าสุด' },
  { value: 'date-asc', label: 'วันที่เริ่มงาน (เร็วสุด)' },
  { value: 'date-desc', label: 'วันที่เริ่มงาน (ช้าสุด)' },
  { value: 'price-asc', label: 'ราคา (ต่ำ-สูง)' },
  { value: 'price-desc', label: 'ราคา (สูง-ต่ำ)' },
];

export default function EventFilters({
  filters,
  categories,
  onFiltersChange,
  onClear,
}: EventFiltersProps) {
  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.categories?.length ||
    filters.location ||
    filters.dateRange ||
    filters.priceRange ||
    filters.sortBy
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.location) count++;
    if (filters.dateRange) count++;
    if (filters.priceRange) count++;
    if (filters.sortBy) count++;
    return count;
  };

  const handleCategoryChange = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    updateFilters({ 
      categories: newCategories.length > 0 ? newCategories : undefined 
    });
  };

  const handlePriceRangeChange = (value: string) => {
    if (value === 'all') {
      updateFilters({ priceRange: undefined });
      return;
    }
    
    const range = priceRanges.find(r => r.value === value);
    if (range) {
      updateFilters({ 
        priceRange: { min: range.min, max: range.max } 
      });
    }
  };

  const getCurrentPriceRangeValue = () => {
    if (!filters.priceRange) return 'all';
    
    const currentRange = priceRanges.find(range => 
      range.min === filters.priceRange?.min && 
      range.max === filters.priceRange?.max
    );
    
    return currentRange?.value || 'all';
  };

  const removeCategoryFilter = (categoryId: string) => {
    const newCategories = (filters.categories || []).filter(id => id !== categoryId);
    updateFilters({ 
      categories: newCategories.length > 0 ? newCategories : undefined 
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card border rounded-lg">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาอีเว้นท์..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="min-w-[200px]">
          <Select
            value={filters.categories?.[0] || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateFilters({ categories: undefined });
              } else {
                updateFilters({ categories: [value] });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Type */}
        <div className="min-w-[160px]">
          <Select
            value={filters.location || 'all'}
            onValueChange={(value) =>
              updateFilters({ location: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="รูปแบบ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกรูปแบบ</SelectItem>
              {locationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="min-w-[160px]">
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={(value) =>
              updateFilters({ dateRange: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="ช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกช่วงเวลา</SelectItem>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="min-w-[180px]">
          <Select
            value={getCurrentPriceRangeValue()}
            onValueChange={handlePriceRangeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="ช่วงราคา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกช่วงราคา</SelectItem>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="min-w-[180px]">
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) =>
              updateFilters({ sortBy: value === 'newest' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="เรียงตาม" />
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

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClear} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ค้นหา: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilters({ search: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.categories?.map((categoryId) => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                {category.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeCategoryFilter(categoryId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}

          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {locationTypes.find(t => t.value === filters.location)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilters({ location: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.dateRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {dateRanges.find(d => d.value === filters.dateRange)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilters({ dateRange: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.priceRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {priceRanges.find(r => 
                r.min === filters.priceRange?.min && 
                r.max === filters.priceRange?.max
              )?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilters({ priceRange: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.sortBy && filters.sortBy !== 'newest' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              เรียงตาม: {sortOptions.find(s => s.value === filters.sortBy)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilters({ sortBy: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}