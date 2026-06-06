const Events = () => {
  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-5xl font-bold mb-4">Upcoming Events</h1>
      <p className="text-slate-400 mb-10">Join us in fellowship and worship</p>
      
      <div className="grid gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-2">Sunday Worship Service</h3>
              <p className="text-slate-400 mb-1">Every Sunday at 9:00 AM • Main Hall</p>
              <p className="text-amber-400">Live • In Person</p>
              <button className="mt-6 bg-amber-600 hover:bg-amber-500 px-8 py-3 rounded-2xl font-medium transition-all">RSVP Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
