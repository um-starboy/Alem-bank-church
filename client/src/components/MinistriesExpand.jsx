import { motion } from "framer-motion";
import { Church, Users, Heart, Book, Music, Baby, Users2 } from "lucide-react";

const ministries = [
  { icon: Church, name: "Main Worship", desc: "Sunday Services" },
  { icon: Users, name: "Youth Ministry", desc: "Ages 13-25" },
  { icon: Heart, name: "Prayer & Healing", desc: "Intercessory" },
  { icon: Book, name: "Bible Study", desc: "Weekly Groups" },
  { icon: Music, name: "Praise & Worship", desc: "Choir & Band" },
  { icon: Baby, name: "Children Ministry", desc: "Ages 3-12" },
  { icon: Users2, name: "Women Ministry", desc: "Fellowship" },
];

const MinistriesExpand = () => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-10 bg-slate-900/70 border border-slate-700 rounded-3xl p-8"
    >
      <h3 className="text-3xl font-bold mb-8 text-center">Our Ministries</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministries.map((min, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <min.icon className="w-10 h-10 text-amber-500" />
              <h4 className="text-xl font-semibold">{min.name}</h4>
            </div>
            <p className="text-slate-400">{min.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MinistriesExpand;
