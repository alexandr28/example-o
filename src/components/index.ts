
// Exportaciones de componentes básicos
export { default as Button } from './ui/Button';
export { default as Input } from './ui/Input';
export { default as Select } from './ui/Select';
export { default as CalendarInput } from './utils/CalendarInput';
export { default as Modal } from './modal/Modal';
export { default as Breadcrumb } from './utils/Breadcrumb';
export { default as BreadcrumbItem } from './utils/Breadcrumb';
export { default as NotificationContainer } from './utils/Notification';

// Exportaciones de componentes específicos

export { default as PersonaForm } from './contribuyentes/PersonaForm';
export { default as ContribuyenteForm } from './contribuyentes/ContribuyenteForm';
export { default as FiltroContribuyenteForm } from './contribuyentes/FiltroContribuyenteForm';
export { default as ContribuyenteList } from './contribuyentes/ContribuyenteList';
export {default as SelectorDirecciones } from './modal/SelectorDirecciones';
export {default as FormSecction }from './utils/FormSecction';


// Exportación de componentes para mantenedores
// Calle
export { default as CalleForm } from './calles/CalleForm';
export {default as CalleList} from  './calles/CalleList';

// Sector
export { default as SectorForm } from './sector/SectorForm';
export { default as SectorList } from './sector/SectorList';
// Barrio
export { default as BarrioForm } from './barrio/BarrioForm';
export { default as BarrioList } from './barrio/BarrioList';
// Direcciones
export { default as DireccionForm } from './direcciones/DireccionForm';
export { default as DireccionList } from './direcciones/DireccionList';
// Aranceles Asignacion
export { default as ArancelForm } from './aranceles/ArancelForm';
export { default as ArancelList } from './aranceles/ArancelList';
// Valores Unitarios
export { default as ValorUnitarioForm } from './unitarios/ValorUnitarioForm';
export { default as ValorUnitarioList } from './unitarios/ValorUnitarioList';


// Exportación centralizada de los componentes UIT
export { default as UIT } from './uit/UIT';
export { default as AlicuotaComponent } from './uit/Alicuota';
export { default as UitForm } from './uit/UitForm';
export { default as UitList } from './uit/UitList';

// Exportación centralizada de los componentes Alcabala
export { default as Alcabala } from './alcabala/Alcabala';
export { default as AlcabalaList } from './alcabala/AlcabalaList';
export { default as AlcabalaForm } from './alcabala/AlcabalaForm';

// Exportación centralizada de los componentes Depreciación
export { default as Depreciacion } from './depreciacion/Depreciacion';
export { default as BuscarDepreciacion } from './depreciacion/BuscarDepreciacion';
export { default as DepreciacionForm } from './depreciacion/DepreciacionForm';

export {default as LoginForm } from './auth/LoginForm'
export {default as ProtectedRoute} from './auth/ProtectedRoute'

export {  EntityForm } from './EntityForm';
export { EntityList } from './EntityList';
export { default as FormErrorBoundary } from './utils/FormErrorBoundary';

//export { DireccionForm } from './contribuyentes/DireccionnForm';
export { ConyugeForm } from './contribuyentes/ConyugeForm';
export { RepresentanteLegalForm } from './contribuyentes/RepresentanteLegalForm';
export { default as FormSection } from './utils/FormSecction';

// Export Predio & Piso
export { default as PredioForm } from './predio/PredioForm';
export {default as ConsultaPredios} from  './predio/ConsultaPredios'
export {default as ConsultaPisos } from './predio/pisos/ConsultaPisos'
export {default as RegistrosPisos} from './predio/pisos/RegistrosPisos'
export {default as  SelectorPredios} from './predio/pisos/SelectorPredios'

// Exportación de componentes de navegación
export { default as SafeLink } from './navigation/SafeLink';
export { default as SafeListItemButton } from './navigation/SafeListItemButton';
export {default as navigationGuard } from './utils/navigationGuard'