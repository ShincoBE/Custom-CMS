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

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function getUserFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await kv.get(`user:${decoded.username}`);

  if (!user) {
    return null;
  }

  // Data Migration & Role Enforcement: Ensure the primary admin user ("Shinco" or from ENV) is always a SuperAdmin.
  // This corrects accounts that existed before the role system or had their role incorrectly changed.
  if ((user.username === process.env.ADMIN_USER || user.username === 'Shinco') && user.role !== 'SuperAdmin') {
    user.role = 'SuperAdmin';
    await kv.set(`user:${user.username}`, user); // Persist the corrected role
  }

  return user;
}


async function authorizeRequest(req, allowedRoles) {
    const user = await getUserFromRequest(req);
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        throw new Error('Access denied.');
    }
    return user;
}

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
    navHome: "Home", navServices: "Diensten", navBeforeAfter: "Voor & Na", navGallery: "Galerij", navContact: "Contact",
    companyName: "Andries Service+", heroTitle: "Uw tuin, onze passie.", heroTagline: "Professioneel onderhoud voor een onberispelijke tuin.", heroButtonText: "Vraag Offerte Aan",
    servicesTitle: "Onze Diensten", servicesSubtitle: "Wij bieden een breed scala aan diensten om uw tuin en woning in topconditie te houden.", servicesList: [],
    beforeAfterTitle: "Voor & Na", beforeAfterSubtitle: "Zie het verschil dat professioneel onderhoud maakt.",
    servicesCtaTitle: "Bekijk Ons Werk", servicesCtaSubtitle: "Een foto zegt meer dan duizend woorden. Ontdek onze projecten in de galerij.", servicesCtaButtonText: "Open Galerij",
    galleryTitle: "Galerij", gallerySubtitle: "Een selectie van onze voltooide projecten.",
    contactTitle: "Neem Contact Op", contactSubtitle: "Heeft u vragen of wilt u een vrijblijvende offerte? Wij staan voor u klaar.",
    contactInfoTitle: "Contactgegevens", contactInfoText: "U kunt ons bereiken via de onderstaande gegevens, of door het formulier in te vullen.",
    contactAddressTitle: "Adres", contactAddress: "Hazenstraat 65\n2500 Lier\nBelgië",
    contactEmailTitle: "Email", contactEmail: "info.andries.serviceplus@gmail.com",
    contactPhoneTitle: "Telefoon", contactPhone: "+32 494 39 92 86",
    contactFormNameLabel: "Naam", contactFormEmailLabel: "Emailadres", contactFormMessageLabel: "Uw bericht", contactFormSubmitButtonText: "Verstuur Bericht",
    contactFormSuccessTitle: "Bericht Verzonden!", contactFormSuccessText: "Bedankt voor uw bericht. We nemen zo spoedig mogelijk contact met u op.", contactFormSuccessAgainButtonText: "Nog een bericht sturen",
    contactMapEnabled: true, contactMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2503.491333794334!2d4.57099631583015!3d51.1357909795757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3f0e0f0e0f0e1%3A0x8e0e0e0e0e0e0e0e!2sHazenstraat%2065%2C%202500%20Lier%2C%20Belgium!5e0!3m2!1sen!2sus!4v1620000000000",
    facebookUrl: "https://www.facebook.com/", footerCopyrightText: "Andries Service+. Alle rechten voorbehouden.",
    logo: { url: '/favicon.svg', alt: 'Andries Service+ Logo' }, heroImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg', alt: 'Mooi onderhouden tuin' },
    beforeImage: { url: 'https://i.postimg.cc/L8gP8SYb/before-image.jpg', alt: 'Tuin voor onderhoud' }, afterImage: { url: 'https://i.postimg.cc/j5XbQ8cQ/after-image.jpg', alt: 'Tuin na onderhoud' },
    ogImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg', alt: 'Andries Service+ Tuinonderhoud' },
  },
  galleryImages: [],
};
// --- END: DEFAULT CONTENT ---

// --- START: API HANDLERS ---

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
    if (!emailUser || !emailPass || !emailTo) throw new Error('E-mailconfiguratie ontbreekt.');
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
    await transporter.sendMail({ from: `"Andries Service+ Website" <${emailUser}>`, to: emailTo, replyTo: email, subject: `[Andries Service+] Nieuw bericht van ${name}`, html: `<h2>Nieuw bericht van ${name}</h2><p><strong>Email:</strong> ${email}</p><p><strong>Bericht:</strong></p><p>${message}</p>` });
    await transporter.sendMail({ from: `"Andries Service+" <${emailUser}>`, to: email, subject: `Bevestiging: Wij hebben uw bericht ontvangen!`, html: `<h2>Bedankt voor uw bericht, ${name}!</h2><p>We nemen zo spoedig mogelijk contact met u op.</p>` });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Sorry, uw bericht kon niet worden verzonden.' });
  }
}

