export default function BrandsLoading() {
  return (
    <div className="bg-brand-bg-secondary min-h-screen">
      <div className="pt-32 lg:pt-[128px]" />
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24">
        <header className="mb-12 border-b border-brand-border pb-8 animate-pulse">
          <div className="h-12 bg-brand-border/50 w-64 mb-4 rounded"></div>
          <div className="h-6 bg-brand-border/30 w-full max-w-2xl rounded"></div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="flex flex-col bg-white rounded-[18px] border border-[#ECE8E2] overflow-hidden p-[18px] animate-pulse"
            >
              <div className="aspect-[4/3] w-full bg-[#FAF8F4] rounded-t-[17px] mb-4"></div>
              <div className="flex flex-col items-center text-center">
                <div className="h-4 bg-brand-border/50 w-24 mb-2 rounded"></div>
                <div className="h-3 bg-brand-border/30 w-16 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
