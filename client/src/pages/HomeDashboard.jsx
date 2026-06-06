import { useState } from "react";
import { Users, Calendar, DollarSign, BookOpen, Heart } from "lucide-react";
import Tile from "../components/Tile";
import MinistriesExpand from "../components/MinistriesExpand";

const HomeDashboard = () => {
  const [showMinistries, setShowMinistries] = useState(false);

  const handleTileClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-5xl font-bold mb-3">Welcome Back</h2>
        <p className="text-xl text-slate-400">Choose what you'd like to explore today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Tile
          icon={Users}
          label="Members"
          count="1,248"
          color="blue"
          onClick={() => handleTileClick("/profile")}
        />
        <Tile
          icon={Calendar}
          label="Events"
          count="12"
          color="emerald"
          onClick={() => handleTileClick("/events")}
        />
        <Tile
          icon={DollarSign}
          label="Donations"
          count="$8.4k"
          color="amber"
          onClick={() => alert("Donations page coming soon")}
        />
        <Tile
          icon={BookOpen}
          label="Sermons"
          count="45"
          color="violet"
          onClick={() => alert("Sermons coming soon")}
        />

        <div className="lg:col-span-2 xl:col-span-1">
          <Tile
            icon={Heart}
            label="Ministries"
            count="8 Active"
            color="rose"
            onClick={() => setShowMinistries(!showMinistries)}
            isExpandable
          />
        </div>
      </div>

      {showMinistries && <MinistriesExpand />}
    </div>
  );
};

export default HomeDashboard;
