// src/components/SideMenu.tsx
import React from 'react';
import Link from 'next/link';

export interface SideMenuItem {
  label: string;
  href: string;
  children?: SideMenuItem[];
}

interface SideMenuProps {
  title: string;
  items: SideMenuItem[];
  currentHref: string;
}

export default function SideMenu({ title, items, currentHref }: SideMenuProps) {
  return (
    <aside className="w-44 flex-shrink-0">
      {/* Menu header */}
      <div
        className="text-white text-sm font-bold text-center py-3 px-2"
        style={{ backgroundColor: '#008c8c' }}
      >
        {title}
      </div>

      {/* Menu items */}
      <div className="bg-white border border-gray-200 border-t-0">
        {items.map((item, idx) => {
          const isActive = currentHref === item.href;
          return (
            <div key={idx}>
              <Link
                href={item.href}
                className={`block px-3 py-2.5 text-sm border-b border-gray-100 transition-colors ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-gray-700 hover:text-white hover:bg-opacity-90'
                }`}
                style={
                  isActive
                    ? { backgroundColor: '#008c8c' }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#008c8c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '';
                  }
                }}
              >
                {item.label}
              </Link>

              {/* Sub-items */}
              {item.children && item.children.length > 0 && (
                <div className="bg-gray-50">
                  {item.children.map((child, cidx) => {
                    const isChildActive = currentHref === child.href;
                    return (
                      <Link
                        key={cidx}
                        href={child.href}
                        className={`block pl-6 pr-3 py-2 text-xs border-b border-gray-100 transition-colors ${
                          isChildActive
                            ? 'text-white font-medium'
                            : 'text-gray-600 hover:text-white'
                        }`}
                        style={
                          isChildActive
                            ? { backgroundColor: '#008c8c' }
                            : undefined
                        }
                        onMouseEnter={(e) => {
                          if (!isChildActive) {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#008c8c';
                            (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isChildActive) {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '';
                            (e.currentTarget as HTMLAnchorElement).style.color = '';
                          }
                        }}
                      >
                        ▸ {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
