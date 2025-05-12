import React, { useEffect, useMemo, useState } from 'react';
import {MainLayout} from '../../layout';
import {Breadcrumb, ValorUnitarioForm, ValorUnitarioList, Button } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useValoresUnitarios } from '../../hooks/useValoresUnitarios';

/**
 * Página para administrar los valores unitarios
 * 
 * Permite registrar valores unitarios por año, categoría, subcategoría y letra,
 * así como visualizar y eliminar los existentes
 */
const ValoresUnitariosPage: React.FC = () => {
  // Utilizamos el hook personalizado para la gestión de valores unitarios
  const {
    valoresUnitarios,
    años,
    categorias,
    subcategoriasDisponibles,
    letras,
    loading,
    error,
    cargarValoresUnitarios,
    registrarValorUnitario,
    eliminarValorUnitario,
    obtenerValoresUnitariosPorCategoria,
    añoSeleccionado,
    categoriaSeleccionada,
    subcategoriaSeleccionada,
    letraSeleccionada,
    setAñoSeleccionado,
    setCategoriaSeleccionada,
    setSubcategoriaSeleccionada,
    setLetraSeleccionada,
  } = useValoresUnitarios();
  
  // Estados locales adicionales
  const [costo, setCosto] = useState<string>('0.00');
  const [añoTabla, setAñoTabla] = useState<number | null>(null);
  const [valoresPorCategoria, setValoresPorCategoria] = useState<Record<string, Record<string, number>>>({});

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Arancel', path: '/mantenedores/arancel' },
    { label: 'Valores unitarios', active: true }
  ], []);

  // Cargar valores unitarios al montar el componente
  useEffect(() => {
    cargarValoresUnitarios();
  }, [cargarValoresUnitarios]);

  // Actualizar tabla cuando cambia el año seleccionado o los valores unitarios
  useEffect(() => {
    if (añoTabla) {
      const valores = obtenerValoresUnitariosPorCategoria(añoTabla);
      setValoresPorCategoria(valores);
    }
  }, [añoTabla, valoresUnitarios, obtenerValoresUnitariosPorCategoria]);

  // Manejar cambio en el costo
  const handleCostoChange = (value: string) => {
    setCosto(value);
  };

  // Manejar registro de valor unitario
  const handleRegistrar = () => {
    if (añoSeleccionado && categoriaSeleccionada && subcategoriaSeleccionada && letraSeleccionada) {
      registrarValorUnitario({
        año: añoSeleccionado,
        categoria: categoriaSeleccionada,
        subcategoria: subcategoriaSeleccionada,
        letra: letraSeleccionada,
        costo: parseFloat(costo)
      });
      setCosto('0.00');
    }
  };

  // Manejar cambio en el año de la tabla
  const handleAñoTablaChange = (año: number | null) => {
    setAñoTabla(año);
  };

  // Manejar eliminar valores
  const handleEliminar = () => {
    if (añoTabla) {
      // Aquí podríamos implementar una lógica más específica,
      // por ahora simplemente eliminamos un valor unitario de ejemplo
      const valorUnitario = valoresUnitarios.find(vu => vu.año === añoTabla);
      if (valorUnitario) {
        eliminarValorUnitario(valorUnitario.id);
      }
    }
  };

  // Verificar si todos los campos necesarios están llenos para habilitar el botón
  const isFormValid = añoSeleccionado && categoriaSeleccionada && subcategoriaSeleccionada && letraSeleccionada && costo;

  return (
    <MainLayout title="Valores Unitarios">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Mensajes de error, si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Sección superior con formulario y botones */}
        <div className="flex gap-6">
          {/* Formulario de registro */}
          <ValorUnitarioForm 
            años={años}
            categorias={categorias}
            subcategoriasDisponibles={subcategoriasDisponibles}
            letras={letras}
            añoSeleccionado={añoSeleccionado}
            categoriaSeleccionada={categoriaSeleccionada}
            subcategoriaSeleccionada={subcategoriaSeleccionada}
            letraSeleccionada={letraSeleccionada}
            loading={loading}
            onAñoChange={setAñoSeleccionado}
            onCategoriaChange={setCategoriaSeleccionada}
            onSubcategoriaChange={setSubcategoriaSeleccionada}
            onLetraChange={setLetraSeleccionada}
            onCostoChange={handleCostoChange}
            costoValue={costo}
          />
          
          {/* Contenedor de botones vertical centrado */}
          <div className="flex flex-col space-y-3 justify-center">
            <Button
              type="button"
              variant="primary"
              onClick={handleRegistrar}
              disabled={loading || !isFormValid}
              className="w-36"
            >
              Registrar
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleEliminar}
              disabled={loading || !añoTabla}
              className="w-36"
            >
              Eliminar
            </Button>
          </div>
        </div>
        
        {/* Tabla de valores unitarios */}
        <ValorUnitarioList 
          años={años}
          añoTabla={añoTabla}
          valoresPorCategoria={valoresPorCategoria}
          loading={loading}
          onAñoTablaChange={handleAñoTablaChange}
        />
      </div>
    </MainLayout>
  );
};

export default ValoresUnitariosPage;