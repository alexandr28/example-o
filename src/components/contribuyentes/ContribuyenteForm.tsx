// src/components/contribuyentes/ContribuyenteForm.tsx
import { FC, useCallback, useMemo, memo } from 'react';
import { Controller } from 'react-hook-form';
import FormSection from '../utils/FormSecction';
import { useContribuyenteForm } from '../../hooks/useContribuyenteForm';
import { TipoContribuyente } from '../../types/formTypes';
import { Select, Button, PersonaForm, SelectorDirecciones } from '../';

/**
 * Formulario principal para registro y edición de contribuyentes
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
    loading,
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

  // Opciones para el select de tipo de contribuyente
  const tipoContribuyenteOptions = useMemo(() => [
    { value: TipoContribuyente.PERSONA_NATURAL, label: 'Persona Natural' },
    { value: TipoContribuyente.PERSONA_JURIDICA, label: 'Persona Jurídica' },
  ], []);

  // Handlers
  const handleEditar = useCallback(() => {
    console.log('Modo edición activado');
    // Implementar lógica de edición
  }, []);

  const handleNuevo = useCallback(() => {
    contribuyenteForm.reset();
    conyugeRepresentanteForm.reset();
  }, [contribuyenteForm, conyugeRepresentanteForm]);

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Overlay de carga */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg">Guardando contribuyente...</span>
            </div>
          </div>
        )}

        {/* Sección: Datos del contribuyente */}
        <FormSection title="Datos del contribuyente">
          <div className="space-y-6">
            {/* Campo: Tipo de contribuyente */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Controller
                  name="tipoContribuyente"
                  control={contribuyenteForm.control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Tipo contribuyente"
                      options={tipoContribuyenteOptions}
                      error={contribuyenteForm.formState.errors.tipoContribuyente?.message as string}
                      disabled={loading}
                    />
                  )}
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
              disablePersonaFields={shouldDisablePersonaFields || loading}
            />
            
            {/* Botones de acción */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="accent"
                onClick={toggleConyugeForm}
                disabled={loading || !tipoContribuyente}
              >
                {getConyugeButtonText()}
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEditar}
                  disabled={loading}
                >
                  Editar
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNuevo}
                  disabled={loading}
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
            title={tipoContribuyente === TipoContribuyente.PERSONA_NATURAL ? 
              'Datos del cónyuge' : 'Datos del representante legal'}
          >
            <PersonaForm
              form={conyugeRepresentanteForm}
              isRepresentante={true}
              onOpenDireccionModal={handleOpenConyugeDireccionModal}
              direccion={conyugeRepresentanteForm.watch('direccion')}
              getDireccionTextoCompleto={getDireccionTextoCompleto}
              disablePersonaFields={loading}
              showDeleteButton={true}
              onDelete={() => {
                conyugeRepresentanteForm.reset();
                toggleConyugeForm();
              }}
            />
          </FormSection>
        )}
      </form>

      {/* Modals - Fuera del formulario */}
      <SelectorDirecciones
        isOpen={isDireccionModalOpen}
        onClose={handleCloseDireccionModal}
        onSelectDireccion={handleSelectDireccion}
      />
      
      <SelectorDirecciones
        isOpen={isConyugeDireccionModalOpen}
        onClose={handleCloseConyugeDireccionModal}
        onSelectDireccion={handleSelectConyugeDireccion}
      />
    </>
  );
});

ContribuyenteForm.displayName = 'ContribuyenteForm';

export default ContribuyenteForm;