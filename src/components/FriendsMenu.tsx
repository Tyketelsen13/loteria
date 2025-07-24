"use client";
import { useState } from "react";

const friendsList = [
  { name: "Alice", online: true },
  { name: "Bob", online: false },
  { name: "Carlos", online: true },
];

export default function FriendsMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      <button
        aria-label="Friends"
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M7 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M1 21v-2a4 4 0 0 1 3-3.87"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col gap-3 border border-gray-100 dark:border-gray-700 z-50">
          <input
            type="text"
            placeholder="Add/search friends..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 rounded border border-gray-200 dark:bg-gray-900 dark:border-gray-700 mb-2"
          />
          <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Online Friends</div>
          <ul className="mb-2">
            {friendsList.filter(f => f.online && f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
              <li key={f.name} className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                <span>{f.name}</span>
                <button className="ml-auto text-blue-600 hover:underline text-xs">Message</button>
              </li>
            ))}
            {friendsList.filter(f => f.online && f.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <li className="text-gray-400 text-xs">No online friends</li>
            )}
          </ul>
          <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">All Friends</div>
          <ul>
            {friendsList.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
              <li key={f.name} className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full inline-block ${f.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span>{f.name}</span>
                <button className="ml-auto text-blue-600 hover:underline text-xs">Message</button>
              </li>
            ))}
            {friendsList.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <li className="text-gray-400 text-xs">No friends found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
