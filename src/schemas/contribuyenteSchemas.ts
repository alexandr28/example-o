// src/schemas/contribuyenteSchemas.ts
import { z } from 'zod';
import { TipoContribuyente, TipoDocumento, Sexo, EstadoCivil } from '../types/formTypes';

// Esquema para la dirección
const direccionSchema = z.object({
  id: z.number(),
  descripcion: z.string(),
  lado: z.string(),
  loteInicial: z.number(),
  loteFinal: z.number()
}).nullable();

// Esquema principal del contribuyente
export const contribuyenteSchema = z.object({
  tipoContribuyente: z.string().min(1, 'Debe seleccionar el tipo de contribuyente'),
  
  tipoDocumento: z.string().min(1, 'Debe seleccionar el tipo de documento'),
  
  numeroDocumento: z.string()
    .min(1, 'El número de documento es requerido')
    .refine((val) => {
      // Validación según tipo de documento
      if (val.length === 8 && /^\d+$/.test(val)) return true; // DNI
      if (val.length === 11 && /^\d+$/.test(val)) return true; // RUC
      if (val.length >= 6 && val.length <= 12) return true; // Pasaporte o Carnet
      return false;
    }, 'Formato de documento inválido'),
  
  nombreRazonSocial: z.string()
    .min(1, 'Este campo es requerido')
    .min(3, 'Debe tener al menos 3 caracteres'),
  
  telefono: z.string().optional(),
  
  sexo: z.string().optional(),
  
  estadoCivil: z.string().optional(),
  
  fechaNacimiento: z.date().nullable().optional(),
  
  direccion: direccionSchema,
  
  nFinca: z.string().optional(),
  
  otroNumero: z.string().optional(),
  
  mostrarFormConyuge: z.boolean().default(false)
}).superRefine((data, ctx) => {
  // Validaciones condicionales para persona natural
  if (data.tipoContribuyente === TipoContribuyente.PERSONA_NATURAL) {
    if (!data.sexo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El sexo es requerido para personas naturales',
        path: ['sexo']
      });
    }
    
    if (!data.estadoCivil) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El estado civil es requerido para personas naturales',
        path: ['estadoCivil']
      });
    }
  }
  
  // Validación de dirección
  if (!data.direccion) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debe seleccionar una dirección',
      path: ['direccion']
    });
  }
});

// Esquema para cónyuge/representante legal
export const conyugeRepresentanteSchema = z.object({
  tipoDocumento: z.string().min(1, 'Debe seleccionar el tipo de documento'),
  
  numeroDocumento: z.string()
    .min(1, 'El número de documento es requerido')
    .refine((val) => {
      if (val.length === 8 && /^\d+$/.test(val)) return true;
      if (val.length === 11 && /^\d+$/.test(val)) return true;
      if (val.length >= 6 && val.length <= 12) return true;
      return false;
    }, 'Formato de documento inválido'),
  
  apellidosNombres: z.string()
    .min(1, 'Los apellidos y nombres son requeridos')
    .min(3, 'Debe tener al menos 3 caracteres'),
  
  telefono: z.string().optional(),
  
  sexo: z.string().optional(),
  
  estadoCivil: z.string().optional(),
  
  fechaNacimiento: z.date().nullable().optional(),
  
  direccion: direccionSchema,
  
  nFinca: z.string().optional()
});

// Tipos inferidos de los esquemas
export type ContribuyenteFormData = z.infer<typeof contribuyenteSchema>;
export type ConyugeRepresentanteFormData = z.infer<typeof conyugeRepresentanteSchema>;