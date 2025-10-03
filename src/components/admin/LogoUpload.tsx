'use client';

import { useState, useRef } from 'react';
import { getCurrentUser } from '@/lib/session';
import { useLogo } from '@/context/LogoContext';

interface LogoUploadProps {
  onLogoUpdate?: (logoUrl: string) => void;
  currentLogo?: string;
}

export default function LogoUpload({ onLogoUpdate, currentLogo }: LogoUploadProps) {
  const { logoUrl, updateLogo } = useLogo();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      
      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8080/api/logo/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        const logoUrl = result.logoUrl;
        
        // Update logo context with server URL
        updateLogo(logoUrl);
        
        if (onLogoUpdate) {
          onLogoUpdate(logoUrl);
        }
        
        alert('Logo uploaded successfully!');
      } else {
        const errorData = await response.json();
        alert('Error uploading logo: ' + errorData.error);
      }
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error uploading logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Logo upload is now visible to all roles, but only admin can upload
  const canUpload = (currentUser?.role as string) === 'owner' || (currentUser?.role as string) === 'ADMIN';

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {logoUrl && (
        <div className="flex items-center gap-4">
          <img
            src={logoUrl}
            alt="Clinic Logo"
            className="w-16 h-16 object-contain rounded border"
            onError={() => updateLogo('')}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Current Logo</p>
            <button
              onClick={() => updateLogo('')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove Logo
            </button>
          </div>
        </div>
      )}
      
      {/* Simple File Upload */}
      {canUpload && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Logo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded-md"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Max size: 2MB. Supported: JPG, PNG, GIF, WebP
          </p>
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          )}
        </div>
      )}
      
      {!canUpload && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Only administrators can upload logos
          </p>
        </div>
      )}
    </div>
  );
}
