interface FragrancePyramidProps {
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
}

export function FragrancePyramid({ topNotes, middleNotes, baseNotes }: FragrancePyramidProps) {
  if (!topNotes && !middleNotes && !baseNotes) return null;

  const renderNote = (title: string, notes: string) => (
    <div className="flex flex-col mb-4 last:mb-0">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{title}</span>
      <span className="text-sm text-[#111111]">{notes}</span>
    </div>
  );

  return (
    <div className="flex flex-col space-y-2 p-6 bg-[#FAF8F4] rounded-lg border border-[#ECE8E2]">
      {topNotes && renderNote("Top Notes", topNotes)}
      {middleNotes && renderNote("Heart Notes", middleNotes)}
      {baseNotes && renderNote("Base Notes", baseNotes)}
    </div>
  );
}
