'use client';

import { useState, useEffect, useRef } from 'react';
import { useInventoryWithSync } from '@/hooks/useInventoryWithSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Printer, QrCode } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export function BarcodeGenerator() {
  const { data } = useInventoryWithSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const categories = ['all', ...Array.from(new Set(data.items.map(item => item.category)))];

  const filteredItems = data.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Generate barcodes for visible items
  useEffect(() => {
    filteredItems.forEach(item => {
      const canvas = canvasRefs.current[item.id];
      if (canvas) {
        try {
          JsBarcode(canvas, item.barcode, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 12,
            margin: 10,
            background: "#ffffff",
            lineColor: "#000000"
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
        }
      }
    });
  }, [filteredItems]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredItems.map(item => item.id);
    setSelectedItems(visibleIds);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const downloadBarcodes = () => {
    const selectedItemsData = data.items.filter(item => selectedItems.includes(item.id));

    selectedItemsData.forEach(item => {
      const canvas = canvasRefs.current[item.id];
      if (canvas) {
        // Create download link
        const link = document.createElement('a');
        link.download = `barcode-${item.barcode}-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    });
  };

  const printBarcodes = () => {
    const selectedItemsData = data.items.filter(item => selectedItems.includes(item.id));

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create HTML content for printing
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Labels</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
            }
            .barcode-sheet {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              page-break-inside: avoid;
            }
            .barcode-label {
              border: 1px solid #ddd;
              padding: 15px;
              text-align: center;
              background: white;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .barcode-canvas {
              margin: 10px 0;
            }
            .item-name {
              font-weight: bold;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .item-details {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .barcode-text {
              font-family: monospace;
              font-size: 12px;
              margin-top: 5px;
            }
            @media print {
              body { margin: 0; }
              .barcode-sheet { gap: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="barcode-sheet">
    `;

    selectedItemsData.forEach(item => {
      const canvas = canvasRefs.current[item.id];
      if (canvas) {
        const barcodeData = canvas.toDataURL();
        htmlContent += `
          <div class="barcode-label">
            <div class="item-name">${item.name}</div>
            <div class="item-details">
              ${item.brand && item.model ? `${item.brand} ${item.model}` : item.brand || item.model || ''}
              ${item.category ? `• ${item.category}` : ''}
            </div>
            <img src="${barcodeData}" alt="Barcode" class="barcode-canvas" />
            <div class="barcode-text">${item.barcode}</div>
          </div>
        `;
      }
    });

    htmlContent += `
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Barcode Generator</h2>
          <p className="text-slate-600">View, download, and print barcodes for your inventory items</p>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadBarcodes}>
              <Download className="h-4 w-4 mr-2" />
              Download ({selectedItems.length})
            </Button>
            <Button onClick={printBarcodes} className="bg-slate-800 hover:bg-slate-700">
              <Printer className="h-4 w-4 mr-2" />
              Print ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, brand, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredItems.length > 0 && (
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Select All Visible ({filteredItems.length})
              </Button>
              {selectedItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              )}
              {selectedItems.length > 0 && (
                <Badge variant="secondary">
                  {selectedItems.length} selected
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barcode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedItems.includes(item.id)
                ? 'ring-2 ring-slate-800 bg-slate-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleItemSelection(item.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>
                    {item.brand && item.model ? `${item.brand} ${item.model}` :
                     item.brand || item.model || ''}
                    {item.category && ' • ' + item.category}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={item.isRented ? "destructive" : "default"}>
                    {item.isRented ? 'Rented' : 'Available'}
                  </Badge>
                  {selectedItems.includes(item.id) && (
                    <Badge variant="secondary" className="bg-slate-800 text-white">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 rounded border border-slate-200 mb-3">
                <canvas
                  ref={el => { canvasRefs.current[item.id] = el; }}
                  className="mx-auto"
                />
              </div>
              <div className="font-mono text-sm text-slate-600">
                {item.barcode}
              </div>
              {item.serialNumber && (
                <div className="text-xs text-slate-500 mt-1">
                  S/N: {item.serialNumber}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Items Found</h3>
            <p className="text-slate-500">
              {data.items.length === 0
                ? 'Add inventory items to generate barcodes.'
                : 'Try adjusting your search or category filter.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {data.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use Barcodes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>• <strong>Select items:</strong> Click on barcode cards to select them for batch operations</p>
            <p>• <strong>Download:</strong> Save individual barcode images to your computer</p>
            <p>• <strong>Print:</strong> Print multiple barcodes on labels or paper for physical tagging</p>
            <p>• <strong>Scanning:</strong> Use any barcode scanner app to read these CODE128 barcodes</p>
            <p>• <strong>Organization:</strong> Attach printed barcodes to physical instruments for easy tracking</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
