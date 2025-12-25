import React from "react";
import { Link } from "react-router-dom";
import { UserCircle2 } from "lucide-react";
import useAuthStore from "../stores/authStore";
import { Button } from "@/components/ui/Button";

const Navbar = () => {
    const user = useAuthStore((state) => state.user);
    return (
        <header className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">
            Finance Tracker
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Link to="/profile">
            <Button variant="ghost" size="icon">
                <UserCircle2 className="w-6 h-6" />
            </Button>
            </Link>
        </div>
        </header>
    );
};

export default Navbar;