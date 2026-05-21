import { AiOutlineSearch } from "react-icons/ai";

const SearchBar = ({ searchQuery, setSearchQuery, searchPlaceholder }) => {
  const queryValue = typeof searchQuery === "string" ? searchQuery : "";

  const handleChange = (event) => {
    if (typeof setSearchQuery === "function") {
      setSearchQuery(event.target.value);
    }
  };

  return (
    <div className="relative flex-1 lg:flex-none">
      <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        type="text"
        placeholder={searchPlaceholder || "Search"}
        value={queryValue}
        onChange={handleChange}
        className="bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full lg:w-80"
      />
    </div>
  );
};

export default SearchBar;
