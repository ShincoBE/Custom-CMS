// Vercel Serverless Function - API Router
// This single file consolidates all API logic to stay within the Vercel Hobby plan limits.
const { createClient } = require('@vercel/kv');
const { put } = require('@vercel/blob');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const { URL } = require('url');

// --- START: SHARED UTILITIES ---

// Initialize the Vercel KV client.
// For `@vercel/kv` v2+, this requires the KV_REST_API_URL and KV_REST_API_TOKEN
// environment variables to be correctly set in the Vercel project.
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Helper to authenticate requests using JWT from cookies
function authenticateRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  if (!token) {
    throw new Error('Authentication required.');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}

// Helper function to convert a readable stream to a buffer for file uploads
async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// --- END: SHARED UTILITIES ---

// --- START: DEFAULT CONTENT ---
const DEFAULT_CONTENT = {
  pageContent: {
    _id: "singleton-content",
    navHome: "Home",
    navServices: "Diensten",
    navBeforeAfter: "Voor & Na",
    navGallery: "Galerij",
    navContact: "Contact",
    companyName: "Andries Service+",
    heroTitle: "Uw tuin, onze passie.",
    heroTagline: "Professioneel onderhoud voor een onberispelijke tuin.",
    heroButtonText: "Vraag Offerte Aan",
    servicesTitle: "Onze Diensten",
    servicesSubtitle: "Wij bieden een breed scala aan diensten om uw tuin en woning in topconditie te houden.",
    servicesList: [],
    beforeAfterTitle: "Voor & Na",
    beforeAfterSubtitle: "Zie het verschil dat professioneel onderhoud maakt.",
    servicesCtaTitle: "Bekijk Ons Werk",
    servicesCtaSubtitle: "Een foto zegt meer dan duizend woorden. Ontdek onze projecten in de galerij.",
    servicesCtaButtonText: "Open Galerij",
    galleryTitle: "Galerij",
    gallerySubtitle: "Een selectie van onze voltooide projecten.",
    contactTitle: "Neem Contact Op",
    contactSubtitle: "Heeft u vragen of wilt u een vrijblijvende offerte? Wij staan voor u klaar.",
    contactInfoTitle: "Contactgegevens",
    contactInfoText: "U kunt ons bereiken via de onderstaande gegevens, of door het formulier in te vullen.",
    contactAddressTitle: "Adres",
    contactAddress: "Hazenstraat 65\n2500 Lier\nBelgië",
    contactEmailTitle: "Email",
    contactEmail: "info.andries.serviceplus@gmail.com",
    contactPhoneTitle: "Telefoon",
    contactPhone: "+32 494 39 92 86",
    contactFormNameLabel: "Naam",
    contactFormEmailLabel: "Emailadres",
    contactFormMessageLabel: "Uw bericht",
    contactFormSubmitButtonText: "Verstuur Bericht",
    contactFormSuccessTitle: "Bericht Verzonden!",
    contactFormSuccessText: "Bedankt voor uw bericht. We nemen zo spoedig mogelijk contact met u op.",
    contactFormSuccessAgainButtonText: "Nog een bericht sturen",
    contactMapEnabled: true,
    contactMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2503.491333794334!2d4.57099631583015!3d51.1357909795757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3f0e0f0e0f0e1%3A0x8e0e0e0e0e0e0e0e!2sHazenstraat%2065%2C%202500%20Lier%2C%20Belgium!5e0!3m2!1sen!2sus!4v1620000000000",
    facebookUrl: "https://www.facebook.com/",
    footerCopyrightText: "Andries Service+. Alle rechten voorbehouden.",
    logo: { url: '/favicon.svg', alt: 'Andries Service+ Logo' },
    heroImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg', alt: 'Mooi onderhouden tuin' },
    beforeImage: { url: 'https://i.postimg.cc/L8gP8SYb/before-image.jpg', alt: 'Tuin voor onderhoud' },
    afterImage: { url: 'https://i.postimg.cc/j5XbQ8cQ/after-image.jpg', alt: 'Tuin na onderhoud' },
    ogImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg', alt: 'Andries Service+ Tuinonderhoud' },
  },
  galleryImages: [],
};
// --- END: DEFAULT CONTENT ---

// --- START: API HANDLERS (LOGIC FROM INDIVIDUAL FILES) ---

