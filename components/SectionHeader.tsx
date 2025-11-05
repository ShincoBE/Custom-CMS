import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="w-24 h-1 bg-green-600 mx-auto mt-4 mb-6 rounded"></div>
      <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

export default SectionHeader;
