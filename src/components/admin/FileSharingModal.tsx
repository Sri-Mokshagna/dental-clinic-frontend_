'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { ApiService } from '@/lib/api';

interface FileSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  onFileShared: () => void;
}

export default function FileSharingModal({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName, 
  onFileShared 
}: FileSharingModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(selectedFile.type.split('/')[1] || 'document');
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('description', description);

      const response = await fetch(`http://localhost:8080/api/patient-files/upload/${patientId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onFileShared();
        onClose();
        // Reset form
        setFile(null);
        setFileType('');
        setDescription('');
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dental-surface rounded-2xl max-w-md w-full animate-fade-in">
        <div className="p-6 border-b border-dental-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dental-foreground flex items-center">
              <PaperClipIcon className="w-6 h-6 text-primary-600 mr-2" />
              Share File with {patientName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-dental-muted hover:text-dental-foreground hover:bg-dental-surface-dark rounded-lg transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dental-foreground mb-2">
              Select File
            </label>
            <div className="relative">
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-dental-border rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
              >
                <div className="text-center">
                  <DocumentArrowUpIcon className="w-8 h-8 text-dental-muted mx-auto mb-2" />
                  <p className="text-sm text-dental-foreground">
                    {file ? file.name : 'Click to select file'}
                  </p>
                  <p className="text-xs text-dental-muted mt-1">
                    PDF, DOC, DOCX, JPG, PNG, TXT
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dental-foreground mb-2">
              File Type
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="dental-input w-full"
              required
            >
              <option value="">Select file type</option>
              <option value="prescription">Prescription</option>
              <option value="report">Medical Report</option>
              <option value="xray">X-Ray Image</option>
              <option value="invoice">Invoice</option>
              <option value="certificate">Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dental-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this file..."
              className="dental-input w-full h-20 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dental-muted border border-dental-border rounded-lg hover:bg-dental-surface-dark transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="dental-button btn-animate disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Share File'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