// From: api/contact.js
async function handleContact(req, res) {
  const { name, email, message, fax } = req.body;
  if (fax) return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !message) return res.status(400).json({ error: 'Alle velden zijn verplicht.' });
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Voer een geldig emailadres in.' });
  if (message.length < 10 || message.length > 500) return res.status(400).json({ error: 'Bericht moet tussen 10 en 500 tekens lang zijn.' });

  try {
    const settings = await kv.get('settings');
    const emailUser = settings?.emailUser || process.env.EMAIL_USER;
    const emailPass = settings?.emailPass || process.env.EMAIL_PASS;
    const emailTo = settings?.emailTo || process.env.EMAIL_TO;
    
    if (!emailUser || !emailPass || !emailTo) {
      throw new Error('E-mailconfiguratie ontbreekt. Configureer dit op de instellingenpagina in het admin panel.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    });

    const adminMailOptions = {
      from: `"Andries Service+ Website" <${emailUser}>`,
      to: emailTo,
      replyTo: email,
      subject: `[Andries Service+] Nieuw bericht van ${name}`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #22c55e;">Nieuw bericht van ${name}</h2><p><strong>Email:</strong> ${email}</p><p><strong>Bericht:</strong></p><p style="white-space: pre-wrap;">${message}</p></div>`,
    };
    
    const confirmationMailOptions = {
        from: `"Andries Service+" <${emailUser}>`,
        to: email,
        subject: `Bevestiging: Wij hebben uw bericht ontvangen!`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #22c55e;">Bedankt voor uw bericht, ${name}!</h2><p>We hebben uw bericht in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.</p></div>`
    }

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(confirmationMailOptions);
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message || 'Sorry, uw bericht kon niet worden verzonden.' });
  }
}

// From: api/content.js
async function handleGetContent(req, res) {
  try {
    let [pageContent, galleryImages, settings] = await Promise.all([
      kv.get('pageContent'),
      kv.get('galleryImages'),
      kv.get('settings'),
    ]);

    // If content is not found (e.g., first run), return default content.
    // This allows the admin panel to load and the site to have initial data.
    if (!pageContent) {
      pageContent = DEFAULT_CONTENT.pageContent;
    }
    if (galleryImages === null || galleryImages === undefined) {
      galleryImages = DEFAULT_CONTENT.galleryImages;
    }
    if (!settings) {
      settings = {};
    }
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ pageContent, galleryImages, settings });
  } catch (error) {
    console.error('Error fetching content from KV:', error);
    return res.status(500).json({ error: 'Failed to fetch content.' });
  }
}

// From: api/update-content.js
async function handleUpdateContent(req, res) {
  try {
    authenticateRequest(req);
    const { pageContent, galleryImages, settings } = req.body;
    if (!pageContent || galleryImages === undefined || settings === undefined) return res.status(400).json({ error: 'Invalid payload.' });
    
    // Versioning
    const [currentContent, currentGallery, currentSettings] = await Promise.all([kv.get('pageContent'), kv.get('galleryImages'), kv.get('settings')]);
    if (currentContent && (currentGallery !== null && currentGallery !== undefined) && currentSettings) {
      const timestamp = new Date().toISOString();
      const historyEntryKey = `history:${timestamp}`;
      await kv.set(historyEntryKey, { pageContent: currentContent, galleryImages: currentGallery, settings: currentSettings }, { ex: 60 * 60 * 24 * 30 });
      await kv.lpush('content_history', historyEntryKey);
      await kv.ltrim('content_history', 0, 9);
    }

    await Promise.all([
      kv.set('pageContent', pageContent), 
      kv.set('galleryImages', galleryImages),
      kv.set('settings', settings)
    ]);
    return res.status(200).json({ success: true, message: 'Content en instellingen succesvol opgeslagen!' });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/upload.js
async function handleUpload(req, res) {
    try {
        authenticateRequest(req);
        const filename = req.headers['x-vercel-filename'];
        if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'Filename is missing.' });

        const imageBuffer = await streamToBuffer(req);
        const optimizableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        let finalBuffer = imageBuffer, finalFilename = filename, finalContentType = req.headers['content-type'];

        if (optimizableTypes.includes(finalContentType)) {
            finalBuffer = await sharp(imageBuffer).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
            finalFilename = `${filename.split('.').slice(0, -1).join('.')}.webp`;
            finalContentType = 'image/webp';
        }

        const blob = await put(finalFilename, finalBuffer, { access: 'public', cacheControl: 'public, max-age=0, must-revalidate', contentType: finalContentType });
        return res.status(200).json(blob);
    } catch (error) {
        return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: 'Upload failed.' });
    }
}


