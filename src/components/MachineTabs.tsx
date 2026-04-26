'use client';

import React from 'react';

interface MachineTabsProps {
  machines: ('RK1' | 'RK2' | 'RK3' | 'RK4')[];
  selectedMachine: 'RK1' | 'RK2' | 'RK3' | 'RK4';
  onSelectMachine: (machine: 'RK1' | 'RK2' | 'RK3' | 'RK4') => void;
}

export default function MachineTabs({
  machines,
  selectedMachine,
  onSelectMachine,
}: MachineTabsProps) {
  return (
    <div className="machine-tabs">
      {machines.map((machine) => (
        <button
          key={machine}
          onClick={() => onSelectMachine(machine)}
          className={`machine-tab ${selectedMachine === machine ? 'active' : ''}`}
        >
          {machine}
        </button>
      ))}
    </div>
  );
}
