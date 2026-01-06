import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { countries, Country } from "../lib/countries";

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  className?: string;
}

export function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dial_code.includes(search) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between pl-3 pr-2 h-10 font-normal"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2 truncate">
          <span className="text-lg leading-none">{value.flag}</span>
          <span className="truncate">{value.dial_code}</span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-[300px] w-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No country found.
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className={cn(
                      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value.code === country.code && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      onChange(country);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="mr-2 text-lg">{country.flag}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="ml-auto text-muted-foreground text-xs">{country.dial_code}</span>
                    {value.code === country.code && (
                      <Check className="ml-2 h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
