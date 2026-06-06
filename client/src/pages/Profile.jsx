const Profile = () => {
  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>
        
        <div className="space-y-8">
          <div>
            <p className="text-slate-400 text-sm">Full Name</p>
            <p className="text-3xl font-medium">Welcome, Member</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Member Since</p>
            <p className="text-2xl font-medium">January 2024</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Ministry Involvement</p>
            <p className="text-2xl font-medium">Praise & Worship Team</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Email</p>
            <p className="text-xl">youremail@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