async function handleGetContent(req, res) {
  try {
    let [pageContent, galleryImages, settings] = await Promise.all([ kv.get('pageContent'), kv.get('galleryImages'), kv.get('settings') ]);
    if (!pageContent) pageContent = DEFAULT_CONTENT.pageContent;
    if (galleryImages === null || galleryImages === undefined) galleryImages = DEFAULT_CONTENT.galleryImages;
    if (!settings) settings = {};
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ pageContent, galleryImages, settings });
  } catch (error) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ error: 'Failed to fetch content.' });
  }
}

async function handleUpdateContent(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin', 'Admin', 'Editor']);
    const { pageContent, galleryImages, settings } = req.body;
    if (!pageContent || galleryImages === undefined || settings === undefined) return res.status(400).json({ error: 'Invalid payload.' });
    const [currentContent, currentGallery, currentSettings] = await Promise.all([kv.get('pageContent'), kv.get('galleryImages'), kv.get('settings')]);
    if (currentContent && (currentGallery !== null && currentGallery !== undefined) && currentSettings) {
      const timestamp = new Date().toISOString();
      await kv.set(`history:${timestamp}`, { pageContent: currentContent, galleryImages: currentGallery, settings: currentSettings }, { ex: 60 * 60 * 24 * 30 });
      await kv.lpush('content_history', timestamp);
      await kv.ltrim('content_history', 0, 9);
    }
    await Promise.all([ kv.set('pageContent', pageContent), kv.set('galleryImages', galleryImages), kv.set('settings', settings) ]);
    return res.status(200).json({ success: true, message: 'Content en instellingen succesvol opgeslagen!' });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleUpload(req, res) {
    try {
        await authorizeRequest(req, ['SuperAdmin', 'Admin', 'Editor']);
        const filename = req.headers['x-vercel-filename'];
        if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'Filename is missing.' });
        const imageBuffer = await streamToBuffer(req);
        const finalBuffer = await sharp(imageBuffer).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
        const finalFilename = `${filename.split('.').slice(0, -1).join('.')}.webp`;
        const blob = await put(finalFilename, finalBuffer, { access: 'public', cacheControl: 'public, max-age=0, must-revalidate', contentType: 'image/webp' });
        return res.status(200).json(blob);
    } catch (error) {
        return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: 'Upload failed.' });
    }
}

async function handleLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Gebruikersnaam en wachtwoord zijn verplicht.' });
  try {
    // Bootstrap SuperAdmin on first login if no users exist
    const userKeys = await kv.keys('user:*');
    if (userKeys.length === 0 && process.env.ADMIN_USER && process.env.ADMIN_PASSWORD) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        await kv.set(`user:${process.env.ADMIN_USER}`, { username: process.env.ADMIN_USER, hashedPassword, role: 'SuperAdmin' });
    }
    const user = await kv.get(`user:${username}`);
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) return res.status(401).json({ error: 'Ongeldige gebruikersnaam of wachtwoord.' });
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', maxAge: 604800, path: '/' }));
    return res.status(200).json({ success: true, user: { username: user.username, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: 'Interne serverfout.' });
  }
}

async function handleLogout(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', expires: new Date(0), path: '/' }));
  return res.status(200).json({ success: true });
}

async function handleVerifyAuth(req, res) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) throw new Error();
    // This is a sensitive, user-specific endpoint. Prevent caching at all levels.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ user: { username: user.username, role: user.role } });
  } catch (error) {
    return res.status(401).json({ error: 'Ongeldige of verlopen token.' });
  }
}

