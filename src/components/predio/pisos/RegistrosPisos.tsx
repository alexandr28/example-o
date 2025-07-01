import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus } from 'lucide-react';

// Enums
enum Material {
  CONCRETO = 'Concreto',
  LADRILLO = 'Ladrillo', 
  ADOBE = 'Adobe'
}

enum EstadoConservacion {
  MUY_BUENO = 'Muy bueno',
  BUENO = 'Bueno',
  REGULAR = 'Regular',
  MALO = 'Malo'
}

enum FormaRegistro {
  INDIVIDUAL = 'INDIVIDUAL',
  MASIVO = 'MASIVO'
}

// Interfaz para los datos del formulario
interface PisoFormData {
  descripcion: string;
  fechaConstruccion: string;
  antiguedad: string;
  estadoConservacion: string;
  areaConstruida: string;
  materialPredominante: string;
  formaRegistro: string;
  otrasInstalaciones: string;
}

// Interfaz para errores
interface FormErrors {
  [key: string]: string;
}

// Componente principal
export default function RegistroPisos() {
  const [loading, setLoading] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<Record<string, Record<string, boolean>>>({});
  const [predio, setPredio] = useState<any>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estado del formulario
  const [formData, setFormData] = useState<PisoFormData>({
    descripcion: '',
    fechaConstruccion: '',
    antiguedad: '30 años',
    estadoConservacion: '',
    areaConstruida: '',
    materialPredominante: '',
    formaRegistro: FormaRegistro.INDIVIDUAL,
    otrasInstalaciones: '0.00'
  });

  // Datos de ejemplo para los selectores
  const estadosConservacion = Object.values(EstadoConservacion).map(estado => ({
    value: estado,
    label: estado
  }));

  const materiales = Object.values(Material).map(material => ({
    value: material,
    label: material
  }));

  const formasRegistro = [
    { value: FormaRegistro.INDIVIDUAL, label: 'Individual' },
    { value: FormaRegistro.MASIVO, label: 'Masivo' }
  ];

  // Categorías para la tabla
  const categorias = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const columnas = [
    { key: 'murosColumnas', label: 'Muros y Columnas' },
    { key: 'techo', label: 'Techo' },
    { key: 'pisos', label: 'Pisos' },
    { key: 'revestimiento', label: 'Revestimiento' },
    { key: 'puertasVentanas', label: 'Puertas y Ventanas' },
    { key: 'instalaciones', label: 'Instalaciones Eléctricas y Sanitarias' }
  ];

  // Cargar datos del predio simulado
  useEffect(() => {
    setPredio({
      id: '1',
      codigoPredio: '1045',
      direccion: 'Av. Principal 123'
    });
  }, []);

  // Calcular antigüedad basada en la fecha
  const calcularAntiguedad = (fecha: string) => {
    if (!fecha) return '';
    
    const fechaConstruccion = new Date(fecha);
    const fechaActual = new Date();
    const años = fechaActual.getFullYear() - fechaConstruccion.getFullYear();
    
    if (años <= 5) return 'Hasta 5 años';
    if (años <= 10) return 'Hasta 10 años';
    if (años <= 15) return 'Hasta 15 años';
    if (años <= 20) return 'Hasta 20 años';
    if (años <= 25) return 'Hasta 25 años';
    if (años <= 30) return 'Hasta 30 años';
    if (años <= 35) return 'Hasta 35 años';
    if (años <= 40) return 'Hasta 40 años';
    if (años <= 45) return 'Hasta 45 años';
    if (años <= 50) return 'Hasta 50 años';
    return 'Más de 50 años';
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Si es fecha, calcular antigüedad
    if (name === 'fechaConstruccion') {
      const antiguedad = calcularAntiguedad(value);
      setFormData(prev => ({
        ...prev,
        antiguedad
      }));
    }
  };

  // Manejar selección de letras en la tabla
  const handleLetterSelect = (categoria: string, columna: string) => {
    setSelectedLetters(prev => ({
      ...prev,
      [columna]: {
        ...Object.fromEntries(categorias.map(cat => [cat, false])),
        [categoria]: true
      }
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (!formData.fechaConstruccion) {
      newErrors.fechaConstruccion = 'La fecha de construcción es requerida';
    }
    if (!formData.estadoConservacion) {
      newErrors.estadoConservacion = 'El estado de conservación es requerido';
    }
    if (!formData.areaConstruida || isNaN(parseFloat(formData.areaConstruida)) || parseFloat(formData.areaConstruida) <= 0) {
      newErrors.areaConstruida = 'El área construida debe ser un número mayor a 0';
    }
    if (!formData.materialPredominante) {
      newErrors.materialPredominante = 'El material predominante es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Datos del piso:', formData);
      console.log('Categorías seleccionadas:', selectedLetters);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar mensaje de éxito
      alert('Piso registrado correctamente');
      
      // Limpiar formulario
      handleNuevo();
      
    } catch (error) {
      console.error('Error al guardar piso:', error);
      alert('Error al registrar el piso');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar formulario
  const handleNuevo = () => {
    setFormData({
      descripcion: '',
      fechaConstruccion: '',
      antiguedad: '30 años',
      estadoConservacion: '',
      areaConstruida: '',
      materialPredominante: '',
      formaRegistro: FormaRegistro.INDIVIDUAL,
      otrasInstalaciones: '0.00'
    });
    setSelectedLetters({});
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <span className="text-gray-700 dark:text-gray-300">Módulo</span>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300">Predio</span>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300">Pisos</span>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Registro de pisos</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="space-y-6">
        {/* Sección: Seleccionar predio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Seleccionar predio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Seleccionar predio
            </button>
            <input
              type="text"
              placeholder="Código de predio"
              value={predio?.codigoPredio || ''}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              readOnly
            />
            <input
              type="text"
              placeholder="Dirección predial"
              value={predio?.direccion || ''}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              readOnly
            />
          </div>
        </div>

        {/* Sección: Datos del piso */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Datos del piso
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <select
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccione</option>
                <option value="Primer piso">Primer piso</option>
                <option value="Segundo piso">Segundo piso</option>
                <option value="Tercer piso">Tercer piso</option>
                <option value="Sótano">Sótano</option>
                <option value="Azotea">Azotea</option>
              </select>
              {errors.descripcion && (
                <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>
              )}
            </div>

            {/* Fecha de construcción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de construcción
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="fechaConstruccion"
                  value={formData.fechaConstruccion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.fechaConstruccion && (
                <p className="text-red-500 text-xs mt-1">{errors.fechaConstruccion}</p>
              )}
            </div>

            {/* Antigüedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Antigüedad
              </label>
              <input
                name="antiguedad"
                value={formData.antiguedad}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 dark:text-white"
                readOnly
              />
            </div>

            {/* Estado de conservación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado de conservación
              </label>
              <select
                name="estadoConservacion"
                value={formData.estadoConservacion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccione</option>
                {estadosConservacion.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
              {errors.estadoConservacion && (
                <p className="text-red-500 text-xs mt-1">{errors.estadoConservacion}</p>
              )}
            </div>

            {/* Área construida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área construida
              </label>
              <input
                type="text"
                name="areaConstruida"
                value={formData.areaConstruida}
                onChange={handleInputChange}
                placeholder="Ingrese área"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.areaConstruida && (
                <p className="text-red-500 text-xs mt-1">{errors.areaConstruida}</p>
              )}
            </div>

            {/* Material predominante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material predominante
              </label>
              <select
                name="materialPredominante"
                value={formData.materialPredominante}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccione</option>
                {materiales.map(material => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
              {errors.materialPredominante && (
                <p className="text-red-500 text-xs mt-1">{errors.materialPredominante}</p>
              )}
            </div>

            {/* Forma de registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Forma de registro
              </label>
              <select
                name="formaRegistro"
                value={formData.formaRegistro}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                {formasRegistro.map(forma => (
                  <option key={forma.value} value={forma.value}>
                    {forma.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Otras instalaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Otras instalaciones
              </label>
              <input
                type="text"
                name="otrasInstalaciones"
                value={formData.otrasInstalaciones}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Tabla de categorías */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  {columnas.map(col => (
                    <th key={col.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categorias.map(categoria => (
                  <tr key={categoria}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {categoria}
                    </td>
                    {columnas.map(col => (
                      <td key={`${categoria}-${col.key}`} className="px-4 py-3 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedLetters[col.key]?.[categoria] || false}
                          onChange={() => handleLetterSelect(categoria, col.key)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleNuevo}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Nuevo
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}