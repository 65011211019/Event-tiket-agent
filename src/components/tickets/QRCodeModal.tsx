import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EventTicket } from '@/types/event';
import { QrCode, Download, X } from 'lucide-react';
import { useLanguage } from '@/contexts/AppContext';

interface QRCodeModalProps {
  ticket: EventTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

// Simple QR Code generator using a service or library placeholder
const generateQRCodeDataURL = (data: string): string => {
  // In a real implementation, you would use a QR code library like 'qrcode'
  // For now, we'll use a placeholder service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

export default function QRCodeModal({ ticket, isOpen, onClose }: QRCodeModalProps) {
  const { t } = useLanguage();

  if (!ticket) return null;

  const qrData = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    ticketType: ticket.ticketType,
    holder: ticket.holder
  });

  const qrCodeUrl = generateQRCodeDataURL(qrData);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `ticket-${ticket.id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('ticketsComponents.qrCodeModal.title')}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Info */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold">{ticket.event?.title}</h3>
            <p className="text-sm text-muted-foreground">
              {ticket.ticketType} - ฿{(ticket.price || 0).toLocaleString()}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48"
                onError={(e) => {
                  // Fallback if QR service fails
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiPkVSUk9SPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('ticketsComponents.qrCodeModal.ticketId')}</span>
              <span className="font-mono">{ticket.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('ticketsComponents.qrCodeModal.purchaseDate')}</span>
              <span>{ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleDateString('th-TH') : t('ticketsComponents.qrCodeModal.statuses.unknown')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('ticketsComponents.qrCodeModal.status')}</span>
              <span className={`font-medium ${
                ticket.status === 'confirmed' ? 'text-green-600' :
                ticket.status === 'pending' ? 'text-yellow-600' :
                ticket.status === 'cancelled' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {ticket.status === 'confirmed' ? t('ticketsComponents.qrCodeModal.statuses.confirmed') :
                 ticket.status === 'pending' ? t('ticketsComponents.qrCodeModal.statuses.pending') :
                 ticket.status === 'cancelled' ? t('ticketsComponents.qrCodeModal.statuses.cancelled') : ticket.status || t('ticketsComponents.qrCodeModal.statuses.unknown')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              {t('ticketsComponents.qrCodeModal.buttons.download')}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('ticketsComponents.qrCodeModal.buttons.close')}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>{t('ticketsComponents.qrCodeModal.instructions.showAtCheckin')}</p>
            <p>{t('ticketsComponents.qrCodeModal.instructions.keepSafe')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
