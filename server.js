/*
 * -------------------------------------------
 * PASO 1: IMPORTAR LAS HERRAMIENTAS
 * -------------------------------------------
 * Aquí le decimos a Node.js que cargue las
 * herramientas (paquetes) que acabamos de instalar.
 */
const express = require('express'); // El framework para crear el servidor
const cors = require('cors');       // El middleware para permitir conexiones externas

/*
 * -------------------------------------------
 * PASO 2: CONFIGURACIÓN INICIAL
 * -------------------------------------------
 */
const app = express(); // 'app' es nuestro servidor
const port = 3000;     // El puerto donde escuchará en tu computadora (localhost:3000)

// Middlewares (Configuraciones que se ejecutan en cada petición)
app.use(cors());       // Usar CORS: permite que Eleven Labs llame a este servidor
app.use(express.json()); // Usar express.json: permite al servidor entender datos en formato JSON

/*
 * -------------------------------------------
 * PASO 3: CONFIGURACIÓN DE TU TIENDA
 * -------------------------------------------
 * Aquí pones los datos de tus productos de Shopify.
 */
const TIENDA_URL = "https://curador.es"; // La URL base de tu tienda

// ¡IMPORTANTE! Esta es tu "base de datos" de productos.
// Debes buscar los IDs de VARIANTE (Variant ID) numéricos en tu panel de Shopify.
// (Ve a Productos -> [Tu Producto] -> Variantes -> Editar -> El ID está en la URL)
const PRODUCTOS_DB = {
    // "nombre del producto (en minúsculas)": "ID_DE_VARIANTE_NUMERICO",
    "colombia la fabrica": "57507088892253", 
    "brasil sure shot": "57568609567069",
    // Ejemplo de cómo añadir más:
    // "kenya aa": "44888195432700" 
};

/*
 * -------------------------------------------
 * PASO 4: EL WEBHOOK (EL PUNTO DE ENTRADA)
 * -------------------------------------------
 * Aquí definimos la URL que Eleven Labs llamará.
 * Crearemos la ruta: /api/crear-enlace-compra
 */
app.post('/api/crear-enlace-compra', async (req, res) => {
    
    // 1. Leer los datos que nos envía Eleven Labs (vienen en 'req.body')
    // Asumimos que Eleven Labs nos envía: { "productoNombre": "...", "emailCliente": "..." }
    const { productoNombre, emailCliente } = req.body;
    
    // Imprimimos en nuestra terminal lo que recibimos (para depurar)
    console.log(`[WEBHOOK RECIBIDO] Petición para: ${productoNombre}, Email: ${emailCliente}`);

    // 2. Validar que los datos llegaron
    if (!productoNombre || !emailCliente) {
        console.log("Error: Faltaron datos en la petición.");
        // Devolvemos un error 400 (Mala Petición)
        return res.status(400).json({ status: "error", message: "Falta productoNombre o emailCliente" });
    }

    // 3. Buscar el producto en nuestra base de datos
    const variantId = PRODUCTOS_DB[productoNombre.toLowerCase().trim()];

    if (!variantId) {
        console.log(`Error: Producto no encontrado: ${productoNombre}`);
        // Devolvemos una respuesta JSON a Eleven Labs avisando
        // El agente de IA podrá leer este 'message' y decirle al usuario.
        return res.json({ status: "producto_no_encontrado", message: "Ese producto no lo pude encontrar." });
    }

    // 4. Construir el enlace del carrito
    // El formato de Shopify para añadir al carrito es: /cart/VARIANT_ID:QUANTITY
    const enlaceCarrito = `${TIENDA_URL}/cart/${variantId}:1`;
    console.log(`Enlace de carrito creado: ${enlaceCarrito}`);

    // 5. (SIMULACIÓN) Enviar el correo electrónico
    // En un proyecto real, aquí llamarías a una API de email (ej. SendGrid)
    // Por ahora, solo simulamos que funciona:
    console.log(`SIMULACIÓN: Email enviado a ${emailCliente} con el enlace: ${enlaceCarrito}`);

    // 6. Responder a Eleven Labs que todo salió bien
    // El agente de IA recibirá este JSON y sabrá qué decirle al usuario.
    res.json({ 
        status: "ok", 
        message: "Correo enviado exitosamente" 
    });
});

/*
 * -------------------------------------------
 * PASO 5: INICIAR EL SERVIDOR
 * -------------------------------------------
 * Esto pone al servidor a "escuchar" peticiones en el puerto 3000.
 */
app.listen(port, () => {
    console.log(`¡Servidor Backend (Webhook) iniciado! 🚀`);
    console.log(`Escuchando en http://localhost:${port}`);
    console.log(`El Webhook está en: http://localhost:${port}/api/crear-enlace-compra`);
});