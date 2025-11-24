
import React from 'react';

type FilterControlsProps = {
  filterValues: {
    text: string;
    mobile: string;
    type: string;
    startDate: string;
    endDate: string;
  };
  setFilterValues: React.Dispatch<React.SetStateAction<any>>;
  uniqueTypes: string[];
  onClear: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  hasData: boolean;
};

const FilterControls: React.FC<FilterControlsProps> = ({
  filterValues,
  setFilterValues,
  uniqueTypes,
  onClear,
  onExportCsv,
  onExportPdf,
  hasData,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFilterValues((prev: any) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-base-200/50 p-4 rounded-xl border border-base-content/5">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">Search</span></label>
          <input id="text" value={filterValues.text} onChange={handleInputChange} type="text" placeholder="Text or ID..." className="input input-bordered w-full input-sm" disabled={!hasData} />
        </div>

        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">Mobile No</span></label>
          <input id="mobile" value={filterValues.mobile} onChange={handleInputChange} type="text" placeholder="017..." className="input input-bordered w-full input-sm" disabled={!hasData} />
        </div>

        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">Type</span></label>
          <select id="type" value={filterValues.type} onChange={handleInputChange} className="select select-bordered w-full select-sm" disabled={!hasData}>
            <option value="">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">From</span></label>
          <input id="startDate" value={filterValues.startDate} onChange={handleInputChange} type="date" className="input input-bordered w-full input-sm" disabled={!hasData} />
        </div>
        
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/60">To</span></label>
          <input id="endDate" value={filterValues.endDate} onChange={handleInputChange} type="date" className="input input-bordered w-full input-sm" disabled={!hasData} />
        </div>

        <div className="form-control flex flex-row items-end">
          <button onClick={onClear} className="btn btn-ghost btn-sm w-full border-base-content/20" disabled={!hasData}>
            Clear All
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-base-content/5">
        <button onClick={onExportCsv} className="btn btn-success btn-outline btn-sm gap-2" disabled={!hasData}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
        <button onClick={onExportPdf} className="btn btn-error btn-outline btn-sm gap-2" disabled={!hasData}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default FilterControls;
