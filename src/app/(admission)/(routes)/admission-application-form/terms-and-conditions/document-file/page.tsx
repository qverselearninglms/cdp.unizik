'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
    Upload,
    File,
    FileText,
    Eye,
    AlertCircle,
    CheckCircle,
    Loader2,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import * as mammoth from 'mammoth';

interface DocumentState {
    file: File | null;
    content: string;
    type: 'pdf' | 'docx' | null;
    isLoading: boolean;
    error: string | null;
    pages: string[];
    currentPage: number;
    zoom: number;
}

const DocumentReaderPage: React.FC = () => {
    const [document, setDocument] = useState<DocumentState>({
        file: null,
        content: '',
        type: null,
        isLoading: false,
        error: null,
        pages: [],
        currentPage: 0,
        zoom: 1
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(async (file: File) => {
        if (!file) return;

        // Validate file type
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (!fileType.includes('pdf') &&
            !fileType.includes('document') &&
            !fileType.includes('word') &&
            !fileName.endsWith('.docx') &&
            !fileName.endsWith('.doc') &&
            !fileName.endsWith('.pdf')) {
            setDocument(prev => ({
                ...prev,
                error: 'Please select a PDF or Word document (.pdf, .doc, .docx)'
            }));
            return;
        }

        setDocument(prev => ({
            ...prev,
            file,
            isLoading: true,
            error: null,
            content: ''
        }));

        try {
            let content = '';
            let docType: 'pdf' | 'docx' = 'pdf';

            if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
                // For PDF files, we'll show a message since full PDF rendering requires additional libraries
                content = `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div class="text-blue-600 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-blue-800 mb-2">PDF Document Selected</h3>
            <p class="text-blue-700 mb-4">File: ${file.name}</p>
            <p class="text-blue-600 text-sm">
              PDF content display requires additional PDF.js library integration. 
              For full PDF rendering, please convert to Word document or contact support.
            </p>
            <div class="mt-4 p-4 bg-white rounded border">
              <p class="text-gray-700 text-sm">
                <strong>File Information:</strong><br>
                Size: ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
                Type: ${file.type || 'application/pdf'}<br>
                Last Modified: ${new Date(file.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>
        `;
                docType = 'pdf';
            } else {
                // Handle Word documents using mammoth
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                content = result.value;
                docType = 'docx';

                if (result.messages.length > 0) {
                    console.warn('Document conversion warnings:', result.messages);
                }
            }

            setDocument(prev => ({
                ...prev,
                content,
                type: docType,
                isLoading: false,
                currentPage: 0,
                pages: [content] // For now, treating as single page
            }));

        } catch (error) {
            console.error('Error processing document:', error);
            setDocument(prev => ({
                ...prev,
                error: `Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isLoading: false
            }));
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const resetDocument = useCallback(() => {
        setDocument({
            file: null,
            content: '',
            type: null,
            isLoading: false,
            error: null,
            pages: [],
            currentPage: 0,
            zoom: 1
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const adjustZoom = useCallback((delta: number) => {
        setDocument(prev => ({
            ...prev,
            zoom: Math.max(0.5, Math.min(3, prev.zoom + delta))
        }));
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                                <FileText className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Terms & Conditions Reader
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Upload and view PDF or Word documents for terms and conditions
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!document.file ? (
                    // Upload Section
                    <div className="max-w-2xl mx-auto">
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors duration-200 bg-white shadow-lg"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <div className="p-4 bg-blue-50 rounded-full">
                                        <Upload className="h-12 w-12 text-blue-500" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                        Upload Document
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Drag and drop your Terms & Conditions document here, or click to browse
                                    </p>
                                </div>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                                >
                                    <File className="h-5 w-5 mr-2" />
                                    Choose File
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />

                                <div className="text-sm text-gray-500">
                                    <p className="mb-2">Supported formats:</p>
                                    <div className="flex justify-center space-x-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            PDF
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            DOC
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            DOCX
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {document.error && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                                        <p className="text-sm text-red-700 mt-1">{document.error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Document Display Section
                    <div className="space-y-6">
                        {/* Document Info Bar */}
                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {document.type === 'pdf' ? (
                                            <File className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-blue-500" />
                                        )}
                                        <span className="font-medium text-gray-800">{document.file.name}</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-gray-600">
                                            {(document.file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Zoom Controls */}
                                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => adjustZoom(-0.1)}
                                            className="p-1 hover:bg-white rounded transition-colors"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <span className="px-2 text-sm text-gray-700 min-w-12 text-center">
                                            {Math.round(document.zoom * 100)}%
                                        </span>
                                        <button
                                            onClick={() => adjustZoom(0.1)}
                                            className="p-1 hover:bg-white rounded transition-colors"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={resetDocument}
                                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {document.isLoading && (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                                <p className="text-gray-600">Processing document...</p>
                            </div>
                        )}

                        {/* Document Content */}
                        {document.content && !document.isLoading && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <div
                                        className="prose prose-lg max-w-none"
                                        style={{
                                            transform: `scale(${document.zoom})`,
                                            transformOrigin: 'top left',
                                            width: `${100 / document.zoom}%`
                                        }}
                                        dangerouslySetInnerHTML={{ __html: document.content }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {document.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <div className="flex items-start">
                                    <AlertCircle className="h-6 w-6 text-red-400 mt-1 mr-3 shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-medium text-red-800 mb-2">Processing Error</h3>
                                        <p className="text-red-700 mb-4">{document.error}</p>
                                        <button
                                            onClick={resetDocument}
                                            className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            Try Another Document
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                            <Eye className="h-5 w-5 mr-2" />
                            How to Use This Document Reader
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6 text-blue-700">
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Upload Document</h4>
                                        <p className="text-sm">Drag and drop or click to select your PDF or Word document</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-medium">View Content</h4>
                                        <p className="text-sm">The document content will be displayed with proper formatting</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Zoom & Navigate</h4>
                                        <p className="text-sm">Use zoom controls to adjust text size for better readability</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                                        4
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Close & Upload New</h4>
                                        <p className="text-sm">Click close to upload a different document</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentReaderPage;