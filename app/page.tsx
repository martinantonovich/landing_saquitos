"use client";
import { useState, useEffect } from "react";
import { procesarPedido } from "./actions"; // Importamos la función del backend
import Image from "next/image";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESTADOS DEL CARRUSEL
  const [currentMedia, setCurrentMedia] = useState(0);
  
  // ACÁ CONFIGURÁS TUS FOTOS Y VIDEOS (los nombres deben coincidir con tu carpeta public)
  const mediaItems = [
    { type: "video", src: "/videos/saquitos.mp4" },
    { type: "image", src: "/images/1.jpg" },
    { type: "image", src: "/images/2.jpg" },
    { type: "image", src: "/images/3.jpg" },
    { type: "image", src: "/images/6.jpg" },
    { type: "image", src: "/images/saquito de te 1.png" },
    { type: "image", src: "/images/saquito de te 2.png" },
    { type: "image", src: "/images/saquito.jpg" },
  ];

  const nextMedia = () => setCurrentMedia((prev) => (prev + 1) % mediaItems.length);
  const prevMedia = () => setCurrentMedia((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Si el elemento actual es una imagen, esperamos 2 segundos y pasamos
    if (mediaItems[currentMedia].type === "image") {
      timeoutId = setTimeout(() => {
        nextMedia();
      }, 2000); // 2000 = 2 segundos. Podés cambiarlo a 3000 si lo ves muy rápido.
    }

    // Limpiamos el timer si el usuario hace clic manualmente o el componente se desmonta
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentMedia]);

  // PRECIO FIJO POR PAQUETE
  const PRECIO_POR_PAQUETE = 15000;

const opcionesEnvio = [
    { id: "retiro", label: "Retiro en La Plata (Gratis)", costo: 0 },
    { id: "caba", label: "Envío a Sucursal - CABA y GBA", costo: 20000 },
    { id: "interior", label: "Envío a Sucursal - Resto del País", costo: 35000 }
  ];

const [formData, setFormData] = useState({
    nombre: "", 
    apellido: "", 
    email: "", 
    telefono: "", 
    direccion: "", 
    dni: "", 
    cp: "",  
    cantidad: 1,
    zonaEnvio: 0,
    pagarEnvioAhora: true 
  });

  // LÓGICA DEL CÁLCULO
  const subtotalPaquetes = formData.cantidad * PRECIO_POR_PAQUETE;
  // Solo sumamos el envío al total si seleccionó pagar ahora. Si es pago en destino, sumamos 0.
  const costoEnvioAgregado = (formData.zonaEnvio > 0 && formData.pagarEnvioAhora) ? formData.zonaEnvio : 0;
  const total = subtotalPaquetes + costoEnvioAgregado;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "zonaEnvio" ? Number(value) : value 
    });
  };

  const handleCantidad = (operacion: "sumar" | "restar") => {
    if (operacion === "restar" && formData.cantidad > 1) {
      setFormData({ ...formData, cantidad: formData.cantidad - 1 });
    } else if (operacion === "sumar") {
      setFormData({ ...formData, cantidad: formData.cantidad + 1 });
    }
  };

  // NUEVA FUNCIÓN PARA ENVIAR EL PEDIDO
  const handleSubmit = async () => {
    // Validación básica
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono || !formData.direccion || !formData.dni || !formData.cp) {
      alert("Por favor, completá el formulario.");
      return;
    }

    setIsSubmitting(true);
    
    // 1. Enviamos el mail a través de la Server Action
    const respuesta = await procesarPedido(formData);

    setIsSubmitting(false);

    if (respuesta.success) {
      // 2. Armamos el mensaje para WhatsApp
      const textoMensaje = `Hola! Acabo de hacer un pedido de ${formData.cantidad} paquetes de saquitos a nombre de ${formData.nombre} ${formData.apellido}. Te adjunto el comprobante de pago por $${total.toLocaleString('es-AR')}:`;
      
      // CAMBIÁ ESTE NÚMERO POR EL TUYO (Formato internacional sin el '+')
      const urlWa = `https://wa.me/5492216397422?text=${encodeURIComponent(textoMensaje)}`; 
      
      // 3. Abrimos WhatsApp y cerramos el modal
      window.open(urlWa, "_blank");
      setIsModalOpen(false); 
      
      // Limpiamos el formulario para el próximo pedido
      setFormData({ ...formData, nombre: "", apellido: "", email: "", telefono: "", direccion: "", cantidad: 1 });
    } else {
      alert("Hubo un error al registrar el pedido, intentá de nuevo.");
    }
  };

