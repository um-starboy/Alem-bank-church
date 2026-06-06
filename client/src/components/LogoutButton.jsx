import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-600/90 hover:bg-red-700 px-5 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
    >
      <LogOut size={20} />
      Logout
    </button>
  );
};

export default LogoutButton;
