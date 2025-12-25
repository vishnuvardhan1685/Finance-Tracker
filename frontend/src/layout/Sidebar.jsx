import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Wallet, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/regular-activities', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/summary', icon: Wallet, label: 'Summary' },
    { href: '/stats', icon: BarChart3, label: 'Stats' },
];

const Sidebar = () => {
    return (
        <aside className="flex flex-col w-64 border-r border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-8">
                <Landmark className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">Financier</span>
            </div>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                    cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-accent text-primary'
                    )
                    }
                >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar;