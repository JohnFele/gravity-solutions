import { AiOutlineLoading3Quarters } from "react-icons/ai";

const DataFetchLoader = ({ message = "Loading data..." }) => {
  return (
    <div
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 min-h-[280px] flex flex-col items-center justify-center text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <AiOutlineLoading3Quarters className="w-8 h-8 text-cyan-300 animate-spin mb-4" />
      <p className="text-slate-300">{message}</p>
    </div>
  );
};

export default DataFetchLoader;