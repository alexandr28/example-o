# Sistema de Atajos de Teclado

Sistema global de gestión de atajos de teclado (hotkeys) para mejorar la productividad y experiencia de usuario en la aplicación.

## Características

- ✅ **Hooks personalizados** (`useHotkeys`, `useKeyPress`) para manejar atajos
- ✅ **Command Manager global** usando React Context
- ✅ **Registro de comandos por módulo** para evitar conflictos
- ✅ **Soporte para modificadores** (Ctrl, Alt, Shift, Meta/Cmd)
- ✅ **Habilitación/deshabilitación dinámica** de comandos
- ✅ **Helper visual** para mostrar atajos disponibles
- ✅ **Tooltips** en botones mostrando los atajos

## Arquitectura

```
src/
├── hooks/
│   ├── useHotkeys.ts          # Hook principal para atajos
│   ├── useKeyPress.ts         # Hook simple para detección de teclas
│   └── useModuleHotkeys.ts    # Hook para módulos con registro automático
├── context/
│   └── CommandContext.tsx     # Command Manager global
└── components/
    └── common/
        └── HotkeyHelper.tsx   # Componente helper visual
```

## Uso Básico

### 1. Importar hooks necesarios

```tsx
import { useModuleHotkeys } from '../../hooks/useModuleHotkeys';
import HotkeyHelper from '../common/HotkeyHelper';
```

### 2. Registrar atajos en tu componente

```tsx
const MiComponente: React.FC = () => {
  // Tus funciones de acción
  const handleGuardar = () => {
    console.log('Guardando...');
  };

  const handleCancelar = () => {
    console.log('Cancelando...');
  };

  // Registrar atajos del módulo
  useModuleHotkeys('Mi Módulo', [
    {
      id: 'guardar',
      name: 'Guardar',
      description: 'Guardar los cambios actuales',
      hotkey: { key: 'F4', preventDefault: true },
      action: handleGuardar,
      icon: 'save'
    },
    {
      id: 'cancelar',
      name: 'Cancelar',
      description: 'Cancelar la operación',
      hotkey: { key: 'Escape', preventDefault: true },
      action: handleCancelar,
      icon: 'cancel'
    },
    {
      id: 'buscar',
      name: 'Buscar',
      description: 'Buscar registros',
      hotkey: { key: 'F', ctrl: true, preventDefault: true },
      action: () => console.log('Buscando...'),
      icon: 'search'
    }
  ]);

  return (
    <div>
      {/* Tu contenido */}

      {/* Helper visual (opcional) */}
      <HotkeyHelper showButton={true} />
    </div>
  );
};
```

### 3. Agregar tooltips a botones

```tsx
<Tooltip title="Guardar (F4)" arrow>
  <Button onClick={handleGuardar}>
    Guardar
  </Button>
</Tooltip>
```

## Configuración de Atajos

### Estructura de HotkeyConfig

```typescript
interface HotkeyConfig {
  key: string;           // Tecla principal (ej: 'F1', 'Enter', 's')
  ctrl?: boolean;        // Requiere Ctrl presionado
  alt?: boolean;         // Requiere Alt presionado
  shift?: boolean;       // Requiere Shift presionado
  meta?: boolean;        // Requiere Meta/Cmd presionado
  preventDefault?: boolean;  // Prevenir comportamiento por defecto
  enabled?: boolean;     // Habilitar/deshabilitar dinámicamente
}
```

### Ejemplos de Atajos

```typescript
// Tecla de función simple
{ key: 'F2', preventDefault: true }

// Ctrl + tecla
{ key: 'S', ctrl: true, preventDefault: true }

// Ctrl + Shift + tecla
{ key: 'P', ctrl: true, shift: true, preventDefault: true }

// Alt + tecla
{ key: 'N', alt: true, preventDefault: true }

// Tecla especial
{ key: 'Escape', preventDefault: true }
{ key: 'Enter', preventDefault: true }
```

