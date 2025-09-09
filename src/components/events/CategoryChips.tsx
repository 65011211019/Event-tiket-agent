import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { EventCategory } from '@/types/event';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/AppContext';

interface CategoryChipsProps {
  categories: EventCategory[];
  className?: string;
}

export default function CategoryChips({ categories, className }: CategoryChipsProps) {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
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
          {t('eventsComponents.categoryChips.all')}
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
