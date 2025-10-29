// src/context/CommandContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HotkeyConfig, formatHotkey } from '../hooks/useHotkeys';

export interface Command {
  id: string;
  name: string;
  description: string;
  hotkey: HotkeyConfig;
  action: () => void;
  module: string;
  enabled?: boolean;
  icon?: string;
}

export interface ModuleCommands {
  moduleName: string;
  commands: Command[];
}

interface CommandContextType {
  activeModule: string | null;
  setActiveModule: (module: string | null) => void;
  registerCommand: (command: Command) => void;
  unregisterCommand: (commandId: string) => void;
  getModuleCommands: (module: string) => Command[];
  getAllCommands: () => Command[];
  executeCommand: (commandId: string) => void;
  clearModuleCommands: (module: string) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

interface CommandProviderProps {
  children: ReactNode;
}

export const CommandProvider: React.FC<CommandProviderProps> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [commands, setCommands] = useState<Map<string, Command>>(new Map());

  // Registrar un comando
  const registerCommand = useCallback((command: Command) => {
    setCommands(prev => {
      const newCommands = new Map(prev);
      newCommands.set(command.id, command);
      console.log(`✅ Comando registrado: ${command.name} (${formatHotkey(command.hotkey)}) - Módulo: ${command.module}`);
      return newCommands;
    });
  }, []);

  // Desregistrar un comando
  const unregisterCommand = useCallback((commandId: string) => {
    setCommands(prev => {
      const newCommands = new Map(prev);
      const command = newCommands.get(commandId);
      if (command) {
        console.log(`❌ Comando desregistrado: ${command.name} - Módulo: ${command.module}`);
        newCommands.delete(commandId);
      }
      return newCommands;
    });
  }, []);

  // Obtener comandos de un módulo específico
  const getModuleCommands = useCallback((module: string): Command[] => {
    return Array.from(commands.values()).filter(cmd => cmd.module === module);
  }, [commands]);

  // Obtener todos los comandos
  const getAllCommands = useCallback((): Command[] => {
    return Array.from(commands.values());
  }, [commands]);

  // Ejecutar un comando por ID
  const executeCommand = useCallback((commandId: string) => {
    const command = commands.get(commandId);
    if (command && command.enabled !== false) {
      console.log(`⚡ Ejecutando comando: ${command.name}`);
      command.action();
    }
  }, [commands]);

  // Limpiar todos los comandos de un módulo
  const clearModuleCommands = useCallback((module: string) => {
    setCommands(prev => {
      const newCommands = new Map(prev);
      Array.from(newCommands.values())
        .filter(cmd => cmd.module === module)
        .forEach(cmd => newCommands.delete(cmd.id));
      console.log(`🧹 Comandos limpiados para módulo: ${module}`);
      return newCommands;
    });
  }, []);

  const value: CommandContextType = {
    activeModule,
    setActiveModule,
    registerCommand,
    unregisterCommand,
    getModuleCommands,
    getAllCommands,
    executeCommand,
    clearModuleCommands,
  };

  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
};

// Hook para usar el contexto de comandos
export const useCommands = (): CommandContextType => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommands debe ser usado dentro de un CommandProvider');
  }
  return context;
};

// Hook para registrar comandos de un módulo
export const useModuleCommands = (moduleName: string, commands: Omit<Command, 'module'>[]) => {
  const { registerCommand, unregisterCommand, setActiveModule } = useCommands();

  React.useEffect(() => {
    // Registrar módulo activo
    setActiveModule(moduleName);

    // Registrar todos los comandos del módulo
    const fullCommands = commands.map(cmd => ({
      ...cmd,
      module: moduleName,
    }));

    fullCommands.forEach(cmd => registerCommand(cmd));

    console.log(`📦 Módulo "${moduleName}" activado con ${fullCommands.length} comandos`);

    // Cleanup: desregistrar comandos cuando el componente se desmonte
    return () => {
      fullCommands.forEach(cmd => unregisterCommand(cmd.id));
      console.log(`📦 Módulo "${moduleName}" desactivado`);
    };
  }, [moduleName, registerCommand, unregisterCommand, setActiveModule]);
};
