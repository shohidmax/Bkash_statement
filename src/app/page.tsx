
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend the window interface to include jspdf
declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: {
      jsPDF: typeof jsPDF;
      autoTable: any;
    };
  }
}

export default function Home() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const allData = useRef<any[]>([]);
  const currentData = useRef<any[]>([]);
  const uploadedFiles = useRef(new Set<string>());
  const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };

  const ui = {
    uploader: useRef<HTMLInputElement>(null),
    filterInput: useRef<HTMLInputElement>(null),
    mobileFilter: useRef<HTMLInputElement>(null),
    typeFilter: useRef<HTMLSelectElement>(null),
    startDate: useRef<HTMLInputElement>(null),
    endDate: useRef<HTMLInputElement>(null),
    clearBtn: useRef<HTMLButtonElement>(null),
    exportCsvBtn: useRef<HTMLButtonElement>(null),
    exportPdfBtn: useRef<HTMLButtonElement>(null),
    loader: useRef<HTMLDivElement>(null),
    summary: useRef<HTMLDivElement>(null),
    resultContainer: useRef<HTMLDivElement>(null),
    tableBody: useRef<HTMLTableSectionElement>(null),
    emptyState: useRef<HTMLDivElement>(null),
    totalCount: useRef<HTMLDivElement>(null),
    filteredCount: useRef<HTMLDivElement>(null),
    sumIn: useRef<HTMLDivElement>(null),
    sumOut: useRef<HTMLDivElement>(null),
    sumCharge: useRef<HTMLDivElement>(null),
    toastContainer: useRef<HTMLDivElement>(null),
    passwordModal: useRef<HTMLDialogElement>(null),
    passwordInput: useRef<HTMLInputElement>(null),
    passwordError: useRef<HTMLParagraphElement>(null),
    submitPassBtn: useRef<HTMLButtonElement>(null),
    cancelPassBtn: useRef<HTMLButtonElement>(null),
    cacheModal: useRef<HTMLDialogElement>(null),
    saveCacheBtn: useRef<HTMLButtonElement>(null),
    fileListSection: useRef<HTMLDivElement>(null),
    fileListContainer: useRef<HTMLDivElement>(null)
  };

  const handleScriptsLoaded = () => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    }
    setScriptsLoaded(true);
  };
  
  useEffect(() => {
    if (!scriptsLoaded) return;

    const showToast = (msg: string, type = 'alert-info') => {
      if (!ui.toastContainer.current) return;
      const t = document.createElement('div');
      t.className = `alert ${type} shadow-lg rounded-lg mb-2 border border-base-content/10 p-2 text-sm`;
      t.innerHTML = `<span>${msg}</span>`;
      ui.toastContainer.current.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }
    
    const updateUI = (hasData: boolean) => {
        const method = hasData ? 'remove' : 'add';
        ui.emptyState.current?.classList[method]('hidden');
        if (ui.resultContainer.current) {
            ui.resultContainer.current.classList.toggle('hidden', !hasData);
        }
        if (ui.summary.current) {
            ui.summary.current.classList.toggle('hidden', !hasData);
        }
        if (ui.fileListSection.current) {
            ui.fileListSection.current.classList.toggle('hidden', uploadedFiles.current.size === 0);
        }
        
        [ui.filterInput, ui.mobileFilter, ui.typeFilter, ui.startDate, ui.endDate, ui.clearBtn, ui.exportCsvBtn, ui.exportPdfBtn].forEach(el => {
            if (el.current) el.current.disabled = !hasData
        });
        if(!hasData && ui.uploader.current) ui.uploader.current.value = '';
    }

    const updateFileList = () => {
        if (!ui.fileListContainer.current) return;
        ui.fileListContainer.current.innerHTML = '';
        uploadedFiles.current.forEach(fileName => {
            const badge = document.createElement('div');
            badge.className = 'badge badge-neutral gap-2 p-3';
            const fileNameStr = String(fileName);
            badge.innerHTML = `
              <span>${fileNameStr}</span>
              <button class="btn btn-xs btn-circle btn-ghost" data-filename="${fileNameStr}">✕</button>
            `;
            ui.fileListContainer.current?.appendChild(badge);
        });
    };

    const removeFile = (fileName: string) => {
        uploadedFiles.current.delete(fileName);
        allData.current = allData.current.filter((d: any) => d.fileName !== fileName);
        
        if (allData.current.length === 0) {
            currentData.current = [];
            updateUI(false);
        } else {
            allData.current.sort((a: any, b: any) => b.dateObj - a.dateObj);
            updateTypeDropdown();
            applyFilter(); 
        }
        updateFileList();
        showToast(`Removed ${fileName}`, 'alert-warning');
    };
    
    const onRemoveFileClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if(target.tagName === 'BUTTON' && target.dataset.filename) {
            removeFile(target.dataset.filename);
        }
    }

    const parseDate = (str: string) => {
        const m = str.match(/(\d{2})-(\w{3})-(\d{2})/);
        if(!m) return null;
        try {
            const d = parseInt(m[1]), mo = monthMap[m[2] as keyof typeof monthMap], y = 2000 + parseInt(m[3]);
            return (mo !== undefined) ? new Date(y, mo, d) : null;
        } catch(e) { return null; }
    }
    
    const parseAmount = (str: string) => {
        if (!str) return 0;
        const clean = str.replace(/,/g, '').replace(/\s/g, '');
        return parseFloat(clean) || 0;
    }
    
    const calculateSummary = (data: any[]) => {
        let tIn = 0, tOut = 0, tCharge = 0;
        data.forEach(row => {
            tOut += parseAmount(row.out);
            tIn += parseAmount(row.in);
            tCharge += parseAmount(row.charge);
        });
        const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if(ui.sumIn.current) ui.sumIn.current.textContent = fmt(tIn);
        if(ui.sumOut.current) ui.sumOut.current.textContent = fmt(tOut);
        if(ui.sumCharge.current) ui.sumCharge.current.textContent = fmt(tCharge);
    }

    const updateTypeDropdown = () => {
        const types = [...new Set(allData.current.map((d: any) => d.type).filter(Boolean))].sort();
        if(ui.typeFilter.current) {
            ui.typeFilter.current.innerHTML = '<option value="">All Types</option>';
            types.forEach((t: any) => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                ui.typeFilter.current?.appendChild(opt);
            });
        }
    }

    const renderTable = (data: any[]) => {
        if(!ui.tableBody.current || !ui.totalCount.current || !ui.filteredCount.current) return;
        ui.tableBody.current.innerHTML = '';
        ui.totalCount.current.textContent = String(allData.current.length);
        ui.filteredCount.current.textContent = String(data.length);
        
        calculateSummary(data);

        if(!data.length) {
            ui.tableBody.current.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-base-content/50">No matching records.</td></tr>';
            return;
        }

        const frag = document.createDocumentFragment();
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'hover group';
            
            const add = (txt: string, cls='') => {
                const td = document.createElement('td');
                td.className = cls;
                td.textContent = txt || '';
                tr.appendChild(td);
            };

            add(row.date, 'whitespace-nowrap opacity-80');
            add(row.type, 'text-primary font-medium');
            add(row.details, 'min-w-[200px] opacity-90');
            
            const trxTd = document.createElement('td');
            if(row.trxId) {
                const sp = document.createElement('span');
                sp.className = 'cursor-pointer hover:text-primary font-bold tooltip tooltip-right';
                sp.setAttribute('data-tip', 'Click to copy');
                sp.textContent = row.trxId;
                sp.onclick = () => { navigator.clipboard.writeText(row.trxId); showToast('Copied!', 'alert-success'); };
                trxTd.appendChild(sp);
            }
            tr.appendChild(trxTd);

            add(row.out, 'text-right text-base-content');
            add(row.in, 'text-right text-success');
            add(row.charge, 'text-right text-error');
            add(row.balance, 'text-right font-bold');
            frag.appendChild(tr);
        });
        ui.tableBody.current.appendChild(frag);
    }
    
    const applyFilter = () => {
        const txt = ui.filterInput.current?.value.toLowerCase().trim() || '';
        const mobile = ui.mobileFilter.current?.value.trim() || '';
        const type = ui.typeFilter.current?.value || '';
        const s = ui.startDate.current?.value ? new Date(ui.startDate.current.value) : null;
        const e = ui.endDate.current?.value ? new Date(ui.endDate.current.value) : null;
        if(e) e.setHours(23, 59, 59);

        currentData.current = allData.current.filter((d: any) => {
            const matchTxt = !txt || d.rawLine.toLowerCase().includes(txt);
            const matchType = !type || d.type === type;
            const matchMobile = !mobile || d.rawLine.includes(mobile);
            let matchDate = true;
            if(d.dateObj) {
                if(s && d.dateObj < s) matchDate = false;
                if(e && d.dateObj > e) matchDate = false;
            }
            return matchTxt && matchMobile && matchType && matchDate;
        });
        renderTable(currentData.current);
    }
    
    const onFilterChange = () => applyFilter();
    
    const onClear = () => { 
        allData.current = []; 
        currentData.current = []; 
        uploadedFiles.current.clear();
        if(ui.mobileFilter.current) ui.mobileFilter.current.value = '';
        if(ui.filterInput.current) ui.filterInput.current.value = ''; 
        updateFileList();
        renderTable([]); 
        updateUI(false); 
    };

    const parsePDF = async (file: File, pwd: any = null) => {
        if (!window.pdfjsLib) {
            showToast('PDF library not loaded yet.', 'alert-error');
            return [];
        }
        const buf = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buf), password: pwd }).promise;
        const rows: any[] = [];
        
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

                const obj: any = { fileName: file.name, date:'', type:'', details:'', out:'', in:'', charge:'', balance:'', trxId:'', rawLine: r1.str+(r2?' '+r2.str:''), dateObj: r1.date };
                
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
                
                ['date','details','type'].forEach(k => obj[k]=obj[k].trim());
                const m = obj.details.match(/TRX ID:\s*([A-Z0-9]+)/i);
                if(m) { obj.trxId = m[1]; obj.details = obj.details.replace(m[0], '').trim(); }
                rows.push(obj);
            }
        }
        return rows;
    };
    
    const onUploaderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(!files?.length) return;
        ui.loader.current?.classList.remove('hidden');
        ui.emptyState.current?.classList.add('hidden');
        
        let cnt = 0;
        for(const f of Array.from(files)) {
            if(f.type !== 'application/pdf') continue;
            if(uploadedFiles.current.has(f.name)) continue; 

            try {
                const r = await parsePDF(f);
                allData.current.push(...r);
                uploadedFiles.current.add(f.name);
                cnt++;
            } catch(err: any) {
                if(err.name === 'PasswordException') {
                    try {
                        const pwd = await new Promise<string>((res, rej) => {
                            if(ui.passwordInput.current) ui.passwordInput.current.value=''; 
                            if(ui.passwordError.current) ui.passwordError.current.classList.add('hidden'); 
                            ui.passwordModal.current?.showModal();
                            if(ui.submitPassBtn.current) ui.submitPassBtn.current.onclick = () => { if(ui.passwordInput.current?.value) res(ui.passwordInput.current.value); };
                            if(ui.cancelPassBtn.current) ui.cancelPassBtn.current.onclick = () => { ui.passwordModal.current?.close(); rej('Canceled'); };
                        });
                        ui.passwordModal.current?.close();
                        const r = await parsePDF(f, pwd);
                        allData.current.push(...r);
                        uploadedFiles.current.add(f.name);
                        cnt++;
                    } catch(e) { if(e !== 'Canceled') showToast('Wrong Password', 'alert-error'); }
                } else { showToast('Error: '+f.name, 'alert-error'); console.error(err); }
            }
        }
        ui.loader.current?.classList.add('hidden');
        if(cnt || allData.current.length) {
            allData.current.sort((a: any, b: any) => b.dateObj - a.dateObj);
            updateTypeDropdown();
            updateFileList();
            currentData.current = allData.current;
            renderTable(allData.current);
            updateUI(true);
            if(cnt > 0) showToast(`${cnt} file(s) added`, 'alert-success');
        } else updateUI(false);
    };
    
    const onExportCsv = () => {
        if(!currentData.current.length) return;
        const head = ['File','Date','Type','Details','TRX ID','Out','In','Charge','Balance'];
        const rows = [head.join(',')];
        currentData.current.forEach((r: any) => rows.push([`"${r.fileName}"`,`"${r.date}"`,`"${r.type}"`,`"${r.details}"`,`"${r.trxId}"`,r.out,r.in,r.charge,r.balance].join(',')));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([rows.join('\n')], {type:'text/csv'}));
        a.download = 'export.csv'; a.click();
    };

    const onExportPdf = () => {
        if(!currentData.current.length || !window.jspdf) return;
        const doc = new window.jspdf.jsPDF({orientation:'landscape'});
        doc.text("Statement", 14, 15);
        (doc as any).autoTable({
            head: [['Date','Type','Details','TRX ID','Out','In','Charge','Balance']],
            body: currentData.current.map((r: any) => [r.date,r.type,r.details,r.trxId,r.out,r.in,r.charge,r.balance]),
            startY: 20, theme:'grid', styles:{fontSize:8}
        });
        doc.save('export.pdf');
    };
    
    const onSaveCache = () => {
      localStorage.setItem('cachePref', 'set');
      ui.cacheModal.current?.close();
    }
    
    if (ui.fileListContainer.current) {
      ui.fileListContainer.current.addEventListener('click', onRemoveFileClick as any);
    }
    
    if(!localStorage.getItem('cachePref')) ui.cacheModal.current?.showModal();

    const saveCacheBtnEl = ui.saveCacheBtn.current;
    saveCacheBtnEl?.addEventListener('click', onSaveCache);
    
    const filterInputEl = ui.filterInput.current;
    const mobileFilterEl = ui.mobileFilter.current;
    const startDateEl = ui.startDate.current;
    const endDateEl = ui.endDate.current;
    const typeFilterEl = ui.typeFilter.current;
    const clearBtnEl = ui.clearBtn.current;
    const uploaderEl = ui.uploader.current;
    const exportCsvBtnEl = ui.exportCsvBtn.current;
    const exportPdfBtnEl = ui.exportPdfBtn.current;
    const fileListContainerEl = ui.fileListContainer.current;

    filterInputEl?.addEventListener('input', onFilterChange);
    mobileFilterEl?.addEventListener('input', onFilterChange);
    startDateEl?.addEventListener('input', onFilterChange);
    endDateEl?.addEventListener('input', onFilterChange);
    typeFilterEl?.addEventListener('change', onFilterChange);
    clearBtnEl?.addEventListener('click', onClear);
    uploaderEl?.addEventListener('change', onUploaderChange);
    exportCsvBtnEl?.addEventListener('click', onExportCsv);
    exportPdfBtnEl?.addEventListener('click', onExportPdf);
  
    const onRemoveFileClickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if(target.tagName === 'BUTTON' && target.dataset.filename) {
            removeFile(target.dataset.filename);
        }
    }
    fileListContainerEl?.addEventListener('click', onRemoveFileClickHandler as any);

    return () => {
       saveCacheBtnEl?.removeEventListener('click', onSaveCache);
       filterInputEl?.removeEventListener('input', onFilterChange);
       mobileFilterEl?.removeEventListener('input', onFilterChange);
       startDateEl?.removeEventListener('input', onFilterChange);
       endDateEl?.removeEventListener('input', onFilterChange);
       typeFilterEl?.removeEventListener('change', onFilterChange);
       clearBtnEl?.removeEventListener('click', onClear);
       uploaderEl?.removeEventListener('change', onUploaderChange);
       exportCsvBtnEl?.removeEventListener('click', onExportCsv);
       exportPdfBtnEl?.removeEventListener('click', onExportPdf);
      if (fileListContainerEl) {
        fileListContainerEl.removeEventListener('click', onRemoveFileClickHandler as any);
      }
    }

  }, [scriptsLoaded]);


  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js" onReady={handleScriptsLoaded} strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js" strategy="afterInteractive" />

      <div className="card bg-base-100 shadow-xl border border-base-content/10">
          <div className="card-body p-4 md:p-6">
              
              {/* Header & Upload */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-base-content/10 gap-4">
                  <div>
                  <h2 className="card-title text-2xl text-base-content">PDF Content Filter</h2>
                  <p className="text-base-content/60 text-sm mt-1">Analyze your statements securely.</p>
                  </div>
                  <div className="w-full md:w-auto">
                  <label className="form-control w-full md:max-w-xs">
                      <div className="label p-1">
                      <span className="label-text-alt text-base-content/60">Upload PDF File(s)</span>
                      </div>
                      <input type="file" id="pdfUploader" ref={ui.uploader} onChange={onUploaderChange} className="file-input file-input-bordered file-input-primary w-full file-input-sm" accept="application/pdf" multiple />
                  </label>
                  </div>
              </div>

              {/* File List Section */}
              <div id="fileListSection" ref={ui.fileListSection} className="mb-6 hidden">
                  <h3 className="text-sm font-bold text-base-content/70 mb-2 uppercase tracking-wider">Uploaded Files:</h3>
                  <div id="fileListContainer" ref={ui.fileListContainer} className="flex flex-wrap gap-2">
                  {/* File tags will appear here */}
                  </div>
              </div>

              {/* Filter Controls */}
              <div className="bg-base-200/50 p-4 rounded-xl border border-base-content/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  
                  {/* Text Filter */}
                  <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">Search</span></label>
                      <input id="filterInput" ref={ui.filterInput} type="text" placeholder="Text or ID..." className="input input-bordered w-full input-sm" disabled />
                  </div>

                  {/* Mobile Filter */}
                  <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">Mobile No</span></label>
                      <input id="mobileFilter" ref={ui.mobileFilter} type="text" placeholder="017..." className="input input-bordered w-full input-sm" disabled />
                  </div>

                  {/* Type Filter */}
                  <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">Type</span></label>
                      <select id="typeFilter" ref={ui.typeFilter} className="select select-bordered w-full select-sm" disabled>
                      <option value="">All Types</option>
                      </select>
                  </div>

                  {/* Start Date */}
                  <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">From</span></label>
                      <input id="startDate" ref={ui.startDate} type="date" className="input input-bordered w-full input-sm" disabled />
                  </div>
                  
                  {/* End Date */}
                  <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">To</span></label>
                      <input id="endDate" ref={ui.endDate} type="date" className="input input-bordered w-full input-sm" disabled />
                  </div>

                  {/* Clear Button */}
                  <div className="form-control flex flex-row items-end">
                      <button id="clearButton" ref={ui.clearBtn} className="btn btn-ghost btn-sm w-full border-base-content/20" disabled>
                      Clear All
                      </button>
                  </div>
                  </div>
                  
                  {/* Export Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-base-content/5">
                  <button id="exportButton" ref={ui.exportCsvBtn} className="btn btn-success btn-outline btn-sm gap-2" disabled>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export CSV
                  </button>
                  <button id="exportPdfButton" ref={ui.exportPdfBtn} className="btn btn-error btn-outline btn-sm gap-2" disabled>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Export PDF
                  </button>
                  </div>
              </div>
              
              {/* Loading Spinner */}
              <div id="loadingSpinner" ref={ui.loader} className="flex flex-col items-center justify-center my-12 hidden">
                  <span className="loading loading-bars loading-lg text-primary"></span>
                  <p className="mt-3 text-base-content/60 font-medium animate-pulse">Processing PDF...</p>
              </div>

              {/* Summary Stats */}
              <div id="summarySection" ref={ui.summary} className="flex flex-col gap-4 w-full mt-6 hidden">
                  {/* Counts */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
                          <div className="stat-title text-xs uppercase font-bold opacity-60">Total Rows</div>
                          <div id="totalItems" ref={ui.totalCount} className="stat-value text-primary text-xl">0</div>
                      </div>
                      <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
                          <div className="stat-title text-xs uppercase font-bold opacity-60">Filtered Rows</div>
                          <div id="filteredItems" ref={ui.filteredCount} className="stat-value text-secondary text-xl">0</div>
                      </div>
                  </div>
                  {/* Calculations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
                          <div className="stat-title text-xs uppercase font-bold opacity-60 text-success">Total In (Cash In)</div>
                          <div id="sumIn" ref={ui.sumIn} className="stat-value text-success text-xl">0.00</div>
                      </div>
                      <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
                          <div className="stat-title text-xs uppercase font-bold opacity-60 text-base-content">Total Out (Cash Out)</div>
                          <div id="sumOut" ref={ui.sumOut} className="stat-value text-base-content text-xl">0.00</div>
                      </div>
                      <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
                          <div className="stat-title text-xs uppercase font-bold opacity-60 text-error">Total Charge</div>
                          <div id="sumCharge" ref={ui.sumCharge} className="stat-value text-error text-xl">0.00</div>
                      </div>
                  </div>
              </div>

              {/* Results Table */}
              <div id="resultContainer" ref={ui.resultContainer} className="border border-base-content/10 rounded-xl overflow-hidden hidden mt-4 bg-base-100 shadow-inner">
                  <div className="overflow-x-auto h-[500px] scrollbar-thin">
                  <table className="table table-sm table-zebra table-pin-rows w-full">
                      <thead>
                      <tr className="bg-base-200 text-base-content font-bold">
                          <th className="w-24">Date</th>
                          <th className="w-32">Type</th>
                          <th>Details</th>
                          <th className="w-32">TRX ID</th>
                          <th className="text-right w-24">Out</th>
                          <th className="text-right w-24">In</th>
                          <th className="text-right w-24">Charge</th>
                          <th className="text-right w-28">Balance</th>
                      </tr>
                      </thead>
                      <tbody id="resultTableBody" ref={ui.tableBody} className="text-xs md:text-sm font-mono">
                      {/* Rows injected here */}
                      </tbody>
                  </table>
                  </div>
              </div>
              
              {/* Empty State */}
              <div id="emptyState" ref={ui.emptyState} className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-base-content/10 rounded-xl mt-4 bg-base-200/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-base-content/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-base-content/50 font-medium">No data loaded.</p>
              </div>
          </div>
      </div>

      {/* Modals and Toast */}
      <dialog id="cache_modal" ref={ui.cacheModal} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box border border-base-content/10">
          <h3 className="font-bold text-lg">Cache Settings</h3>
          <p className="py-4 text-base-content/70">Select cache duration:</p>
          <select id="cacheDurationSelect" className="select select-bordered w-full mb-4">
              <option value="1">1 Day</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
          </select>
          <div className="modal-action">
            <form method="dialog">
               <button id="saveCacheBtn" ref={ui.saveCacheBtn} className="btn btn-primary">Save & Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog id="password_modal" ref={ui.passwordModal} className="modal">
        <div className="modal-box border border-error/20">
          <h3 className="font-bold text-lg text-error">Password Protected</h3>
          <p className="py-4">Enter password to unlock PDF:</p>
          <p id="password_error" ref={ui.passwordError} className="text-error text-sm mb-2 hidden font-bold">Incorrect password.</p>
          <input type="password" id="passwordInput" ref={ui.passwordInput} placeholder="Password" className="input input-bordered input-error w-full mb-4" />
          <div className="modal-action">
            <button id="cancelPasswordBtn" ref={ui.cancelPassBtn} className="btn btn-ghost">Cancel</button>
            <button id="submitPasswordBtn" ref={ui.submitPassBtn} className="btn btn-error">Unlock</button>
          </div>
        </div>
      </dialog>
      
      <div id="toastContainer" ref={ui.toastContainer} className="toast toast-top toast-end z-50"></div>
    </>
  );
}
