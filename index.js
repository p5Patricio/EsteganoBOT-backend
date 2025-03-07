const express = require("express");
const multer = require("multer");
const steggy = require("steggy");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Guardar en memoria

// Configurar carpeta temporal para imágenes
const tempDir = path.join(__dirname, "temp");
fs.ensureDirSync(tempDir); // Asegurar que la carpeta temporal existe

// Middleware para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para ocultar mensaje en la imagen
app.post("/hide-message", upload.single("image"), async (req, res) => {
    if (!req.file || !req.body.message) {
        return res.status(400).json({ error: "Imagen y mensaje requeridos" });
    }

    try {
        const imageBuffer = req.file.buffer;
        const message = req.body.message;
        
        // Obtener extensión de archivo original
        const fileExt = path.extname(req.file.originalname).toLowerCase() || '.png';
        const outputPath = path.join(tempDir, `${Date.now()}${fileExt}`);
        
        // Primero guardar la imagen original temporalmente
        await fs.writeFile(outputPath, imageBuffer);
        
        // Ocultar mensaje usando steggy
        const concealed = await steggy.conceal({
            data: message,
            file: outputPath,
            outputFile: outputPath, // Sobrescribir archivo temporal
        });
        
        // Enviar la imagen modificada al usuario
        res.download(outputPath, `stego${fileExt}`, (err) => {
            if (err) console.error("Error al enviar el archivo:", err);
            
            // Eliminar el archivo temporal después de enviarlo
            fs.remove(outputPath).catch(err => 
                console.error("Error al eliminar archivo temporal:", err)
            );
        });

    } catch (error) {
        console.error("Error al ocultar mensaje:", error);
        res.status(500).json({ error: "Error procesando la imagen" });
    }
});

// Ruta para revelar mensaje en una imagen
app.post("/reveal-message", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Imagen requerida" });
    }

    try {
        const tempFilePath = path.join(tempDir, `${Date.now()}_reveal${path.extname(req.file.originalname) || '.png'}`);
        
        // Guardar temporalmente la imagen para procesarla
        await fs.writeFile(tempFilePath, req.file.buffer);
        
        // Extraer el mensaje oculto
        const revealed = await steggy.reveal({
            file: tempFilePath
        });
        
        // Eliminar archivo temporal
        await fs.remove(tempFilePath);
        
        res.json({ message: revealed });

    } catch (error) {
        console.error("Error al revelar mensaje:", error);
        res.status(500).json({ error: "Error extrayendo el mensaje" });
    }
});

// Agregar una ruta básica para testear que el servidor funciona
app.get("/", (req, res) => {
    res.send("API de esteganografía funcionando correctamente");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));