// From: api/login.js
async function handleLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
  try {
    const user = await kv.get(`user:${username}`);
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) return res.status(401).json({ error: 'Invalid username or password.' });
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', maxAge: 604800, path: '/' }));
    return res.status(200).json({ success: true, user: { username: user.username } });
  } catch (error) {
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

// From: api/logout.js
async function handleLogout(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', expires: new Date(0), path: '/' }));
  return res.status(200).json({ success: true, message: 'Logged out.' });
}

// From: api/verify-auth.js
async function handleVerifyAuth(req, res) {
  try {
    const decoded = authenticateRequest(req);
    return res.status(200).json({ user: { username: decoded.username } });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// From: api/users/index.js
async function handleListUsers(req, res) {
  try {
    authenticateRequest(req);
    const userKeys = await kv.keys('user:*');
    const usernames = userKeys.map(key => key.split(':')[1]);
    return res.status(200).json({ users: usernames });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/users/create.js
async function handleCreateUser(req, res) {
  try {
    authenticateRequest(req);
    const { username, password } = req.body;
    if (!username || !password || username.length < 3 || password.length < 8) return res.status(400).json({ error: 'Invalid username or password format.' });
    if (await kv.exists(`user:${username}`)) return res.status(409).json({ error: 'Username is already in use.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await kv.set(`user:${username}`, { username, hashedPassword });
    return res.status(201).json({ success: true, message: `User '${username}' created.` });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/users/delete.js
async function handleDeleteUser(req, res) {
  try {
    const decoded = authenticateRequest(req);
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required.' });
    if (username === decoded.username) return res.status(403).json({ error: 'You cannot delete your own account.' });
    if ((await kv.del(`user:${username}`)) === 0) return res.status(404).json({ error: `User '${username}' not found.` });
    return res.status(200).json({ success: true, message: `User '${username}' deleted.` });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/content-history.js
async function handleGetHistory(req, res) {
  try {
    authenticateRequest(req);
    const historyKeys = await kv.lrange('content_history', 0, -1);
    const timestamps = historyKeys.map(key => key.replace('history:', ''));
    return res.status(200).json({ history: timestamps });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/revert-content.js
async function handleRevertContent(req, res) {
  try {
    authenticateRequest(req);
    const { timestamp } = req.body;
    if (!timestamp) return res.status(400).json({ error: 'Timestamp is required.' });
    const historicalContent = await kv.get(`history:${timestamp}`);
    if (!historicalContent) return res.status(404).json({ error: 'Historical version not found.' });
    await Promise.all([kv.set('pageContent', historicalContent.pageContent), kv.set('galleryImages', historicalContent.galleryImages)]);
    return res.status(200).json({ success: true, message: `Content restored to version from ${timestamp}.` });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// Test email settings
async function handleTestEmail(req, res) {
  try {
    authenticateRequest(req);
    const { emailUser, emailPass, emailTo } = req.body;
    if (!emailUser || !emailPass || !emailTo) {
        return res.status(400).json({ error: 'Alle e-mailvelden zijn verplicht voor de test.' });
    }
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass },
    });

    const testMailOptions = {
        from: `"Andries Service+ CMS" <${emailUser}>`,
        to: emailTo,
        subject: `[Test] E-mail Instellingen`,
        html: `<p>Dit is een testbericht van de Andries Service+ website.</p><p>Als u dit bericht ontvangt, zijn uw e-mailinstellingen correct geconfigureerd.</p>`,
    };
    
    await transporter.sendMail(testMailOptions);
    return res.status(200).json({ success: true, message: `Test-e-mail succesvol verzonden naar ${emailTo}!` });

  } catch (error) {
    console.error('Test email failed:', error);
    return res.status(500).json({ error: 'Test-e-mail mislukt. Controleer de gegevens.' });
  }
}


// --- END: API HANDLERS ---


// --- MAIN ROUTER ---
module.exports = async (req, res) => {
  // Vercel populates req.body for JSON requests by default.
  // The upload handler reads the raw stream, which is still available.
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Public routes (no auth needed)
  if (path === '/api/contact' && req.method === 'POST') return handleContact(req, res);
  if (path === '/api/content' && req.method === 'GET') return handleGetContent(req, res);
  if (path === '/api/login' && req.method === 'POST') return handleLogin(req, res);

  // Authenticated routes
  if (path === '/api/update-content' && req.method === 'POST') return handleUpdateContent(req, res);
  if (path === '/api/upload' && req.method === 'POST') return handleUpload(req, res);
  if (path === '/api/logout' && req.method === 'POST') return handleLogout(req, res);
  if (path === '/api/verify-auth' && req.method === 'GET') return handleVerifyAuth(req, res);
  if (path === '/api/users' && req.method === 'GET') return handleListUsers(req, res);
  if (path === '/api/users/create' && req.method === 'POST') return handleCreateUser(req, res);
  if (path === '/api/users/delete' && req.method === 'POST') return handleDeleteUser(req, res);
  if (path === '/api/content-history' && req.method === 'GET') return handleGetHistory(req, res);
  if (path === '/api/revert-content' && req.method === 'POST') return handleRevertContent(req, res);
  if (path === '/api/test-email' && req.method === 'POST') return handleTestEmail(req, res);

  return res.status(404).json({ error: 'Not Found' });
};