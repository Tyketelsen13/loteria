/**
 * Fixed-position copyright footer in bottom-right corner
 */
export default function CopyrightFooter() {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-tan-80 rounded-full shadow px-4 py-2 flex items-center gap-2 text-gray-700 text-sm select-none">
      {/* Copyright symbol with accessibility */}
      <span aria-label="Copyright" title="Copyright">
        &copy;
      </span>
      <span>Ketelsencoding</span>
    </div>
  );
}
