

import React, { createContext, useContext, useState } from 'react';

export type FilterData = {
  categories?: string[];
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  radius?: number;
  pickupDropoff?: boolean;
  postType?: 'Offering' | 'Requesting' | 'Both';
  location?: { lat: number; lng: number };
  address?: string;
  usageType?: string[];                // e.g. "Short-term", "Long-term"
  securityFeatures?: string[];       // multiple checkboxes
  accessibility?: string[];          // multiple options
  storageType?: 'Indoor' | 'Outdoor' | 'Climate-Controlled'; 

};

type FilterContextType = {
  filters: FilterData | null;
  setFilters: (filters: FilterData | null) => void;
};

const FilterContext = createContext<FilterContextType>({
  filters: null,
  setFilters: () => {},
});

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<FilterData | null>(null);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => useContext(FilterContext);