async function handleListUsers(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin']);
    const userKeys = await kv.keys('user:*');
    const users = await (userKeys.length > 0 ? kv.mget(...userKeys) : Promise.resolve([]));
    const userList = users.map(u => ({ username: u.username, role: u.role }));
    return res.status(200).json({ users: userList });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleCreateUser(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin']);
    const { username, password, role } = req.body;
    if (!username || !password || !role || username.length < 3 || password.length < 8) return res.status(400).json({ error: 'Ongeldig formaat voor gebruikersnaam, wachtwoord of rol.' });
    if (role === 'SuperAdmin') return res.status(403).json({ error: 'Kan geen SuperAdmin aanmaken.'});
    if (await kv.exists(`user:${username}`)) return res.status(409).json({ error: 'Gebruikersnaam is al in gebruik.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await kv.set(`user:${username}`, { username, hashedPassword, role });
    return res.status(201).json({ success: true, message: `Gebruiker '${username}' aangemaakt.` });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleDeleteUser(req, res) {
  try {
    const currentUser = await authorizeRequest(req, ['SuperAdmin']);
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Gebruikersnaam is verplicht.' });
    if (username === currentUser.username) return res.status(403).json({ error: 'U kunt uw eigen account niet verwijderen.' });
    if ((await kv.del(`user:${username}`)) === 0) return res.status(404).json({ error: `Gebruiker '${username}' niet gevonden.` });
    return res.status(200).json({ success: true, message: `Gebruiker '${username}' verwijderd.` });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleUpdateUserRole(req, res) {
    try {
      const currentUser = await authorizeRequest(req, ['SuperAdmin']);
      const { username, role } = req.body;
      if (!username || !role) return res.status(400).json({ error: 'Gebruikersnaam en rol zijn verplicht.' });
      if (username === currentUser.username) return res.status(403).json({ error: 'U kunt uw eigen rol niet wijzigen.' });
      const userToUpdate = await kv.get(`user:${username}`);
      if (!userToUpdate) return res.status(404).json({ error: 'Gebruiker niet gevonden.' });
      userToUpdate.role = role;
      await kv.set(`user:${username}`, userToUpdate);
      return res.status(200).json({ success: true, message: `Rol van '${username}' gewijzigd naar ${role}.` });
    } catch (error) {
      return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
    }
  }

async function handleGetHistory(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin']);
    const historyKeys = await kv.lrange('content_history', 0, -1);
    return res.status(200).json({ history: historyKeys });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleRevertContent(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin']);
    const { timestamp } = req.body;
    if (!timestamp) return res.status(400).json({ error: 'Timestamp is verplicht.' });
    const historicalContent = await kv.get(`history:${timestamp}`);
    if (!historicalContent) return res.status(404).json({ error: 'Historische versie niet gevonden.' });
    await Promise.all([ kv.set('pageContent', historicalContent.pageContent), kv.set('galleryImages', historicalContent.galleryImages), kv.set('settings', historicalContent.settings) ]);
    return res.status(200).json({ success: true, message: `Content hersteld naar versie van ${timestamp}.` });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleTestEmail(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin', 'Admin']);
    const { emailUser, emailPass, emailTo } = req.body;
    if (!emailUser || !emailPass || !emailTo) return res.status(400).json({ error: 'Alle e-mailvelden zijn verplicht.' });
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
    await transporter.sendMail({ from: `"Andries Service+ CMS" <${emailUser}>`, to: emailTo, subject: `[Test] E-mail Instellingen`, html: `<p>Dit is een testbericht. Uw e-mailinstellingen zijn correct.</p>` });
    return res.status(200).json({ success: true, message: `Test-e-mail verzonden naar ${emailTo}!` });
  } catch (error) {
    console.error('Test email failed:', error);
    return res.status(500).json({ error: 'Test-e-mail mislukt. Controleer de gegevens.' });
  }
}

// --- END: API HANDLERS ---

// --- MAIN ROUTER ---
module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Middleware to parse JSON body for POST requests
  if (req.method === 'POST') {
    try {
      const bodyBuffer = await streamToBuffer(req);
      req.body = JSON.parse(bodyBuffer.toString() || '{}');
    } catch (e) {
      // Ignore parsing errors for routes that don't expect JSON (like /upload)
      if (!(path === '/api/upload')) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
  }

  if (path === '/api/contact' && req.method === 'POST') return handleContact(req, res);
  if (path === '/api/content' && req.method === 'GET') return handleGetContent(req, res);
  if (path === '/api/login' && req.method === 'POST') return handleLogin(req, res);
  if (path === '/api/update-content' && req.method === 'POST') return handleUpdateContent(req, res);
  if (path === '/api/upload' && req.method === 'POST') return handleUpload(req, res);
  if (path === '/api/logout' && req.method === 'POST') return handleLogout(req, res);
  if (path === '/api/verify-auth' && req.method === 'GET') return handleVerifyAuth(req, res);
  if (path === '/api/users' && req.method === 'GET') return handleListUsers(req, res);
  if (path === '/api/users/create' && req.method === 'POST') return handleCreateUser(req, res);
  if (path === '/api/users/delete' && req.method === 'POST') return handleDeleteUser(req, res);
  if (path === '/api/users/update-role' && req.method === 'POST') return handleUpdateUserRole(req, res);
  if (path === '/api/content-history' && req.method === 'GET') return handleGetHistory(req, res);
  if (path === '/api/revert-content' && req.method === 'POST') return handleRevertContent(req, res);
  if (path === '/api/test-email' && req.method === 'POST') return handleTestEmail(req, res);

  return res.status(404).json({ error: 'Not Found' });
};