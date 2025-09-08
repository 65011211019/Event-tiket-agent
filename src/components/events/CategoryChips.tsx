import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { EventCategory } from '@/types/event';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: EventCategory[];
  className?: string;
}

export default function CategoryChips({ categories, className }: CategoryChipsProps) {
  const [searchParams] = useSearchParams();
  const selectedCategories = searchParams.get('categories')?.split(',') || [];

  const getCategoryClass = (categoryId: string) => {
    return `category-${categoryId}`;
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Link to="/events">
        <Badge 
          variant={selectedCategories.length === 0 ? 'default' : 'outline'}
          className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
        >
          ทั้งหมด
        </Badge>
      </Link>
      
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        
        return (
          <Link 
            key={category.id} 
            to={`/events?categories=${category.id}`}
          >
            <Badge
              className={cn(
                'hover:opacity-80 transition-all cursor-pointer',
                isSelected 
                  ? cn('text-white', getCategoryClass(category.id))
                  : 'border-muted-foreground/20 hover:border-primary text-muted-foreground hover:text-primary'
              )}
              variant={isSelected ? 'default' : 'outline'}
            >
              {category.name}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}