return (
    <main className="min-h-screen bg-[#fcf9f9] flex flex-col items-center">
      {/* HEADER CON LOGO */}
      <header className="w-full flex justify-center pt-2">
        <Image 
          src="/images/logo.png" 
          alt="Delice Logo"
          width={250} 
          height={100} 
          className="w-56 md:w-[250px] h-auto object-contain" 
          priority 
        />
      </header>

      <section className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center p-4 md:p-1 mt-0 md:mt-1 gap-0 md:gap-2">  
        {/* CARRUSEL DE MEDIA */}
        <div className="w-full max-w-sm aspect-[9/16] bg-gray-200 rounded-2xl overflow-hidden relative shadow-md order-1 md:order-2 group">
          
          {mediaItems[currentMedia].type === "video" ? (
            /* ATENCIÓN: muted y playsInline son obligatorios para que el video arranque solo en celulares */
            <video 
              src={mediaItems[currentMedia].src} 
              autoPlay 
              muted 
              playsInline 
              onEnded={nextMedia} /* Esto hace que pase al siguiente apenas termina */
              className="w-full h-full object-cover" 
            />
          ) : (
            <img src={mediaItems[currentMedia].src} alt="Delice" className="w-full h-full object-cover" />
          )}

          {/* BOTONES DEL CARRUSEL (Aparecen sutilmente) */}
          <button onClick={prevMedia} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#6b0e21] w-8 h-8 rounded-full font-bold shadow-sm opacity-80 transition-opacity flex items-center justify-center">
            ‹
          </button>
          <button onClick={nextMedia} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#6b0e21] w-8 h-8 rounded-full font-bold shadow-sm opacity-80 transition-opacity flex items-center justify-center">
            ›
          </button>
          
          {/* INDICADORES (Puntitos abajo) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {mediaItems.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentMedia ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 order-2 md:order-1">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center md:text-left mb-4 md:mb-6">
            Armá tu propio té en cualquier lugar
          </h2>
          <p className="text-gray-600 text-center md:text-left mb-8 text-lg md:text-xl leading-relaxed">
            Llevá el sabor de tus hebras a donde vayas con nuestros saquitos descartables. 
            Rellenalos, cerralos y disfrutá de una infusión perfecta.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-[#6b0e21] hover:bg-[#540b1a] text-white font-bold py-4 px-12 rounded-full shadow-lg transition-transform transform active:scale-95 text-lg"
          >
            ¡Quiero mis saquitos!
          </button>
        </div>
      </section>

      {/* MODAL DE COMPRA */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-opacity"
          onClick={() => setIsModalOpen(false)} /* <-- 1. AGREGAMOS ESTO AL FONDO OSCURO */
        >
          <div 
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in max-h-[90vh] overflow-y-auto flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()} /* <-- 2. AGREGAMOS ESTO A LA CAJA BLANCA */
          >
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Completá tu pedido</h3>
            
{/* INICIO DEL FORMULARIO */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input type="text" name="nombre" value={formData.nombre} placeholder="Nombre" onChange={handleChange} className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
                <input type="text" name="apellido" value={formData.apellido} placeholder="Apellido" onChange={handleChange} className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
              </div>
              <input type="email" name="email" value={formData.email} placeholder="Correo electrónico" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
              <input type="tel" name="telefono" value={formData.telefono} placeholder="Teléfono (WhatsApp)" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
              <input type="text" name="direccion" value={formData.direccion} placeholder="Dirección exacta (Ej: Calle 9 1234, La Plata)" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
              
              {/* NUEVOS CAMPOS: DNI y CP para envíos */}
              <div className="flex gap-2">
                <input type="text" name="dni" placeholder="DNI (Para el correo)" onChange={handleChange} className="w-2/3 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
                <input type="text" name="cp" placeholder="C. Postal" onChange={handleChange} className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21]" />
              </div>
            </div>

            {/* BLOQUE 1: CANTIDAD DE PAQUETES (Independiente) */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
              <span className="font-medium text-gray-700">Cantidad de paquetes:</span>
              <div className="flex items-center gap-4">
                <button onClick={() => handleCantidad("restar")} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-xl text-gray-600 hover:bg-gray-100">-</button>
                <span className="font-bold text-lg w-4 text-center">{formData.cantidad}</span>
                <button onClick={() => handleCantidad("sumar")} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-xl text-gray-600 hover:bg-gray-100">+</button>
              </div>
            </div>

            {/* BLOQUE 2: ZONA Y MÉTODO DE ENVÍO (Independiente) */}
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-sm text-gray-600 font-medium ml-1">Modalidad de entrega</label>
              <select 
                name="zonaEnvio" 
                value={formData.zonaEnvio} 
                onChange={handleChange} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#6b0e21] appearance-none"
              >
                {opcionesEnvio.map((opcion) => (
                  <option key={opcion.id} value={opcion.costo}>
                    {opcion.label} {opcion.costo > 0 ? `(Aprox. $${opcion.costo.toLocaleString('es-AR')})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* BLOQUE 3: OPCIÓN BOOLEANA (Solo aparece si elige un envío con costo) */}
            {formData.zonaEnvio > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-sm text-gray-600 font-medium ml-1">¿Cómo preferís abonar el envío?</span>
                
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.pagarEnvioAhora ? 'border-[#6b0e21] bg-[#fcf3f5]' : 'border-gray-200 bg-white'}`}>
                  <input 
                    type="radio" 
                    name="pagarEnvioAhora" 
                    className="accent-[#6b0e21] w-4 h-4"
                    checked={formData.pagarEnvioAhora === true} 
                    onChange={() => setFormData({...formData, pagarEnvioAhora: true})} 
                  />
                  <span className="text-sm text-gray-700">Lo pago ahora junto con los saquitos</span>
                </label>

                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${!formData.pagarEnvioAhora ? 'border-[#6b0e21] bg-[#fcf3f5]' : 'border-gray-200 bg-white'}`}>
                  <input 
                    type="radio" 
                    name="pagarEnvioAhora" 
                    className="accent-[#6b0e21] w-4 h-4"
                    checked={formData.pagarEnvioAhora === false} 
                    onChange={() => setFormData({...formData, pagarEnvioAhora: false})} 
                  />
                  <span className="text-sm text-gray-700">Lo abono en la sucursal al retirar</span>
                </label>
                
                {/* ACLARACIONES LEGALES / INFORMATIVAS */}
                <p className="text-xs text-gray-500 text-center px-2 mt-1">
                  * Los envíos se realizan únicamente a la sucursal del correo más cercana a tu domicilio. 
                  {!formData.pagarEnvioAhora && " El costo exacto del envío lo abonarás al correo al momento de retirar tu paquete."}
                </p>
              </div>
            )}

            {/* CAJA DE TOTAL CON BORDES BORDÓ CLARITOS */}
            {/* (El código del total queda exactamente igual) */}

            {/* CAJA DE TOTAL CON BORDES BORDÓ CLARITOS */}
            <div className="bg-[#fcf3f5] p-4 rounded-lg border border-[#e6b8c1] mt-2 text-center">
              <p className="text-sm text-[#8c1f35] mb-1">Total a transferir:</p>
              <p className="text-3xl font-black text-[#6b0e21] mb-4">${total.toLocaleString('es-AR')}</p>
              
              <div className="text-sm text-gray-600 bg-white p-3 rounded border border-[#e6b8c1]">
                <p>Transferir al alias:</p>
                <p className="font-bold text-gray-800 text-lg my-1">martin.anto.mp</p>
                <p className="text-xs">A nombre de Martín Uriel Antonovich</p>
              </div>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2 ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed text-white" : "bg-[#6b0e21] hover:bg-[#540b1a] text-white"
                }`}
              >
                {isSubmitting ? "Procesando..." : "Enviar y mandar comprobante"}
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}