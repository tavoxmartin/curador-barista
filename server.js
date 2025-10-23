/*
 * -------------------------------------------
 * PASO 1: IMPORTAR LAS HERRAMIENTAS
 * -------------------------------------------
 */
const express = require('express');
const cors = require('cors');
// ¡NUEVA HERRAMIENTA IMPORTADA!
const { Resend } = require('resend');

/*
 * -------------------------------------------
 * PASO 2: CONFIGURACIÓN INICIAL
 * -------------------------------------------
 */
const app = express();
const port = 3000;

// Configurar Resend, leyendo la API Key de forma segura desde las variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

/*
 * -------------------------------------------
 * PASO 3: CONFIGURACIÓN DE TU TIENDA
 * -------------------------------------------
 */
const TIENDA_URL = "https://curador.es";
const PRODUCTOS_DB = {
    "etiopia guji": "44888195432688", 
    "colombia supremo": "44888195432699",
};

/*
 * -------------------------------------------
 * PASO 4: EL WEBHOOK (CON ENVÍO DE EMAIL REAL)
 * -------------------------------------------
 */
app.post('/api/crear-enlace-compra', async (req, res) => {
    
    const { productoNombre, emailCliente } = req.body;
    console.log(`[WEBHOOK RECIBIDO] Petición para: ${productoNombre}, Email: ${emailCliente}`);

    if (!productoNombre || !emailCliente) {
        console.log("Error: Faltaron datos en la petición.");
        return res.status(400).json({ status: "error", message: "Falta productoNombre o emailCliente" });
    }

    const variantId = PRODUCTOS_DB[productoNombre.toLowerCase().trim()];

    if (!variantId) {
        console.log(`Error: Producto no encontrado: ${productoNombre}`);
        return res.json({ status: "producto_no_encontrado", message: "Ese producto no lo pude encontrar." });
    }

    const enlaceCarrito = `${TIENDA_URL}/cart/${variantId}:1`;
    console.log(`Enlace de carrito creado: ${enlaceCarrito}`);

    // --- ¡AQUÍ EMPIEZA EL ENVÍO DE EMAIL REAL! ---
    try {
        // Usamos la herramienta 'resend' para enviar el correo
        const { data, error } = await resend.emails.send({
            // IMPORTANTE: En el plan gratuito de Resend,
            // solo puedes enviar desde este email de prueba.
            from: 'onboarding@resend.dev',
            // El 'to' es el email que nos dio el agente
            to: emailCliente,
            subject: 'Tu enlace de compra de Curador.es',
            // El cuerpo del email, puede ser HTML
            html: `¡Hola! <br><br>
                   Tu asistente barista ha preparado tu carrito. <br><br>
                   <strong><a href="${enlaceCarrito}">Haz clic aquí para finalizar tu compra</a></strong>
                   <br><br>
                   ¡Que disfrutes tu café!`
        });

        // Si Resend da un error
        if (error) {
            console.error("Error al enviar email desde Resend:", error);
            // Le avisamos a ElevenLabs que el email falló
            return res.json({ status: "error_email", message: "Tuve un problema al enviar el correo." });
        }

        // ¡Todo salió bien!
        console.log(`Email enviado exitosamente, ID: ${data.id}`);
        res.json({ 
            status: "ok", 
            message: "Correo enviado exitosamente" 
        });

    } catch (error) {
        // Error general del servidor
        console.error("Error general en el Webhook:", error);
        res.status(500).json({ status: "error_servidor", message: "Hubo un fallo general en el sistema." });
    }
});

/*
 * -------------------------------------------
 * PASO 5: INICIAR EL SERVIDOR
 * -------------------------------------------
 */
app.listen(port, () => {
    console.log(`¡Servidor Backend (Webhook) iniciado! 🚀`);
    console.log(`Escuchando en http://localhost:${port}`);
});});