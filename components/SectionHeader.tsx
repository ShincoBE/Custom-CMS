import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent mb-2 pb-2"
          dangerouslySetInnerHTML={{ __html: title }}
      />
      <div className="w-24 h-1 bg-green-600 mx-auto rounded mb-4"></div>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto"
         dangerouslySetInnerHTML={{ __html: subtitle }}
      />
    </div>
  );
}

export default SectionHeader;
