/*
 * -------------------------------------------
 * ASISTENTE BARISTA - SERVIDOR WEBHOOK
 * -------------------------------------------
 */

/*
 * -------------------------------------------
 * PASO 1: IMPORTAR LAS HERRAMIENTAS
 * -------------------------------------------
 */
const express = require('express');
const cors = require('cors');
// Importamos Resend para enviar correos
const { Resend } = require('resend');

/*
 * -------------------------------------------
 * PASO 2: CONFIGURACIÓN INICIAL
 * -------------------------------------------
 */
const app = express(); // 'app' es nuestro servidor
const port = 3000;     // El puerto donde Render lo ejecutará

// Configuramos Resend, leyendo la API Key de forma segura desde las variables de Render
const resend = new Resend(process.env.RESEND_API_KEY);

// Middlewares: Configuraciones que se ejecutan en cada petición
app.use(cors());       // Permite que Eleven Labs llame a este servidor
app.use(express.json()); // Permite al servidor entender el formato JSON

/*
 * -------------------------------------------
 * PASO 3: BASES DE DATOS (PRODUCTOS Y RECETAS)
 * -------------------------------------------
 */
const TIENDA_URL = "https://curador.es";

// --- Base de datos de IDs de productos ---
// (Debes poner aquí los IDs de variante de Shopify)
const PRODUCTOS_DB = {
    // "nombre en minúsculas": "ID_DE_VARIANTE"
    "brasil sure shot": "57568609567069", 
    "peru orgánico dark knight": "56529625743709",
    "colombia la piragua": "57650104959325", 
    "colombia la fabrica": "57507088892253",
    "venezuela agua fria pink bourbon": "58767230959965", 
    "venezuela los naranjos": "58517184217437",
    "venezuela tukeke": "56120635818333", 
    "brasil serrinha": "56340610482525",
    "etiopia burtukaana": "56529511678301",
    "kenia karimikui aa": "56332719653213", 
    "guatemala natural": "58197453767005",
    "colombia bubble gum": "58838890316125", 
};

// --- Base de datos de Recetas ---
// (Las claves deben coincidir con las de PRODUCTOS_DB)
// (Puedes usar HTML simple para el formato)
const RECETAS_DB = {
    "brasil serrinha": `//Brasil Serrinha
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
"brasil sure shot": `//Brasil Sure Shot
        <strong>Receta Sugerida para Espresso:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:2 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 36g de bebida en la taza</li>
            <li><strong>Agua:</strong> 93°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 28 - 32 segundos.</li>
    `,
    "peru orgánico dark knight": ` //Perú Orgánico Dark Knight
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
    "venezuela los naranjos": `
        <strong>Receta Sugerida para Espresso:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:2 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 36g de bebida en la taza</li>
            <li><strong>Agua:</strong> 93°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 28 - 32 segundos.</li>
    `,
 "colombia la fabrica": `
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
"colombia la piragua": `
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
"etiopia burtukaana": `
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
"kenia karimikui aa": `//Kenia Karimikui
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
"guatemala natural": `//Guatemala Las Flores
        <strong>Receta Sugerida para Espresso:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:2 (18g de café en el portafiltro)</li>
            <li><strong>Resultado:</strong> 36g de bebida en la taza</li>
            <li><strong>Agua:</strong> 93°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 28 - 32 segundos.</li>
    `,
"colombia bubble gum": `//Colombia Bubble Gum
        <strong>Receta Sugerida para Moka Italiana:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café en el portafiltro)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 3 minutos.</li>
    `,
"venezuela tukeke": `//Venezuela Tukeke
        <strong>Receta Sugerida para Moka Italiana:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café en el portafiltro)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 3 minutos.</li>
    `,
"venezuela agua fria Pink bourbon": `//Venezuela Agua Fria Pink Bourbon
        <strong>Receta Sugerida para Moka Italiana:</strong><br>
        <ul>
            <li><strong>Ratio:</strong> 1:15 (20g de café en el portafiltro)</li>
            <li><strong>Agua:</strong> 94°C</li>
            <li><strong>Molienda:</strong> Fina</li>
            <li><strong>Tiempo de extracción:</strong> 3 minutos.</li>
    `
};

/*
 * -------------------------------------------
 * PASO 4: EL ENDPOINT DEL WEBHOOK
 * -------------------------------------------
 * Esta es la URL que Eleven Labs llamará: /api/crear-enlace-compra
 */
app.post('/api/crear-enlace-compra', async (req, res) => {
    
    // 1. Leer los datos que nos envía Eleven Labs
    const { productoNombre, emailCliente } = req.body;
    console.log(`[WEBHOOK RECIBIDO] Petición para: ${productoNombre}, Email: ${emailCliente}`);

    // Validar que los datos llegaron
    if (!productoNombre || !emailCliente) {
        console.log("Error: Faltaron datos en la petición.");
        return res.status(400).json({ status: "error", message: "Falta productoNombre o emailCliente" });
    }

    // --- ¡ESTA ES LA LÍNEA QUE FALTABA! ---
    // Normalizamos el nombre del producto (minúsculas, sin espacios extra)
    const productoKey = productoNombre.toLowerCase().trim();

    // 2. Buscar Producto y Receta
    const variantId = PRODUCTOS_DB[productoKey];
    const recetaHtml = RECETAS_DB[productoKey];

    // 3. Validar si el producto existe
    if (!variantId) {
        console.log(`Error: Producto no encontrado: ${productoNombre}`);
        return res.json({ status: "producto_no_encontrado", message: "Ese producto no lo pude encontrar." });
    }

    // 4. Construir el enlace del carrito
    const enlaceCarrito = `${TIENDA_URL}/cart/${variantId}:1`;
    console.log(`Enlace de carrito creado: ${enlaceCarrito}`);

    // 5. Construir el cuerpo del Email
    let htmlBody = `
        ¡Hola! <br><br>
        Tu asistente barista ha preparado tu carrito. <br><br>
        <strong><a href="${enlaceCarrito}">Haz clic aquí para finalizar tu compra</a></strong>
        <br><br>
        ¡Que disfrutes tu café!
    `;

    // 6. Añadir la receta si existe
    if (recetaHtml) {
        console.log("Receta encontrada. Añadiendo al email.");
        htmlBody += `
            <br><br><hr><br>
            <h3>Aquí tienes tu receta para ${productoNombre}:</h3>
            ${recetaHtml}
        `;
    } else {
        console.log(`No se encontró receta para: ${productoKey}`);
    }

    // 7. Enviar el Correo
    try {
        const { data, error } = await resend.emails.send({
            // (Recuerda cambiar 'from' cuando verifiques tu dominio 'curador.es' en Resend)
            //from: 'onboarding@resend.dev',
            from: 'pedidos@hola.curador.coffee', 
            to: emailCliente, // El email que nos dio el usuario
            subject: 'Tu enlace de compra y receta de Curador.es', // Asunto actualizado
            html: htmlBody // El HTML que acabamos de construir
        });

        // 8. Manejar error de Resend
        if (error) {
            console.error("Error al enviar email desde Resend:", error);
            return res.json({ status: "error_email", message: "Tuve un problema al enviar el correo." });
        }

        // 9. ¡Éxito!
        console.log(`Email enviado exitosamente, ID: ${data.id}`);
        // Le respondemos a Eleven Labs que todo salió bien
        res.json({ 
            status: "ok", 
            message: "Correo enviado exitosamente" 
        });

    } catch (error) {
        // 10. Manejar error del servidor
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
    console.log(`Asegúrate de que tus variables de entorno (RESEND_API_KEY) están cargadas.`);
});