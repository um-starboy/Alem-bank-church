import { motion } from "framer-motion";

const Tile = ({ icon: Icon, label, count, color = "amber", onClick, isExpandable }) => {
  const colorClasses = {
    amber: "from-amber-500 to-yellow-600",
    blue: "from-blue-600 to-indigo-600",
    emerald: "from-emerald-500 to-teal-600",
    rose: "from-rose-500 to-pink-600",
    violet: "from-violet-600 to-purple-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -10 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center h-full cursor-pointer border border-white/10 hover:border-white/30`}
    >
      <div className="mb-6">
        <Icon className="w-20 h-20 opacity-90" />
      </div>
      <h3 className="text-2xl font-semibold mb-2 tracking-tight">{label}</h3>
      {count && <p className="text-5xl font-bold mb-1">{count}</p>}
      {isExpandable && <p className="text-sm opacity-75 mt-2">Tap to expand →</p>}
    </motion.div>
  );
};

export default Tile;
