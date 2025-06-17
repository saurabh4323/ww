import { useState, useEffect } from "react";

// Navbar Component
function Navbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation items array
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/user/dashboard" },
    { name: "Profile", href: "/user/profile" },
    { name: "Register", href: "/user/register" },
  ];

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle navigation
  const handleNavigation = (href) => {
    // For demo purposes, show alert with the route
    // In a real app, you'd use React Router's navigate or window.location
    // alert(`Navigating to: ${href}`);

    // Uncomment below for actual navigation (requires React Router)
    window.location.href = href;

    // Or use basic window navigation:
    // window.location.href = href;

    // Close mobile menu after navigation
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-2xl border-b-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-white rounded-full flex items-center justify-center mr-3 shadow-lg border-2 border-green-600">
              <span className="text-lg font-bold text-green-800">⭐</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wider">
                SENADRIVE
              </h1>
              <p className="text-orange-300 text-xs font-medium">
                Indian Army Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-white hover:text-orange-300 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-white/20 cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Time & User Info - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-white/80 font-mono bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-green-400 mr-2">🕐</span>
              {currentTime}
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <span>🇮🇳</span>
              <span>Service Before Self</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-orange-300 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-4 space-y-2 bg-white/10 backdrop-blur-lg rounded-lg mt-2 border border-white/20">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-white hover:text-orange-300 hover:bg-white/10 block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 cursor-pointer"
                >
                  {item.name}
                </button>
              ))}

              {/* Current Time - Mobile */}
              <div className="px-4 py-2">
                <div className="text-sm text-white/80 font-mono bg-white/10 px-4 py-2 rounded-lg inline-block backdrop-blur-sm border border-white/20">
                  <span className="text-green-400 mr-2">🕐</span>
                  {currentTime}
                </div>
              </div>

              {/* Mobile motto */}
              <div className="px-4 py-2">
                <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                  <span>🇮🇳</span>
                  <span>Service Before Self</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
