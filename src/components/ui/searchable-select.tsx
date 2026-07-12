import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  name?: string;
  options?: Option[];
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => Promise<Option[]>; // optional async loader
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ id, name, options = [], value, onChange, placeholder = "Search...", className = "", onSearch }) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [filtered, setFiltered] = React.useState<Option[]>(options);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setFiltered(options);
  }, [options]);

  React.useEffect(() => {
    if (onSearch) {
      const q = query.trim().toLowerCase();
      if (!q) {
        setFiltered(options);
        return;
      }
      // Only search if query has at least 2 characters
      if (q.length < 2) {
        setFiltered(options);
        return;
      }
      let mounted = true;
      let timerId: NodeJS.Timeout;
      const timer = setTimeout(() => {
        onSearch(query).then(res => {
          if (mounted) setFiltered(res);
        }).catch(() => {
          if (mounted) setFiltered([]);
        });
      }, 1000);
      timerId = timer;
      return () => { mounted = false; clearTimeout(timerId); };
    }

    const q = query.trim().toLowerCase();
    if (!q) return setFiltered(options);
    setFiltered(options.filter(o => o.label.toLowerCase().includes(q)));
  }, [query, onSearch, options]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = React.useMemo(() => {
    const found = options.find(o => String(o.value) === String(value));
    return found ? found.label : "";
  }, [options, value]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="w-full border rounded-md px-2 py-1 flex items-center gap-2 cursor-text"
        onClick={() => { setOpen(true); }}
      >
        <input
          id={id }
          name={name }
          className="flex-1 outline-none"
          placeholder={selectedLabel || placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <div className="text-sm text-gray-500">▾</div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map(opt => (
              <div
                key={String(opt.value)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => { 
                  
                  onChange(String(opt.value)); setOpen(false); setQuery(opt.label); }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
