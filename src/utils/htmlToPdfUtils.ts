// src/utils/htmlToPdfUtils.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface HtmlToPdfOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  scale?: number;
  quality?: number;
}

/**
 * Convierte un elemento HTML a PDF manteniendo estilos MUI
 */
export const generatePdfFromHtml = async (
  elementId: string,
  options: HtmlToPdfOptions = {}
): Promise<void> => {
  const {
    filename = 'reporte',
    orientation = 'portrait',
    format = 'a4',
    scale = 2,
    quality = 0.95
  } = options;

  try {
    // Obtener el elemento
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Mostrar loader si existe
    const loader = document.getElementById('pdf-loader');
    if (loader) {
      loader.style.display = 'flex';
    }

    // Convertir a canvas
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      removeContainer: true
    });

    // Crear PDF
    const imgData = canvas.toDataURL('image/png', quality);
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    // Calcular dimensiones
    const imgWidth = orientation === 'portrait' ? 210 : 297; // A4 width in mm
    const pageHeight = orientation === 'portrait' ? 297 : 210; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Agregar páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Descargar PDF
    pdf.save(`${filename}_${new Date().getTime()}.pdf`);

    // Ocultar loader
    if (loader) {
      loader.style.display = 'none';
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);

    // Ocultar loader en caso de error
    const loader = document.getElementById('pdf-loader');
    if (loader) {
      loader.style.display = 'none';
    }

    throw error;
  }
};

/**
 * Genera PDF de múltiples elementos HTML
 */
export const generatePdfFromMultipleElements = async (
  elementIds: string[],
  options: HtmlToPdfOptions = {}
): Promise<void> => {
  const {
    filename = 'reporte',
    orientation = 'portrait',
    format = 'a4',
    scale = 2,
    quality = 0.95
  } = options;

  try {
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    const imgWidth = orientation === 'portrait' ? 210 : 297;
    let isFirstPage = true;

    for (const elementId of elementIds) {
      const element = document.getElementById(elementId);
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png', quality);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      isFirstPage = false;
    }

    pdf.save(`${filename}_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('Error generating PDF from multiple elements:', error);
    throw error;
  }
};

/**
 * Componente de loader para mostrar durante la generación del PDF
 */
export const PdfLoader = `
  <div id="pdf-loader" style="
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    justify-content: center;
    align-items: center;
  ">
    <div style="
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
    ">
      <div style="
        border: 4px solid #f3f3f3;
        border-top: 4px solid #1976d2;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      "></div>
      <p style="margin: 0; color: #424242;">Generando PDF...</p>
    </div>
  </div>
`;
