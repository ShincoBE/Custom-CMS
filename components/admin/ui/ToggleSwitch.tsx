import React from 'react';
import HelpTooltip from './HelpTooltip';

interface ToggleSwitchProps {
  label: string;
  help?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch = ({ label, help, enabled, onChange }: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <span className="block text-sm font-medium text-zinc-300">{label}</span>
        {help && <HelpTooltip text={help} />}
      </div>
      <button
        type="button"
        className={`${
          enabled ? 'bg-green-600' : 'bg-zinc-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-800`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;