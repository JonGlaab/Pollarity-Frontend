import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

export const SurveyExportMenu = ({ surveyId, surveyTitle, buttonSize = "default" }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (format) => {
        setIsDownloading(true);
        try {

            const response = await axios.get(`/api/surveys/${surveyId}/export/${format}`, {
                responseType: 'blob',
            });


            const url = window.URL.createObjectURL(new Blob([response.data]));


            const link = document.createElement('a');
            link.href = url;


            const cleanTitle = (surveyTitle || 'survey').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const extension = format === 'excel' ? 'xlsx' : 'csv';

            link.setAttribute('download', `${cleanTitle}_results.${extension}`);

            document.body.appendChild(link);
            link.click();


            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(`Failed to download ${format}:`, error);
            alert("Failed to download file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={buttonSize} disabled={isDownloading} className="gap-2">
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export Data
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent  align="end" className="w-48 bg-white">
                <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDownload('csv')} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('excel')} className="cursor-pointer">
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    <span>Export as Excel</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};