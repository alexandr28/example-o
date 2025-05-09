import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ContribuyenteFormData, 
  ConyugeRepresentanteFormData, 
  TipoContribuyente,
  TipoDocumento,
  Sexo,
  EstadoCivil,
  Direccion
} from '../types';
import { contribuyenteSchema, conyugeRepresentanteSchema } from '../schemas/contribuyenteSchemas';

// Mock data para direcciones - idealmente vendría de una API
const mockDirecciones: Direccion[] = [
  { id: 1, descripcion: 'Sector + Barrio + Calle / Mz + Cuadra', lado: '-', loteInicial: 0, loteFinal: 0 },
  { id: 2, descripcion: 'Sector + Barrio + Calle / Mz + Cuadra', lado: 'I', loteInicial: 1, loteFinal: 60 },
  { id: 3, descripcion: 'Sector + Barrio + Calle / Mz + Cuadra', lado: 'P', loteInicial: 1, loteFinal: 100 },
];

/**
 * Hook personalizado para la gestión del formulario de contribuyentes
 * 
 * Maneja todos los estados, validaciones y lógica relacionada con el formulario
 * de contribuyentes, incluyendo información del contribuyente y su cónyuge/representante.
 */
export const useContribuyenteForm = () => {
  // Estado para manejo de modales
  const [isDireccionModalOpen, setIsDireccionModalOpen] = useState(false);
  const [isConyugeDireccionModalOpen, setIsConyugeDireccionModalOpen] = useState(false);

  // Formulario principal del contribuyente con validación
  const contribuyenteForm = useForm<ContribuyenteFormData>({
    resolver: zodResolver(contribuyenteSchema) as any,
    defaultValues: {
      tipoContribuyente: '',
      tipoDocumento: '',
      numeroDocumento: '',
      nombreRazonSocial: '',
      telefono: '',
      sexo: '',
      estadoCivil: '',
      fechaNacimiento: null,
      direccion: null,
      nFinca: '',
      otroNumero: '',
      mostrarFormConyuge: false,
    },
  });

  // Formulario del cónyuge o representante legal con validación
  const conyugeRepresentanteForm = useForm<ConyugeRepresentanteFormData>({
    resolver: zodResolver(conyugeRepresentanteSchema) as any,
    defaultValues: {
      tipoDocumento: '',
      numeroDocumento: '',
      apellidosNombres: '',
      telefono: '',
      sexo: '',
      estadoCivil: '',
      fechaNacimiento: null,
      direccion: null,
      nFinca: '',
    },
  });

  // Valores del formulario principal
  const { watch: watchContribuyente, setValue: setContribuyenteValue } = contribuyenteForm;
  const tipoContribuyenteValue = watchContribuyente('tipoContribuyente');
  
  // Convertir el valor del string al enum para comparaciones consistentes
  const tipoContribuyente = useMemo(() => {
    if (tipoContribuyenteValue === TipoContribuyente.PERSONA_NATURAL) return TipoContribuyente.PERSONA_NATURAL;
    if (tipoContribuyenteValue === TipoContribuyente.PERSONA_JURIDICA) return TipoContribuyente.PERSONA_JURIDICA;
    return tipoContribuyenteValue;
  }, [tipoContribuyenteValue]);
    
  const mostrarFormConyuge = watchContribuyente('mostrarFormConyuge');
  const contribuyenteDireccion = watchContribuyente('direccion');
  const contribuyenteNFinca = watchContribuyente('nFinca');
  const contribuyenteOtroNumero = watchContribuyente('otroNumero');

  // Valores del formulario de cónyuge/representante
  const { watch: watchConyuge, setValue: setConyugeValue } = conyugeRepresentanteForm;
  const conyugeDireccion = watchConyuge('direccion');
  const conyugeNFinca = watchConyuge('nFinca');

  // Efectos para actualizar el texto completo de la dirección
  useEffect(() => {
    // Para el formulario de contribuyente
    if (contribuyenteDireccion) {
      // Este efecto se dispara cuando cambia la dirección o sus componentes
      // Aquí se podría actualizar algún cálculo derivado si fuera necesario
    }
  }, [contribuyenteDireccion, contribuyenteNFinca, contribuyenteOtroNumero]);

  useEffect(() => {
    // Para el formulario de cónyuge/representante
    if (conyugeDireccion) {
      // Similar al efecto anterior, para el formulario del cónyuge
    }
  }, [conyugeDireccion, conyugeNFinca]);

  // Manejadores de eventos memoizados para mejor rendimiento
  const handleOpenDireccionModal = useCallback(() => setIsDireccionModalOpen(true), []);
  const handleCloseDireccionModal = useCallback(() => setIsDireccionModalOpen(false), []);
  
  const handleOpenConyugeDireccionModal = useCallback(() => setIsConyugeDireccionModalOpen(true), []);
  const handleCloseConyugeDireccionModal = useCallback(() => setIsConyugeDireccionModalOpen(false), []);

  // Manejar selección de direcciones
  const handleSelectDireccion = useCallback((direccion: Direccion) => {
    setContribuyenteValue('direccion', direccion);
  }, [setContribuyenteValue]);

  const handleSelectConyugeDireccion = useCallback((direccion: Direccion) => {
    setConyugeValue('direccion', direccion);
  }, [setConyugeValue]);

  // Mostrar/ocultar el formulario de cónyuge/representante
  const toggleConyugeForm = useCallback(() => {
    setContribuyenteValue('mostrarFormConyuge', !mostrarFormConyuge);
  }, [mostrarFormConyuge, setContribuyenteValue]);

  // Manejar el envío de los formularios
  const onSubmit = useCallback((data: ContribuyenteFormData) => {
    // Si hay un formulario de cónyuge/representante visible, validarlo también
    if (data.mostrarFormConyuge) {
      conyugeRepresentanteForm.handleSubmit((conyugeData) => {
        // Aquí se combinarían los datos y se enviarían al servidor
        console.log('Datos del contribuyente:', data);
        console.log('Datos del cónyuge/representante:', conyugeData);
        
        // Ejemplo: enviar a la API
        // saveContribuyente({ ...data, conyugeRepresentante: conyugeData });
      })();
    } else {
      console.log('Datos del contribuyente:', data);
      // Ejemplo: enviar a la API
      // saveContribuyente(data);
    }
  }, [conyugeRepresentanteForm]);

  // Obtener texto completo de dirección para mostrar
  const getDireccionTextoCompleto = useCallback((direccion: Direccion | null, nFinca: string, otroNumero?: string) => {
    if (!direccion) return '';
    
    let texto = `${direccion.descripcion} + LOTE`;
    
    if (nFinca) {
      texto += ` + N° FINCA: ${nFinca}`;
    }
    
    if (otroNumero) {
      texto += ` + OTRO NÚMERO: ${otroNumero}`;
    }
    
    return texto;
  }, []);

  // Verificar si los campos deberían estar deshabilitados (persona jurídica)
  const shouldDisablePersonaFields = useMemo(() => 
    tipoContribuyente === TipoContribuyente.PERSONA_JURIDICA, 
    [tipoContribuyente]
  );
  
  // Texto para el botón según tipo de contribuyente
  const getConyugeButtonText = useCallback(() => {
    return tipoContribuyente === TipoContribuyente.PERSONA_NATURAL 
      ? 'Agregar cónyuge' 
      : 'Agregar Representante Legal';
  }, [tipoContribuyente]);

  return {
    // Formularios y sus estados
    contribuyenteForm,
    conyugeRepresentanteForm,
    tipoContribuyente,
    mostrarFormConyuge,
    shouldDisablePersonaFields,
    
    // Estados de los modales
    isDireccionModalOpen,
    isConyugeDireccionModalOpen,
    
    // Datos
    direcciones: mockDirecciones,
    
    // Manejadores de eventos
    onSubmit: contribuyenteForm.handleSubmit(onSubmit),
    handleOpenDireccionModal,
    handleCloseDireccionModal,
    handleOpenConyugeDireccionModal,
    handleCloseConyugeDireccionModal,
    handleSelectDireccion,
    handleSelectConyugeDireccion,
    toggleConyugeForm,
    
    // Utilidades
    getDireccionTextoCompleto,
    getConyugeButtonText,
  };
};