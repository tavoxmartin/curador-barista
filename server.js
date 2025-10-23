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
    "brasil sure shot": "57568609567069", 
    "peru organico dark knight": "56529625743709",
    "colombia la piragua": "57650104959325", 
    "colombia la fabrica": "57507088892253",
    "venezuela Agua Fria Pink Bourbon": "58767230959965", 
    "venezuela Los Naranjos": "58517184217437",
    "venezuela Tukeke": "56120635818333", 
    "brasil serrinha": "56340610482525",
    "etiopia burtukaana": "56529511678301",
    "kenia karimikui aa": "56332719653213", 
    "guatemala natural": "58197453767005",
    "colombia bubble gum": "58838890316125", 
};

// --- ¡NUEVO! ---
// Tu base de datos de recetas.
// Las claves (ej. "brasil sure shot") deben coincidir EXACTAMENTE
// con las claves de PRODUCTOS_DB.
const RECETAS_DB = {
    "56340610482525": `//Brasil Serrinha
        <strong>Receta Sugerida para V60:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café por 300ml de agua)</li>
            <li><strong>Agua:</strong> 92°C</li>
            <li><strong>Molienda:</strong> Media-fina (como sal de mesa)</li>
            <li><strong>Pasos:</strong></li>
            <ol>
                <li>Vierte 50ml de agua para el "bloom" y espera 30 segundos.</li>
                <li>Vierte el resto del agua lentamente en círculos.</li>
                <li>Tiempo total de extracción: 2:30 - 3:00 minutos.</li>
            </ol>
    `,
"57568609567069": `//Brasil Sure Shot
        <strong>Receta Sugerida para Espresso:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:2 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 36g de bebida en la taza</li>
            <li><strong>Agua:</strong> 93°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 28 - 32 segundos.</li>
    `,
    "56529625743709": ` //Perú Orgánico Dark Knight
        <strong>Receta Sugerida para Prensa Francesa:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:12 (30g de café por 360ml de agua)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Gruesa</li>
            <li><strong>Pasos:</strong></li>
            <ol>
                <li>Vierte toda el agua, rompe la costra a los 4:00 minutos.</li>
                <li>Espera a que decante y presiona el émbolo suavemente.</li>
            </ol>
    `,
    "58517184217437": `
        <strong>Receta Sugerida para Espresso:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:2 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 36g de bebida en la taza</li>
            <li><strong>Agua:</strong> 93°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 28 - 32 segundos.</li>
    `,
 "57507088892253": `
        <strong>Receta Sugerida para Aeropress:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 270g de bebida en la taza</li>
            <li><strong>Agua:</strong> 90°C</li>
            <li><strong>Molienda:</strong> Media</li>
            <li><strong>Tiempo de extracción:</strong> 2 minutos y 15 segundos.</li>
            <li><strong>Pasos:</strong></li>
            <ol>
                <li>Vierte 50ml de agua para el "bloom" y espera 30 segundos.</li>
                <li>Vierte el resto del agua lentamente en círculos.</li>
                <li>Tiempo total de extracción: 2:30 - 3:00 minutos.</li>
            </ol>        
    `,
"57650104959325": `
        <strong>Receta Sugerida para Aeropress:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 270g de bebida en la taza</li>
            <li><strong>Agua:</strong> 90°C</li>
            <li><strong>Molienda:</strong> Media</li>
            <li><strong>Tiempo de extracción:</strong> 2 minutos y 15 segundos.</li>
            <li><strong>Pasos:</strong></li>
            <ol>
                <li>Vierte 50ml de agua para el "bloom" y espera 30 segundos.</li>
                <li>Vierte el resto del agua lentamente en círculos.</li>
                <li>Tiempo total de extracción: 2:30 - 3:00 minutos.</li>
            </ol>        
    `,	
"56529511678301": `
        <strong>Receta Sugerida para Aeropress:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 270g de bebida en la taza</li>
            <li><strong>Agua:</strong> 90°C</li>
            <li><strong>Molienda:</strong> Media</li>
            <li><strong>Tiempo de extracción:</strong> 2 minutos y 15 segundos.</li>
            <li><strong>Pasos:</strong></li>
            <ol>
                <li>Vierte 50ml de agua para el "bloom" y espera 30 segundos.</li>
                <li>Vierte el resto del agua lentamente en círculos.</li>
                <li>Tiempo total de extracción: 2:30 - 3:00 minutos.</li>
            </ol>        
    `,
"56332719653213": `//Kenia Karimikui
        <strong>Receta Sugerida para V60:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café por 300ml de agua)</li>
            <li><strong>Agua:</strong> 92°C</li>
            <li><strong>Molienda:</strong> Media-fina (como sal de mesa)</li>
            <li><strong>Pasos:</strong></li>
            <ol>
                <li>Vierte 50ml de agua para el "bloom" y espera 30 segundos.</li>
                <li>Vierte el resto del agua lentamente en círculos.</li>
                <li>Tiempo total de extracción: 2:30 - 3:00 minutos.</li>
            </ol>
    `,
"58197453767005": `//Guatemala Las Flores
        <strong>Receta Sugerida para Espresso:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:2 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 36g de bebida en la taza</li>
            <li><strong>Agua:</strong> 93°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 28 - 32 segundos.</li>
    `,
"58838890316125": `//Colombia Bubble Gum
        <strong>Receta Sugerida para Moka Italiana:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café en el portafiltro)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 3 minutos.</li>
    `,
"56120635818333": `//Venezuela Tukeke
        <strong>Receta Sugerida para Moka Italiana:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café en el portafiltro)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 3 minutos.</li>
    `,
"58767230959965": `//Venezuela Agua Fria Pink Bourbon
        <strong>Receta Sugerida para Moka Italiana:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café en el portafiltro)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 3 minutos.</li>
    `,
    // ¡Añade aquí tus otras recetas!
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
    const recetaHtml = RECETAS_DB[productoKey]; // ¡NUEVO RECETA!

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
            //from: 'onboarding@resend.dev',
	    // POR ESTO:
              from: 'pedidos@hola.curador.coffee', 
            // El 'to' es el email que nos dio el agente
            to: emailCliente,
            subject: 'Tu enlace de compra Y receta de Curador Coffee',
            // El cuerpo del email, puede ser HTML
            html: `¡Hola! <br><br>
                   Nuestro asistente barista ha preparado tu carrito. <br><br>
                   <strong><a href="${enlaceCarrito}">Haz clic aquí para finalizar tu compra</a></strong>
                   <br><br>
                   ¡Que disfrutes tu café!`
        });
        // ¡NUEVO! Añadimos la receta si existe
        if (recetaHtml) {
        console.log("Receta encontrada. Añadiendo al email.");
        htmlBody += `
            <br><br><hr><br>
            <h3>Aquí tienes tu receta para ${productoNombre}:</h3>
            ${recetaHtml}
        `;
    } else {
        console.log("No se encontró receta para este producto.");
    }

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
});