import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Stock } from "../types/stock";

const StockSearch = ({ onSelectStock }: { onSelectStock: (stock: Stock | null) => void }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stocks"), (snapshot) => {
      const stockData: Stock[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stock[];
      setStocks(stockData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );

      filtered.sort((a, b) => {
        const aStartsWith =
          a.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          a.symbol.toLowerCase().startsWith(searchTerm.toLowerCase());
        const bStartsWith =
          b.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          b.symbol.toLowerCase().startsWith(searchTerm.toLowerCase());

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      });

      setFilteredStocks(filtered);
    }
  }, [searchTerm, stocks]);

  return (
    <Autocomplete
      options={filteredStocks}
      getOptionLabel={(option) => `${option.name} (${option.symbol}) - ₹ ${option.price}`}
      filterOptions={(x) => x} // Custom filter already applied
      onChange={(_, newValue) => onSelectStock(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Stock"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <strong>{option.name}</strong> ({option.symbol}) - ₹{option.price}
        </li>
      )}
    />
  );
};

export default StockSearch;
