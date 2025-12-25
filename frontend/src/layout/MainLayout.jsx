import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Wallet, LogOut, CreditCard } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { Button } from "@/components/ui/Button";

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    
    const isActive = (path) => {
        return location.pathname === path;
    };
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    return (
        <div className="flex flex-col h-screen bg-[color:var(--ft-bg)]">
            {/* Header */}
            <header className="px-4 md:px-6 py-3 md:py-4 border-b border-[color:var(--ft-border)] bg-[color:var(--ft-surface)]/70 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--ft-surface)]/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-white/90 to-white/70 rounded-lg flex items-center justify-center">
                            <Wallet className="w-4 h-4 md:w-6 md:h-6 text-black" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-base md:text-xl font-bold text-[color:var(--ft-text)]">Finance Tracker</h1>
                            <p className="text-xs text-[color:var(--ft-muted)]">Manage your finances</p>
                        </div>
                    </div>
                    
                    <nav className="flex items-center gap-2 md:gap-4 flex-wrap">
                        <Link
                            to="/"
                            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm md:text-base ${
                                isActive('/') 
                                    ? 'bg-[color:var(--ft-accent)] text-black font-medium' 
                                    : 'text-[color:var(--ft-muted)] hover:bg-[color:var(--ft-surface-2)] hover:text-[color:var(--ft-text)]'
                            }`}
                        >
                            <Home className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline font-medium">Home</span>
                        </Link>
                        <Link
                            to="/stats"
                            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm md:text-base ${
                                isActive('/stats') 
                                    ? 'bg-[color:var(--ft-accent)] text-black font-medium' 
                                    : 'text-[color:var(--ft-muted)] hover:bg-[color:var(--ft-surface-2)] hover:text-[color:var(--ft-text)]'
                            }`}
                        >
                            <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline font-medium">Stats</span>
                        </Link>
                        <Link
                            to="/debts"
                            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm md:text-base ${
                                isActive('/debts') 
                                    ? 'bg-[color:var(--ft-accent)] text-black font-medium' 
                                    : 'text-[color:var(--ft-muted)] hover:bg-[color:var(--ft-surface-2)] hover:text-[color:var(--ft-text)]'
                            }`}
                        >
                            <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline font-medium">Debts</span>
                        </Link>
                        
                        {/* User Menu */}
                        <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-[color:var(--ft-border)]">
                            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--ft-border)] bg-[color:var(--ft-surface-2)]">
                                <div className="w-8 h-8 bg-gradient-to-br from-white/90 to-white/70 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-black">{user?.name?.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm font-medium text-[color:var(--ft-text)]">{user?.name || 'User'}</span>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                size="sm"
                                className="text-[color:var(--ft-muted)] hover:text-[color:var(--ft-danger)] hover:bg-[color:var(--ft-danger)]/10 p-1.5 md:p-2"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[color:var(--ft-bg)]">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;