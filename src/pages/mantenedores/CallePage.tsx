import React, { useState, useEffect, useMemo } from 'react';
import {MainLayout} from '../../layout';
import {CalleList,CalleForm,Breadcrumb} from '../../components';
import { BreadcrumbItem } from '../../components/Breadcrumb';


// Tipo para la entidad Calle
interface Calle {
  id: number;
  tipoVia: string;
  nombre: string;
}

// Datos de ejemplo para pruebas
const callesIniciales: Calle[] = [
  { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
  { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
  { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
];

/**
 * Página para administrar las calles del sistema
 * 
 * Permite añadir, editar, eliminar y buscar calles
 */
const CallesPage: React.FC = () => {
  // Estados
  const [calles, setCalles] = useState<Calle[]>(callesIniciales);
  const [calleSeleccionada, setCalleSeleccionada] = useState<Calle | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Calles', active: true }
  ], []);

  // Manejo de selección de calle
  const handleSelectCalle = (calle: Calle) => {
    setCalleSeleccionada(calle);
    setModoEdicion(true);
  };

  // Manejo de guardado de calle (crear o actualizar)
  const handleGuardarCalle = (data: { tipoVia: string, nombre: string }) => {
    if (modoEdicion && calleSeleccionada) {
      // Actualizar calle existente
      setCalles(calles.map(c => 
        c.id === calleSeleccionada.id 
          ? { ...c, ...data } 
          : c
      ));
    } else {
      // Crear nueva calle
      const nuevaCalle = {
        id: Math.max(0, ...calles.map(c => c.id)) + 1,
        ...data,
      };
      setCalles([...calles, nuevaCalle]);
    }
    
    // Resetear estados
    setCalleSeleccionada(null);
    setModoEdicion(false);
  };

  // Manejo de nuevo registro
  const handleNuevo = () => {
    setCalleSeleccionada(null);
    setModoEdicion(false);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (calleSeleccionada) {
      setModoEdicion(true);
    }
  };

  return (
    <MainLayout title="Mantenimiento de Calles">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Formulario de calles */}
        <CalleForm
          calleSeleccionada={calleSeleccionada}
          onGuardar={handleGuardarCalle}
          onNuevo={handleNuevo}
          onEditar={handleEditar}
        />
        
        {/* Lista de calles */}
        <CalleList
          calles={calles}
          onSelectCalle={handleSelectCalle}
        />
      </div>
    </MainLayout>
  );
};

export default CallesPage;