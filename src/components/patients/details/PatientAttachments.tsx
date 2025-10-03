'use client';

import { useEffect, useState } from 'react';
import { Patient, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

interface PatientAttachmentsProps {
  patient: Patient;
  onUpdate: () => void;
}

interface Report {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  doctor?: { fullName: string };
}

export default function PatientAttachments({ patient, onUpdate }: PatientAttachmentsProps) {
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const currentUser = getCurrentUser() as User | undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilesToUpload(e.target.files);
  };

  const refreshReports = async () => {
    try {
      const list = await ApiService.getReportsByPatient(String(patient.id));
      setReports(list as Report[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleUpload = async () => {
    if (!filesToUpload || uploading) return;
    try {
      setUploading(true);
      const files = Array.from(filesToUpload);
      
      for (const file of files) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          await ApiService.uploadReport(String(patient.id), file, currentUser?.id ? String(currentUser.id) : undefined);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
      }
      
      setFilesToUpload(null);
      await refreshReports();
      onUpdate();
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const sendFileToWhatsApp = async (report: Report) => {
    if (!patient.phoneNumber) {
      alert('Patient phone number not available');
      return;
    }

    try {
      setSendingWhatsApp(true);
      const name = patient.fullName || 'Patient';
      const message = `Hello ${name}, your requested receipt/bill is here. Please find the attached file: ${report.fileName}`;
      
      await fetch('http://localhost:8080/api/whatsapp/send-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: patient.phoneNumber,
          message: message,
          fileName: report.fileName,
          fileUrl: ApiService.getReportDownloadUrl(report.id)
        })
      });
      
      alert('File sent to WhatsApp successfully!');
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      alert('Failed to send file to WhatsApp');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const sendAllFilesToWhatsApp = async () => {
    if (!patient.phoneNumber) {
      alert('Patient phone number not available');
      return;
    }

    try {
      setSendingWhatsApp(true);
      const name = patient.fullName || 'Patient';
      const message = `Hello ${name}, your requested files are here. Please find the attached files.`;
      
      await fetch('http://localhost:8080/api/whatsapp/send-multiple-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: patient.phoneNumber,
          message: message,
          files: reports.map(r => ({
            fileName: r.fileName,
            fileUrl: ApiService.getReportDownloadUrl(r.id)
          }))
        })
      });
      
      alert('All files sent to WhatsApp successfully!');
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      alert('Failed to send files to WhatsApp');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  useEffect(() => { refreshReports(); }, [patient.id]);

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">ments</h2>
      <div className="bg-white p-6 shadow rounded-lg">
        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            {filesToUpload && filesToUpload.length > 0 && (
              <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm disabled:opacity-60 hover:bg-blue-600"
              >
                {uploading ? 'Uploading...' : `Upload ${filesToUpload.length} file(s)`}
              </button>
            )}
          </div>
          
          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-32 truncate">{fileName}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress === -1 ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: progress === -1 ? '100%' : `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {progress === -1 ? 'Failed' : progress === 100 ? 'Complete' : `${progress}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Uploaded Files ({reports.length})</h3>
            {patient.phoneNumber && reports.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={sendAllFilesToWhatsApp}
                  disabled={sendingWhatsApp}
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-60 hover:bg-green-700"
                >
                  {sendingWhatsApp ? 'Sending...' : 'Send All to WhatsApp'}
                </button>
              </div>
            )}
          </div>
          
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <a 
                        href={ApiService.getReportDownloadUrl(report.id)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {report.fileName}
                      </a>
                      <div className="text-sm text-gray-500">
                        {formatDate(report.uploadedAt)}
                        {report.doctor && ` • Uploaded by ${report.doctor.fullName}`}
                      </div>
                    </div>
                  </div>
                  
                  {patient.phoneNumber && (
                    <button
                      onClick={() => sendFileToWhatsApp(report)}
                      disabled={sendingWhatsApp}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded-md disabled:opacity-60 hover:bg-green-700"
                    >
                      Send to WhatsApp
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No files attached yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
