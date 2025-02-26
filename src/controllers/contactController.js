// server/src/controllers/contactController.js
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

// Configura la API key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (req, res) => {
  try {
    const { subject, email, message } = req.body;
    
    // Validación básica
    if (!subject || !email || !message) {
      return res.status(400).json({ 
        message: 'Por favor, complete todos los campos requeridos' 
      });
    } 

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Por favor, ingrese un email válido' 
      });
    }

    // Preparar los archivos adjuntos si existen
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        content: file.buffer.toString('base64'),
        filename: file.originalname,
        type: file.mimetype, 
        disposition: 'attachment'
      }));
    }

    // Construir el mensaje de email
    const msg = {
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `Contacto TOYO: ${subject}`,
      text: `Email de contacto: ${email}\nMensaje: ${message}`,
      html: `
        <strong>Email de contacto:</strong> ${email}<br><br>
        <strong>Mensaje:</strong><br>
        ${message.replace(/\n/g, '<br>')}
      `,
      attachments
    };

    // Enviar el email
    await sgMail.send(msg);
    
    res.status(200).json({ 
      message: 'Email enviado correctamente' 
    });
    
  } catch (error) {
    console.error('Error al enviar email:', error);
    
    // Manejar diferentes tipos de errores
    if (error.code === 401) {
      return res.status(401).json({ 
        message: 'Error de autenticación con el servicio de email' 
      });
    }
    
    if (error.code === 413) {
      return res.status(413).json({ 
        message: 'Los archivos adjuntos son demasiado grandes' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error al enviar el mensaje. Por favor, intente nuevamente' 
    });
  }
};

module.exports = {
  sendEmail
};