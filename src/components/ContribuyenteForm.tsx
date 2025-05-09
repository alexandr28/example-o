import { FC, useCallback, useMemo, memo } from 'react';

import FormSection from './FormSecction';
import { useContribuyenteForm } from '../hooks';
import { TipoContribuyente } from '../types';
import {Select,Button,PersonaForm,SelectorDirecciones} from '../components'

/**
 * Formulario principal para registro y edición de contribuyentes
 * 
 * Gestiona la recolección de datos del contribuyente, incluyendo su información personal,
 * dirección, y opcionalmente información de cónyuge o representante legal.
 */
const ContribuyenteForm: FC = memo(() => {
  const {
    contribuyenteForm,
    conyugeRepresentanteForm,
    tipoContribuyente,
    mostrarFormConyuge,
    shouldDisablePersonaFields,
    isDireccionModalOpen,
    isConyugeDireccionModalOpen,
    direcciones,
    onSubmit,
    handleOpenDireccionModal,
    handleCloseDireccionModal,
    handleOpenConyugeDireccionModal,
    handleCloseConyugeDireccionModal,
    handleSelectDireccion,
    handleSelectConyugeDireccion,
    toggleConyugeForm,
    getDireccionTextoCompleto,
    getConyugeButtonText,
  } = useContribuyenteForm();

  // Memoizamos opciones para evitar recreaciones innecesarias
  const tipoContribuyenteOptions = useMemo(() => [
    { value: TipoContribuyente.PERSONA_NATURAL, label: 'Persona Natural' },
    { value: TipoContribuyente.PERSONA_JURIDICA, label: 'Persona Jurídica' },
  ], []);

  // Handlers con useCallback para evitar recreaciones innecesarias
  const handleEditar = useCallback(() => {
    console.log('Modo edición activado');
    // Implementar lógica de edición aquí
  }, []);

  const handleNuevo = useCallback(() => {
    contribuyenteForm.reset();
    conyugeRepresentanteForm.reset();
    // Si hubiera otra lógica para "nuevo", iría aquí
  }, [contribuyenteForm, conyugeRepresentanteForm]);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Sección: Datos del contribuyente */}
      <FormSection title="Datos del contribuyente">
        <div className="space-y-6">
          {/* Campo: Tipo de contribuyente */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Select
                label="Tipo contribuyente"
                options={tipoContribuyenteOptions}
                error={contribuyenteForm.formState.errors.tipoContribuyente?.message as string}
                {...contribuyenteForm.register('tipoContribuyente')}
              />
            </div>
          </div>

          {/* Formulario de datos personales */}
          <PersonaForm
            form={contribuyenteForm}
            isJuridica={tipoContribuyente === TipoContribuyente.PERSONA_JURIDICA}
            onOpenDireccionModal={handleOpenDireccionModal}
            direccion={contribuyenteForm.watch('direccion')}
            getDireccionTextoCompleto={getDireccionTextoCompleto}
            disablePersonaFields={shouldDisablePersonaFields}
          />
          
          {/* Botones de acción */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="accent"
              onClick={toggleConyugeForm}
            >
              {getConyugeButtonText()}
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="submit"
                variant="primary"
              >
                Guardar
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditar}
              >
                Editar
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleNuevo}
              >
                Nuevo
              </Button>
            </div>
          </div>
        </div>
      </FormSection>
      
      {/* Sección condicional: Datos del cónyuge / representante legal */}
      {mostrarFormConyuge && (
        <FormSection 
          title={tipoContribuyente === TipoContribuyente.PERSONA_NATURAL ? 'Datos del cónyuge' : 'Datos del representante legal'}
        >
          <PersonaForm
            form={conyugeRepresentanteForm}
            isRepresentante={true}
            onOpenDireccionModal={handleOpenConyugeDireccionModal}
            direccion={conyugeRepresentanteForm.watch('direccion')}
            getDireccionTextoCompleto={getDireccionTextoCompleto}
          />
        </FormSection>
      )}

      {/* Modals */}
      <SelectorDirecciones
        isOpen={isDireccionModalOpen}
        onClose={handleCloseDireccionModal}
        onSelectDireccion={handleSelectDireccion}
        direcciones={direcciones}
      />
      
      <SelectorDirecciones
        isOpen={isConyugeDireccionModalOpen}
        onClose={handleCloseConyugeDireccionModal}
        onSelectDireccion={handleSelectConyugeDireccion}
        direcciones={direcciones}
      />
    </form>
  );
});

// Nombre para DevTools
ContribuyenteForm.displayName = 'ContribuyenteForm';

export default ContribuyenteForm;