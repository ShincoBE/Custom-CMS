import React from 'react';
import { Wrench } from 'phosphor-react';

const MaintenancePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <div className="text-center">
        <Wrench size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Momenteel in onderhoud</h1>
        <p className="text-zinc-400">
          We zijn de website aan het verbeteren. Kom snel terug!
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
