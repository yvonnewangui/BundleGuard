'use client';

import { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';

interface AddBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bundle: {
    operator: string;
    type: string;
    sizeBytes: number;
    expiresAt: Date;
  }) => void;
}

const operators = ['Safaricom', 'Airtel', 'Telkom', 'Other'];
const bundleTypes = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Night Bundle', value: 'night' },
  { label: 'Other', value: 'other' },
];

const bundleSizes = [
  { label: '100 MB', value: 100 * 1024 * 1024 },
  { label: '250 MB', value: 250 * 1024 * 1024 },
  { label: '500 MB', value: 500 * 1024 * 1024 },
  { label: '1 GB', value: 1024 * 1024 * 1024 },
  { label: '1.5 GB', value: 1.5 * 1024 * 1024 * 1024 },
  { label: '2 GB', value: 2 * 1024 * 1024 * 1024 },
  { label: '3 GB', value: 3 * 1024 * 1024 * 1024 },
  { label: '5 GB', value: 5 * 1024 * 1024 * 1024 },
  { label: '10 GB', value: 10 * 1024 * 1024 * 1024 },
  { label: '20 GB', value: 20 * 1024 * 1024 * 1024 },
];

export function AddBundleModal({ isOpen, onClose, onAdd }: AddBundleModalProps) {
  const [operator, setOperator] = useState('Safaricom');
  const [bundleType, setBundleType] = useState('daily');
  const [sizeBytes, setSizeBytes] = useState(1024 * 1024 * 1024); // 1GB default
  const [customSize, setCustomSize] = useState('');
  const [expiryDays, setExpiryDays] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSize = customSize 
      ? parseFloat(customSize) * 1024 * 1024 * 1024 
      : sizeBytes;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    onAdd({
      operator,
      type: bundleType,
      sizeBytes: finalSize,
      expiresAt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-semibold text-gray-900">Add Bundle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Operator selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Operator
            </label>
            <div className="grid grid-cols-2 gap-2">
              {operators.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    operator === op
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Bundle type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bundle Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {bundleTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setBundleType(type.value)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    bundleType === type.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bundle size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bundle Size
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {bundleSizes.slice(0, 8).map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => {
                    setSizeBytes(size.value);
                    setCustomSize('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition-colors ${
                    sizeBytes === size.value && !customSize
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Custom size (GB)"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                step="0.1"
                min="0"
              />
              <span className="text-sm text-gray-500">GB</span>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expires in (days)
            </label>
            <input
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              max="365"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Bundle</span>
          </button>
        </form>
      </div>
    </div>
  );
}
