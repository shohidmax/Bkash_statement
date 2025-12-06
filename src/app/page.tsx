
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import Header from '@/components/pdf/Header';
import FileList from '@/components/pdf/FileList';
import FilterControls from '@/components/pdf/FilterControls';
import SummaryStats from '@/components/pdf/SummaryStats';
import ResultsTable from '@/components/pdf/ResultsTable';
import { Modals } from '@/components/pdf/Modals';
import PaymentTypePieChart from '@/components/pdf/PaymentTypePieChart';
import PaymentTypeSummary from '@/components/pdf/PaymentTypeSummary';
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: {
      jsPDF: typeof jsPDF;
      autoTable: any;
    };
  }
}

export type Transaction = {
  fileName: string;
  date: string;
  type: string;
  details: string;
  out: string;
  in: string;
  charge: string;
  balance: string;
  trxId: string;
  rawLine: string;
  dateObj: Date | null;
};

export type Summary = {
  totalIn: number;
  totalOut: number;
  totalCharge: number;
}

export type PaymentTypeSummaryData = {
  name: string;
  value: number;
};


export default function Home() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [allData, setAllData] = useState<Transaction[]>([]);
  const [currentData, setCurrentData] = useState<Transaction[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Summary>({ totalIn: 0, totalOut: 0, totalCharge: 0});
  const [paymentTypeSummary, setPaymentTypeSummary] = useState<PaymentTypeSummaryData[]>([]);
  const [filterValues, setFilterValues] = useState({
    text: '',
    mobile: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordPromise = useRef<{ resolve: (value: string) => void; reject: (reason?: any) => void; } | null>(null);

  const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScriptsLoaded = () => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    }
    setScriptsLoaded(true);
  };
  
  const showToast = useCallback((title: string, description: string, variant: "default" | "destructive" | null | undefined = "default") => {
    toast({ title, description, variant });
  }, [toast]);

  const parseAmount = (str: string) => {
    if (!str) return 0;
    const clean = str.replace(/,/g, '').replace(/\s/g, '');
    return parseFloat(clean) || 0;
  }
  
  const calculateSummary = useCallback((data: Transaction[]) => {
    let tIn = 0, tOut = 0, tCharge = 0;
    data.forEach(row => {
        tOut += parseAmount(row.out);
        tIn += parseAmount(row.in);
        tCharge += parseAmount(row.charge);
    });
    setSummary({ totalIn: tIn, totalOut: tOut, totalCharge: tCharge });
  }, []);

  const calculatePaymentTypeSummary = useCallback((data: Transaction[]) => {
    const summary: { [key: string]: number } = {};
    data.forEach(row => {
      if (row.type && parseAmount(row.out) > 0) {
        if (!summary[row.type]) {
          summary[row.type] = 0;
        }
        summary[row.type] += parseAmount(row.out);
      }
    });
    const summaryArray = Object.keys(summary)
      .map(key => ({ name: key, value: summary[key] }))
      .sort((a, b) => b.value - a.value);
    setPaymentTypeSummary(summaryArray);
  }, []);
  
  const renderTable = useCallback((data: Transaction[]) => {
      setCurrentData(data);
      calculateSummary(data);
  }, [calculateSummary]);

  const applyFilter = useCallback(() => {
    const { text, mobile, type, startDate, endDate } = filterValues;
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;
    if(e) e.setHours(23, 59, 59);

    const filtered = allData.filter((d: Transaction) => {
        const matchTxt = !text || d.rawLine.toLowerCase().includes(text.toLowerCase());
        const matchType = !type || d.type === type;
        const matchMobile = !mobile || d.rawLine.includes(mobile);
        let matchDate = true;
        if(d.dateObj) {
            if(s && d.dateObj < s) matchDate = false;
            if(e && d.dateObj > e) matchDate = false;
        }
        return matchTxt && matchMobile && matchType && matchDate;
    });
    renderTable(filtered);
  }, [allData, filterValues, renderTable]);
  
  useEffect(() => {
    if(isClient) {
      applyFilter();
    }
  }, [filterValues, allData, isClient, applyFilter]);

  useEffect(() => {
    if (allData.length > 0) {
      calculatePaymentTypeSummary(allData);
    } else {
      setPaymentTypeSummary([]);
    }
  }, [allData, calculatePaymentTypeSummary]);

  const parseDate = useCallback((str: string) => {
    const m = str.match(/(\d{2})-(\w{3})-(\d{2})/);
    if(!m) return null;
    try {
        const d = parseInt(m[1]), mo = monthMap[m[2] as keyof typeof monthMap], y = 2000 + parseInt(m[3]);
        return (mo !== undefined) ? new Date(y, mo, d) : null;
    } catch(e) { return null; }
  }, [monthMap]);

  const parsePDF = useCallback(async (file: File, pwd: any = null): Promise<Transaction[]> => {
    if (!window.pdfjsLib) {
        showToast('Error', 'PDF library not loaded yet.', 'destructive');
        return [];
    }
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buf), password: pwd }).promise;
    const rows: Transaction[] = [];
    
    const cols = { date: 80, type: 160, details: 300, out: 380, in: 460, charge: 510 };
    
    for(let p=1; p<=pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        if(!content.items.length) continue;
        
        const lines: { [key: number]: any[] } = {};
        content.items.forEach((i: any) => {
            const y = Math.round(i.transform[5]);
            if(!lines[y]) lines[y]=[];
            lines[y].push(i);
        });
        
        const sortedY = Object.keys(lines).map(Number).sort((a,b)=>b-a);
        const tempRows = sortedY.map(y => {
            const items = lines[y].sort((a,b)=>a.transform[4]-b.transform[4]);
            return { y, items, str: items.map(i=>i.str).join(' '), date: parseDate(items.map(i=>i.str).join(' ')) };
        });

        for(let i=0; i<tempRows.length; i++) {
            const r1 = tempRows[i];
            if(!r1.date) continue;
            
            let r2 = null;
            if(i+1 < tempRows.length) {
                const next = tempRows[i+1];
                if(!next.date && Math.abs(Number(r1.y) - Number(next.y)) < 20) r2 = next;
            }

            const obj: Transaction = { fileName: file.name, date:'', type:'', details:'', out:'', in:'', charge:'', balance:'', trxId:'', rawLine: r1.str+(r2?' '+r2.str:''), dateObj: r1.date };
            
            const map = (items: any[]) => items.forEach(it => {
                const x = it.transform[4], s = it.str.trim();
                if(!s) return;
                if(x < cols.date) obj.date += s+' ';
                else if(x < cols.type) obj.type += s+' ';
                else if(x < cols.details) obj.details += s+' ';
                else if(x < cols.out) obj.out += s;
                else if(x < cols.in) obj.in += s;
                else if(x < cols.charge) obj.charge += s;
                else obj.balance += s;
            });
            
            map(r1.items);
            if(r2) { map(r2.items); i++; }
            
            ['date','details','type'].forEach(k => obj[k as keyof Transaction]=obj[k as keyof Transaction].toString().trim());
            const m = obj.details.match(/TRX ID:\s*([A-Z0-9]+)/i);
            if(m) { obj.trxId = m[1]; obj.details = obj.details.replace(m[0], '').trim(); }
            rows.push(obj);
        }
    }
    return rows;
  }, [parseDate, showToast]);

  const onUploaderChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if(!files?.length) return;
    setIsLoading(true);
    
    let newFilesCount = 0;
    let newTransactions: Transaction[] = [];

    for(const f of Array.from(files)) {
        if(f.type !== 'application/pdf' || uploadedFiles.has(f.name)) continue;

        try {
            const r = await parsePDF(f);
            newTransactions.push(...r);
            setUploadedFiles(prev => new Set(prev).add(f.name));
            newFilesCount++;
        } catch(err: any) {
            if(err.name === 'PasswordException') {
                try {
                    const pwd = await new Promise<string>((resolve, reject) => {
                      (document.getElementById('password_modal') as HTMLDialogElement)?.showModal();
                      passwordPromise.current = { resolve, reject };
                    });
                    const r = await parsePDF(f, pwd);
                    newTransactions.push(...r);
                    setUploadedFiles(prev => new Set(prev).add(f.name));
                    newFilesCount++;
                } catch(e) { 
                  if(e !== 'Canceled') showToast('Wrong Password', 'Could not open PDF.', 'destructive'); 
                } finally {
                  (document.getElementById('password_modal') as HTMLDialogElement)?.close();
                  passwordPromise.current = null;
                }
            } else { 
              showToast('Error parsing file', f.name, 'destructive'); 
              console.error(err);
            }
        }
    }

    if(newFilesCount > 0) {
      const combinedData = [...allData, ...newTransactions];
      const uniqueData = Array.from(new Map(combinedData.map(item => [item.rawLine, item])).values());
      
      setAllData(uniqueData.sort((a, b) => (b.dateObj?.getTime() ?? 0) - (a.dateObj?.getTime() ?? 0)));
      showToast('Success', `${newFilesCount} file(s) added, ${uniqueData.length - allData.length} unique transactions imported.`, 'default');
    }
    
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

  }, [parsePDF, showToast, uploadedFiles, allData]);
  
  const removeFile = useCallback((fileName: string) => {
    setUploadedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
    });
    setAllData(prev => prev.filter(d => d.fileName !== fileName));
    showToast('File Removed', `${fileName} has been removed.`, 'default');
  }, [showToast]);

  const onClear = useCallback(() => { 
    setAllData([]); 
    setCurrentData([]); 
    setUploadedFiles(new Set());
    setFilterValues({ text: '', mobile: '', type: '', startDate: '', endDate: '' });
  }, []);

  const onExportCsv = useCallback(() => {
    if(!currentData.length) return;
    
    const summaryRows = [
      "Summary",
      `"Total In (Cash In)","${summary.totalIn.toFixed(2)}"`,
      `"Total Out (Cash Out)","${summary.totalOut.toFixed(2)}"`,
      `"Total Charge","${summary.totalCharge.toFixed(2)}"`,
      ""
    ];

    const head = ['File','Date','Type','Details','TRX ID','Out','In','Charge','Balance'];
    const dataRows = [head.join(',')];
    currentData.forEach((r: any) => dataRows.push([`"${r.fileName}"`,`"${r.date}"`,`"${r.type}"`,`"${r.details}"`,`"${r.trxId}"`,r.out,r.in,r.charge,r.balance].join(',')));
    
    const csvContent = [...summaryRows, ...dataRows].join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csvContent], {type:'text/csv'}));
    a.download = 'bkash_statement_export.csv'; a.click();
  }, [currentData, summary]);

  const onExportPdf = useCallback(() => {
    if(!currentData.length || !window.jspdf) return;
    const doc = new window.jspdf.jsPDF({orientation:'landscape'});
    
    doc.text("Statement Summary", 14, 15);
    doc.setFontSize(10);
    doc.text(`Total In (Cash In): ${summary.totalIn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 22);
    doc.text(`Total Out (Cash Out): ${summary.totalOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 27);
    doc.text(`Total Charge: ${summary.totalCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 32);

    (doc as any).autoTable({
        head: [['Date','Type','Details','TRX ID','Out','In','Charge','Balance']],
        body: currentData.map((r: any) => [r.date,r.type,r.details,r.trxId,r.out,r.in,r.charge,r.balance]),
        startY: 40, theme:'grid', styles:{fontSize:8}
    });
    doc.save('bkash_statement_export.pdf');
  }, [currentData, summary]);

  const uniqueTypes = [...new Set(allData.map((d) => d.type).filter(Boolean))].sort();

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js" onReady={handleScriptsLoaded} strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js" strategy="afterInteractive" />
      
      <div className="card bg-base-100 shadow-xl border border-base-content/10">
        <div className="card-body p-4 md:p-6">
          <Header onUploaderChange={onUploaderChange} fileInputRef={fileInputRef}/>

          {uploadedFiles.size > 0 && (
            <FileList uploadedFiles={uploadedFiles} removeFile={removeFile} />
          )}

          <FilterControls 
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            uniqueTypes={uniqueTypes}
            onClear={onClear}
            onExportCsv={onExportCsv}
            onExportPdf={onExportPdf}
            hasData={allData.length > 0}
          />
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center my-12">
              <span className="loading loading-bars loading-lg text-primary"></span>
              <p className="mt-3 text-base-content/60 font-medium animate-pulse">Processing PDF...</p>
            </div>
          )}

          {!isLoading && allData.length > 0 && (
            <>
              <SummaryStats 
                totalCount={allData.length}
                filteredCount={currentData.length}
                summary={summary}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <PaymentTypePieChart data={paymentTypeSummary} />
                <PaymentTypeSummary data={paymentTypeSummary} />
              </div>
              <ResultsTable 
                data={currentData}
                showToast={(msg) => showToast('Copied', msg, 'default')}
              />
            </>
          )}

          {!isLoading && allData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-base-content/10 rounded-xl mt-4 bg-base-200/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-base-content/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-base-content/50 font-medium">No data loaded.</p>
            </div>
          )}
        </div>
      </div>
      <Modals passwordPromise={passwordPromise} />
    </>
  );
}
