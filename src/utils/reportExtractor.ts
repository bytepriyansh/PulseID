import { MedicalReport } from '@/contexts/ProfileContext';

interface ExtractedData {
    type?: string;
    summary?: string;
    details?: string;
    concerns?: string[];
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
    // Use pdf.js or a similar library to extract text
    const pdfjsLib = await import('pdfjs-dist');
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ');
    }
    
    return text;
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
    // Use mammoth.js or similar library to extract text from Word documents
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

export const extractTextFromImage = async (file: File): Promise<string> => {
    // Use Tesseract.js for OCR
    const Tesseract = await import('tesseract.js');
    const result = await Tesseract.recognize(
        URL.createObjectURL(file),
        'eng',
        { logger: (m) => console.log(m) }
    );
    return result.data.text;
};

const analyzeText = (text: string): ExtractedData => {
    const data: ExtractedData = {
        type: '',
        summary: '',
        details: '',
        concerns: []
    };

    // Try to identify report type
    const reportTypes = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG'];
    for (const type of reportTypes) {
        if (text.toLowerCase().includes(type.toLowerCase())) {
            data.type = type;
            break;
        }
    }

    // Look for summary sections
    const summaryMatch = text.match(/(?:summary|impression|findings)[:]\s*([^\n]+)/i);
    if (summaryMatch) {
        data.summary = summaryMatch[1].trim();
    }

    // Look for detailed findings
    const detailsMatch = text.match(/(?:details|description|results)[:]\s*([^\n]+(?:\n[^\n]+)*)/i);
    if (detailsMatch) {
        data.details = detailsMatch[1].trim();
    }

    // Look for concerns or abnormal results
    const concernKeywords = ['abnormal', 'elevated', 'low', 'high', 'irregular', 'concerning'];
    const lines = text.split('\n');
    data.concerns = lines
        .filter(line => 
            concernKeywords.some(keyword => 
                line.toLowerCase().includes(keyword)
            )
        )
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return data;
};

export const processReportFile = async (file: File): Promise<Partial<MedicalReport>> => {
    let extractedText = '';
    
    try {
        if (file.type === 'application/pdf') {
            extractedText = await extractTextFromPDF(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractedText = await extractTextFromDocx(file);
        } else if (file.type.startsWith('image/')) {
            extractedText = await extractTextFromImage(file);
        } else {
            throw new Error('Unsupported file type');
        }

        const analyzedData = analyzeText(extractedText);
        
        // Get current date if none found in text
        const dateMatch = extractedText.match(/(?:date|performed on|report date)[:]\s*([^\n]+)/i);
        const date = dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        return {
            type: analyzedData.type || 'Other',
            date,
            summary: analyzedData.summary || 'No summary extracted',
            details: analyzedData.details || 'No details extracted',
            concerns: analyzedData.concerns || [],
            extractedText,
            fileUrl: URL.createObjectURL(file),
            fileName: file.name,
            fileType: file.type
        };
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
};