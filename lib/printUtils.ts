import { Venta } from '@/lib/supabaseClient';

export const printThermalReceipt = (venta: Venta, mesaNumero?: string) => {
  if (typeof window === 'undefined') return;

  // Abrir una nueva ventana/pestaña premium para mostrar el ticket
  const printWindow = window.open('', '_blank', 'width=450,height=700,menubar=no,toolbar=no,location=no,status=no');
  if (!printWindow) {
    alert('Por favor, permita las ventanas emergentes (popups) para poder visualizar e imprimir el ticket de venta.');
    return;
  }

  const subtotal = venta.items.reduce((s, item) => s + (item.precio_unitario * item.cantidad), 0);
  const ipo = Math.round(subtotal * 0.08);
  const itemsHtml = venta.items.map(item => `
    <tr>
      <td style="padding: 4px 0; font-family: 'Courier New', monospace; font-size: 11px;">${item.cantidad}x ${item.nombre}</td>
      <td style="text-align: right; padding: 4px 0; font-family: 'Courier New', monospace; font-size: 11px;">$${(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  const mesaString = mesaNumero ? `<p style="margin: 3px 0; font-family: 'Courier New', monospace; font-size: 11px;"><strong>Mesa:</strong> ${mesaNumero}</p>` : '';
  
  // Calcular descuento real si el total final es menor que subtotal + ipo
  const calculatedTotal = subtotal + ipo;
  const discount = Math.max(0, calculatedTotal - venta.total);
  const discountString = discount > 0 ? `
    <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: 'Courier New', monospace; margin-top: 2px;">
      <span>Descuento:</span>
      <span>-$${discount.toLocaleString('es-CO')}</span>
    </div>
  ` : '';

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Factura - ${venta.id}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .footer { font-size: 9px; margin-top: 15px; text-align: center; }
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; padding: 0; width: 80mm; background-color: #fff; }
            .ticket-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
        <!-- Barra superior premium para control en pantalla -->
        <div class="no-print" style="position: sticky; top: 0; left: 0; right: 0; background: #1e1e1e; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #f3f4f6; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">📄 Alico Bar POS - Vista de Impresión</span>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" style="background: linear-gradient(135deg, #059669, #10b981); color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              Imprimir
            </button>
            <button onclick="window.close()" style="background: #374151; color: #d1d5db; border: 1px solid #4b5563; padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              Cerrar
            </button>
          </div>
        </div>

        <!-- Contenedor del ticket centrado en pantalla, directo en impresión -->
        <div class="ticket-container" style="max-width: 80mm; margin: 0 auto 30px auto; background: white; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-radius: 4px; box-sizing: border-box;">
          <div class="text-center">
            <h2 style="margin: 0; font-size: 14px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 1px;">ALICO BAR</h2>
          <p style="margin: 3px 0; font-size: 9px; font-weight: bold;">SERVICIOS DE BAR Y COCTELERÍA</p>
          <p style="margin: 2px 0; font-size: 8px;">Sede: ${venta.sede_id === 'sede-norte' ? 'Norte - Av. Principal #102' : 'Centro - Calle 15 #5-40'}</p>
        </div>
        
        <div class="divider"></div>
        
        <p style="margin: 3px 0; font-family: 'Courier New', monospace; font-size: 10.5px;"><strong>Factura:</strong> ${venta.id}</p>
        <p style="margin: 3px 0; font-family: 'Courier New', monospace; font-size: 10.5px;"><strong>Fecha:</strong> ${new Date(venta.fecha_hora).toLocaleString('es-CO')}</p>
        <p style="margin: 3px 0; font-family: 'Courier New', monospace; font-size: 10.5px;"><strong>Atendió:</strong> ${venta.atendido_por}</p>
        <p style="margin: 3px 0; font-family: 'Courier New', monospace; font-size: 10.5px;"><strong>Cliente:</strong> ${venta.cliente_nombre || 'Cliente General'}</p>
        ${mesaString}
        
        <div class="divider"></div>
        
        <table style="font-family: 'Courier New', monospace;">
          <thead>
            <tr style="border-bottom: 1px dashed #000;">
              <th style="text-align: left; padding-bottom: 4px; font-size: 10.5px;">Detalle</th>
              <th style="text-align: right; padding-bottom: 4px; font-size: 10.5px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-family: 'Courier New', monospace;">
          <span>Subtotal Neto:</span>
          <span>$${subtotal.toLocaleString('es-CO')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-family: 'Courier New', monospace; margin-top: 2px;">
          <span>Impuesto IPO (8%):</span>
          <span>$${ipo.toLocaleString('es-CO')}</span>
        </div>
        ${discountString}
        
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; font-family: 'Courier New', monospace; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px;">
          <span>TOTAL:</span>
          <span>$${venta.total.toLocaleString('es-CO')}</span>
        </div>
        
        <p style="margin: 8px 0 0 0; font-size: 9.5px; font-family: 'Courier New', monospace;"><strong>Método Pago:</strong> ${venta.metodo_pago}</p>
        
        <div class="divider"></div>
        
        <div class="footer" style="font-family: 'Courier New', monospace;">
          <p style="margin: 0; font-weight: bold; font-size: 10px;">¡GRACIAS POR SU COMPRA!</p>
          <p style="margin: 3px 0 0 0; font-size: 7.5px;">Alico Bar POS • Control y Auditoría de Bodega</p>
        </div>
        </div>
        <!-- Script de impresión y auto-cierre -->
        <script>
          window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              window.focus();
              window.print();
              
              // Cerrar automáticamente después de imprimir o cancelar
              window.onafterprint = () => {
                window.close();
              };
            }, 300);
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
