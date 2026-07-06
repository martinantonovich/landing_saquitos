"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); 

export async function procesarPedido(datos: {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  cantidad: number;
  zonaEnvio: number;
}) {
  try {
    const data = await resend.emails.send({
      from: "Pedidos Té <onboarding@resend.dev>", 
      to: ["martin.antonovich@gmail.com"],
      subject: `Nuevo pedido de ${datos.nombre} ${datos.apellido} - ${datos.cantidad} Paquetes`,
      html: `
        <h2>¡Tenés un nuevo pedido de saquitos!</h2>
        <p><strong>Cliente:</strong> ${datos.nombre} ${datos.apellido}</p>
        <p><strong>Email:</strong> ${datos.email}</p>
        <p><strong>Teléfono:</strong> ${datos.telefono}</p>
        <p><strong>Dirección:</strong> ${datos.direccion}</p>
        <p><strong>Cantidad:</strong> ${datos.cantidad} paquetes</p>
        <br/>
        <p>El cliente está siendo redirigido a tu WhatsApp en este momento para enviarte el comprobante de pago.</p>
      `,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Hubo un error al enviar el correo" };
  }
}