## Atajos Implementados en Pagos

| Atajo | Acción | Descripción |
|-------|--------|-------------|
| `F2` | Buscar Contribuyente | Abre el modal de búsqueda |
| `F3` | Ver Deuda | Muestra la deuda del contribuyente |
| `F4` | Grabar | Guarda el pago actual |
| `F5` | Nuevo | Limpia el formulario |
| `F6` | Imprimir Recibo | Genera e imprime el recibo |
| `Ctrl+L` | Limpiar Conceptos | Elimina todos los conceptos |

## Command Manager Global

El Command Manager es un contexto global que gestiona todos los comandos registrados.

### Hooks disponibles

```typescript
// Hook principal
const {
  activeModule,           // Módulo actualmente activo
  setActiveModule,        // Establecer módulo activo
  registerCommand,        // Registrar un comando
  unregisterCommand,      // Desregistrar un comando
  getModuleCommands,      // Obtener comandos de un módulo
  getAllCommands,         // Obtener todos los comandos
  executeCommand,         // Ejecutar un comando por ID
  clearModuleCommands     // Limpiar comandos de un módulo
} = useCommands();
```

### Registro Manual de Comandos

```typescript
import { useCommands } from '../context/CommandContext';

const MiComponente: React.FC = () => {
  const { registerCommand, unregisterCommand } = useCommands();

  useEffect(() => {
    const command = {
      id: 'mi-comando',
      name: 'Mi Comando',
      description: 'Descripción del comando',
      hotkey: { key: 'F1' },
      action: () => console.log('Ejecutando...'),
      module: 'Mi Módulo'
    };

    registerCommand(command);

    return () => {
      unregisterCommand('mi-comando');
    };
  }, []);
};
```

## HotkeyHelper - Ayuda Visual

El componente `HotkeyHelper` muestra un botón flotante que abre un diálogo con todos los atajos disponibles para el módulo activo.

```tsx
<HotkeyHelper showButton={true} />
```

### Características

- Botón flotante en la esquina inferior derecha
- Tabla con todos los atajos del módulo activo
- Indicadores de estado (Activo/Deshabilitado)
- Formato visual de las combinaciones de teclas

## Mejores Prácticas

1. **Usa teclas de función (F1-F12)** para acciones principales
2. **Combina Ctrl/Alt con letras** para acciones secundarias
3. **Usa Escape** para cerrar modales o cancelar
4. **Usa Enter** para confirmar/guardar en modales
5. **Proporciona tooltips** en todos los botones con atajos
6. **Deshabilita atajos** cuando la acción no esté disponible
7. **Documenta todos los atajos** en el componente

## Prevención de Conflictos

El sistema automáticamente:
- Registra/desregistra comandos al montar/desmontar componentes
- Previene que los atajos funcionen en inputs/textareas
- Permite override con `preventDefault: false`
- Gestiona jerarquía por módulo activo

## Debugging

El sistema incluye logs en consola:

```
✅ Comando registrado: Buscar (F2) - Módulo: Pagos
⚡ [Pagos] Ejecutando: Buscar
📦 Módulo "Pagos" activado con 6 comandos
❌ Comando desregistrado: Buscar - Módulo: Pagos
```

## Extensión Futura

- [ ] Persistencia de atajos personalizados en localStorage
- [ ] Interfaz de configuración de atajos
- [ ] Soporte para secuencias de teclas (ej: "Ctrl+K Ctrl+S")
- [ ] Grabación de macros
- [ ] Export/Import de configuraciones

## Soporte de Navegadores

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Notas Técnicas

- Los atajos no funcionan en inputs/textareas por defecto
- Se usa `preventDefault()` para evitar comportamientos nativos del navegador
- Los modificadores (Ctrl, Alt, etc.) son case-insensitive
- Las teclas son comparadas en lowercase

## Ejemplo Completo

Ver implementación completa en:
- `src/components/caja/Pagos.tsx`
