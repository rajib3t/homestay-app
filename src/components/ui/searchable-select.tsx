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

  // Keep the latest onSearch/options in refs so the search effect below can
  // read current values without needing them in its dependency array. If
  // they were real deps, every time the parent passes a new function/array
  // reference (which happens often with cascading selects) this effect
  // would tear down and reschedule its debounce timer, re-firing onSearch
  // with a stale query even though the user typed nothing new.
  const onSearchRef = React.useRef(onSearch);
  onSearchRef.current = onSearch;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  // Set to true right when the user picks an item from the dropdown. We use
  // this to suppress the search effect that would otherwise fire because
  // selecting an option also sets `query` to the option's label (so the
  // input displays the selected text).
  const suppressNextSearchRef = React.useRef(false);

  // Set alongside suppressNextSearchRef when the user picks an item, so the
  // value-sync effect below doesn't immediately stomp on the query we just
  // set to the selected option's label.
  const suppressNextValueSyncRef = React.useRef(false);

  React.useEffect(() => {
    setFiltered(options);
  }, [options]);

  // Keep the displayed text in sync with the `value` prop when it changes
  // for reasons other than the user picking something from this dropdown —
  // e.g. a parent field (country) clearing this field (city/location) via
  // form.setFieldValue("city", ""). Without this, the input keeps showing
  // the previously selected label even though the underlying value is gone.
  const prevValueRef = React.useRef(value);
  React.useEffect(() => {
    if (prevValueRef.current === value) return;
    prevValueRef.current = value;

    if (suppressNextValueSyncRef.current) {
      suppressNextValueSyncRef.current = false;
      return;
    }

    if (!value) {
      setQuery("");
      return;
    }

    const found = options.find((o) => String(o.value) === String(value));
    setQuery(found ? found.label : "");
  }, [value, options]);

  // When the component mounts with an existing value, we still want the
  // visible input text to reflect that selection once the options arrive.
  React.useEffect(() => {
    if (!value) return;
    if (query) return;

    const found = options.find((o) => String(o.value) === String(value));
    if (found) setQuery(found.label);
  }, [value, options, query]);

  React.useEffect(() => {
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }

    const activeOnSearch = onSearchRef.current;
    const activeOptions = optionsRef.current;

    if (activeOnSearch) {
      const q = query.trim().toLowerCase();
      if (!q || q.length < 2) {
        setFiltered(activeOptions);
        return;
      }

      let mounted = true;
      const timerId = setTimeout(() => {
        activeOnSearch(query)
          .then((res) => {
            if (mounted) setFiltered(res);
          })
          .catch(() => {
            if (mounted) setFiltered([]);
          });
      }, 1000);

      return () => {
        mounted = false;
        clearTimeout(timerId);
      };
    }

    const q = query.trim().toLowerCase();
    if (!q) return setFiltered(activeOptions);
    setFiltered(activeOptions.filter((o) => o.label.toLowerCase().includes(q)));
    // Only real user-driven query changes should schedule a search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = React.useMemo(() => {
    const found = options.find((o) => String(o.value) === String(value));
    return found ? found.label : "";
  }, [options, value]);

  const handleOpen = React.useCallback(() => {
    // When a value is already selected, reopening the dropdown should show
    // the full option list instead of keeping the previous search text.
    if (value) {
      setQuery("");
      setFiltered(optionsRef.current);
    }
    setOpen(true);
  }, [value]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="w-full border rounded-md px-2 py-1 flex items-center gap-2 cursor-text"
        onClick={handleOpen}
      >
        <input
          id={id}
          name={name}
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
            filtered.map((opt) => (
              <div
                key={String(opt.value)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  suppressNextSearchRef.current = true;
                  suppressNextValueSyncRef.current = true;
                  onChange(String(opt.value));
                  setOpen(false);
                  setQuery(opt.label);
                }}
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
