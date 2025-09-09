import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  Save
} from 'lucide-react';
import { useLanguage } from '@/contexts/AppContext';
import { eventApi } from '@/lib/api';

export default function AdminTicketTypeForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'THB',
    isActive: true,
    maxPerOrder: 10,
    minPerOrder: 1,
    isLimited: false,
    maxQuantity: 100,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxPerOrder' || name === 'minPerOrder' || name === 'maxQuantity' 
        ? Number(value) 
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, this would call the API to create the ticket type
      console.log('Creating ticket type:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message and navigate back
      alert(t('adminTicketTypeForm.messages.createSuccess'));
      navigate('/admin/tickets');
    } catch (error) {
      console.error('Error creating ticket type:', error);
      alert(t('adminTicketTypeForm.messages.createError'));
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('adminTicketTypeForm.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('adminTicketTypeForm.title')}</h1>
              <p className="text-muted-foreground">
                {t('adminTicketTypeForm.subtitle')}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/tickets">
              {t('adminTicketTypeForm.backToTickets')}
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('adminTicketTypeForm.sections.basicInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('adminTicketTypeForm.fields.ticketTypeName')} *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('adminTicketTypeForm.placeholders.ticketTypeExample')}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">{t('adminTicketTypeForm.fields.description')}</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t('adminTicketTypeForm.placeholders.descriptionExample')}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t('adminTicketTypeForm.fields.price')} *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t('adminTicketTypeForm.fields.currency')}</Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => handleSelectChange('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THB">{t('adminTicketTypeForm.currencies.THB')}</SelectItem>
                          <SelectItem value="USD">{t('adminTicketTypeForm.currencies.USD')}</SelectItem>
                          <SelectItem value="EUR">{t('adminTicketTypeForm.currencies.EUR')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('adminTicketTypeForm.sections.orderSettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minPerOrder">{t('adminTicketTypeForm.fields.minPerOrder')}</Label>
                      <Input
                        id="minPerOrder"
                        name="minPerOrder"
                        type="number"
                        min="1"
                        value={formData.minPerOrder}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxPerOrder">{t('adminTicketTypeForm.fields.maxPerOrder')}</Label>
                      <Input
                        id="maxPerOrder"
                        name="maxPerOrder"
                        type="number"
                        min="1"
                        value={formData.maxPerOrder}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isLimited"
                      checked={formData.isLimited}
                      onCheckedChange={(checked) => handleCheckboxChange('isLimited', !!checked)}
                    />
                    <Label htmlFor="isLimited">{t('adminTicketTypeForm.fields.isLimited')}</Label>
                  </div>
                  
                  {formData.isLimited && (
                    <div className="space-y-2">
                      <Label htmlFor="maxQuantity">{t('adminTicketTypeForm.fields.maxQuantity')}</Label>
                      <Input
                        id="maxQuantity"
                        name="maxQuantity"
                        type="number"
                        min="1"
                        value={formData.maxQuantity}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('adminTicketTypeForm.sections.status')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleCheckboxChange('isActive', !!checked)}
                    />
                    <Label htmlFor="isActive">{t('adminTicketTypeForm.fields.isActive')}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('adminTicketTypeForm.statusDescription')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('adminTicketTypeForm.sections.actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {t('adminTicketTypeForm.actions.saveTicketType')}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/admin/tickets')}
                  >
                    {t('adminTicketTypeForm.actions.cancel')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}