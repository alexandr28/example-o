// src/components/debug/SimpleDebug.tsx
import React from 'react';

const SimpleDebug = () => {
  return (
    <div className="fixed top-0 left-0 bg-red-600 text-white p-2 z-50">
      App está funcionando - {new Date().toLocaleTimeString()}
    </div>
  );
};

export default SimpleDebug;