"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  RiDashboardLine, 
  RiBarChartBoxLine, 
  RiAddBoxLine, 
  RiSettings4Line 
} from "react-icons/ri";
import './bottonmNav.css'
export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/", icon: <RiDashboardLine /> },
    { label: "Analytics", path: "/analytics", icon: <RiBarChartBoxLine /> },
    { label: "Add", path: "/add", icon: <RiAddBoxLine /> },
    { label: "Settings", path: "/settings", icon: <RiSettings4Line /> },
  ];

  return (
    <nav className="bottomNav">
      <div className="navContainer">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`navItem ${isActive ? "activeItem" : ""}`}
            >
              <span className="navIcon">{item.icon}</span>
              <span className="navLabel">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}