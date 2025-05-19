import { z } from 'zod';
import { TipoContribuyente, TipoDocumento, Sexo, EstadoCivil } from '../types';

export const direccionSchema = z.object({
  id: z.number(),
  descripcion: z.string(),
  lado: z.string(),
  loteInicial: z.number(),
  loteFinal: z.number(),
});

export const contribuyenteSchema = z.object({
  tipoContribuyente: z.string().min(1, 'Debe seleccionar un tipo de contribuyente'),
  tipoDocumento: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  numeroDocumento: z.string().min(1, 'El número de documento es requerido'),
  nombreRazonSocial: z.string().min(1, 'Este campo es requerido'),
  telefono: z.string().regex(/^\d{9}$/, 'El teléfono debe tener 9 dígitos'),
  sexo: z.string().optional(),
  estadoCivil: z.string().optional(),
  fechaNacimiento: z.string().nullable().optional(),
  direccion: direccionSchema.nullable().optional(),
  nFinca: z.string().optional(),
  otroNumero: z.string().optional(),
  mostrarFormConyuge: z.boolean(),
}).refine((data) => {
  // Si es persona natural, validar campos obligatorios
  if (data.tipoContribuyente === TipoContribuyente.PERSONA_NATURAL) {
    return !!data.sexo && !!data.estadoCivil && !!data.fechaNacimiento;
  }
  return true;
}, {
  message: "Los campos sexo, estado civil y fecha de nacimiento son requeridos para personas naturales",
  path: ['tipoContribuyente'],
});

export const conyugeRepresentanteSchema = z.object({
  tipoDocumento: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  numeroDocumento: z.string().min(1, 'El número de documento es requerido'),
  apellidosNombres: z.string().min(1, 'Este campo es requerido'),
  telefono: z.string().regex(/^\d{9}$/, 'El teléfono debe tener 9 dígitos'),
  sexo: z.string().min(1, 'Debe seleccionar un sexo'),
  estadoCivil: z.string().min(1, 'Debe seleccionar un estado civil'),
  fechaNacimiento: z.string().nullable(),
  direccion: direccionSchema.nullable().optional(),
  nFinca: z.string().optional(),
});