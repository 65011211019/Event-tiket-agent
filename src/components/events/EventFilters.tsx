import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventFilters as Filters, EventCategory } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';

interface EventFiltersProps {
  filters: Filters;
  categories: EventCategory[];
  onFiltersChange: (filters: Filters) => void;
  onClear: () => void;
}

const priceRanges = [
  { label: 'ฟรี', min: 0, max: 0 },
  { label: '1 - 1,000 บาท', min: 1, max: 1000 },
  { label: '1,001 - 3,000 บาท', min: 1001, max: 3000 },
  { label: '3,001 - 6,000 บาท', min: 3001, max: 6000 },
  { label: '6,001 - 15,000 บาท', min: 6001, max: 15000 },
  { label: 'มากกว่า 15,000 บาท', min: 15001, max: undefined },
];

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

const sortOptions = [
  { value: 'date_asc', label: 'วันที่ (เร็วสุด)' },
  { value: 'date_desc', label: 'วันที่ (ล่าสุด)' },
  { value: 'price_asc', label: 'ราคา (ต่ำสุด)' },
  { value: 'price_desc', label: 'ราคา (สูงสุด)' },
  { value: 'popular', label: 'ความนิยม' },
];

export default function EventFilters({
  filters,
  categories,
  onFiltersChange,
  onClear,
}: EventFiltersProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    updateFilters({ categories: newCategories });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.categories?.length ||
    filters.location ||
    filters.dateRange ||
    filters.priceRange
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.location) count++;
    if (filters.dateRange) count++;
    if (filters.priceRange) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Header with toggle and sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('general.filter')}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4 mr-1" />
              {t('general.clear')}
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Label htmlFor="sort" className="text-sm font-medium">
            {t('general.sort')}:
          </Label>
          <Select
            value={`${filters.sortBy || 'date'}_${filters.sortOrder || 'asc'}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('_');
              updateFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
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
      </div>

      {/* Active filters display */}
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
                  onClick={() => toggleCategory(categoryId)}
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
        </div>
      )}

      {/* Collapsible filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 border rounded-lg bg-card">
            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">หมวดหมู่</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={filters.categories?.includes(category.id) || false}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">รูปแบบ</Label>
              <Select
                value={filters.location || 'all'}
                onValueChange={(value) =>
                  updateFilters({ location: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกรูปแบบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {locationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">ช่วงเวลา</Label>
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={(value) =>
                  updateFilters({ dateRange: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">ช่วงราคา</Label>
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`price-${index}`}
                      checked={
                        filters.priceRange?.min === range.min &&
                        filters.priceRange?.max === range.max
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({ priceRange: { min: range.min, max: range.max } });
                        } else {
                          updateFilters({ priceRange: undefined });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`price-${index}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}