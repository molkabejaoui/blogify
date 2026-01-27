import { useState } from "react";

export default function SearchBar({ data, placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length === 0) {
      setResults([]);
      return;
    }

    const filtered = data.filter((item) =>
      item.titre.toLowerCase().includes(value.toLowerCase())
    );

    setResults(filtered.slice(0, 5)); // max 5 suggestions
  };

  const handleSelect = (item) => {
    setQuery("");
    setResults([]);
    onSelect(item);
  };

  return (
    <div className="search-container">
      <input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="search"
      />

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((item) => (
            <li
              key={item.idAr}
              onClick={() => handleSelect(item)}
            >
              <strong>{item.titre}</strong>
              <span>{item.resume?.slice(0, 50)}...</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
