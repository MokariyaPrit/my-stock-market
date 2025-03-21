// import { useState, useEffect } from "react";
// import { TextField, List, ListItem, ListItemText, Paper } from "@mui/material";
// import { getStocks, scheduleStockUpdates } from "../services/realStockService";
// import { Stock } from "../types/stock";

// interface RealStockSearchProps {
//   onSelectStock: (stock: Stock) => void;
// }

// const RealStockSearch: React.FC<RealStockSearchProps> = ({ onSelectStock }) => {
//   const [query, setQuery] = useState("");
//   const [stocks, setStocks] = useState<Stock[]>([]);
//   const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);

//   useEffect(() => {
//     const fetchInitialStocks = async () => {
//       const initialStocks = await getStocks();
//       setStocks(initialStocks);
//     };
//     fetchInitialStocks();

//     const unsubscribe = scheduleStockUpdates((updatedStocks) => {
//       setStocks(updatedStocks);
//     });

//     return unsubscribe;
//   }, []);

//   useEffect(() => {
//     if (query.trim() === "") {
//       setFilteredStocks([]);
//     } else {
//       setFilteredStocks(
//         stocks.filter((stock) =>
//           stock.name.toLowerCase().includes(query.toLowerCase())
//         )
//       );
//     }
//   }, [query, stocks]);

//   const handleStockSelect = (stock: Stock) => {
//     console.log("Selected stock in search:", stock);
//     onSelectStock(stock);
//     setQuery("");
//   };

//   return (
//     <div>
//       <TextField
//         fullWidth
//         label="Search Real Stocks"
//         variant="outlined"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         margin="normal"
//       />
//       {filteredStocks.length > 0 && (
//         <Paper elevation={3} sx={{ maxHeight: 200, overflowY: "auto" }}>
//           <List>
//             {filteredStocks.map((stock) => (
//               <ListItem
//                 component="div"
//                 key={stock.symbol}
//                 onClick={() => handleStockSelect(stock)}
//                 sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
//               >
//                 <ListItemText primary={stock.name} secondary={`₹${stock.price.toFixed(2)}`} />
//               </ListItem>
//             ))}
//           </List> 
//         </Paper>
//       )}
//     </div>
//   );
// };

// export default RealStockSearch;