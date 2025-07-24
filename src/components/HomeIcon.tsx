import Link from "next/link";

/**
 * Fixed-position floating home button for navigation back to dashboard
 */
export default function HomeIcon() {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="fixed top-4 left-4 z-50 bg-white/80 rounded-full shadow p-2 hover:bg-blue-100 transition"
      passHref
      prefetch={false}
    >
      {/* Universal house icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6"
        />
      </svg>
    </Link>
  );
}