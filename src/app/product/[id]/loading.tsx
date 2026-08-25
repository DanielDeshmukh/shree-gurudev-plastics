export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
            <div className="p-4 md:p-6">
              <div className="hidden lg:flex gap-3 items-stretch">
                <div className="flex flex-col gap-2 shrink-0 h-[650px]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[72px] h-[72px] bg-gray-200 rounded-lg animate-pulse shrink-0" />
                  ))}
                </div>
                <div className="flex-1 bg-gray-200 rounded-xl animate-pulse min-w-0" />
                <div className="flex flex-col gap-2.5 shrink-0 h-[650px]">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-12 h-12 bg-gray-200 rounded-full animate-pulse shrink-0" />
                  ))}
                </div>
              </div>
              <div className="lg:hidden">
                <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="p-4 md:p-8 space-y-4 lg:border-l border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse mt-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-full animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
