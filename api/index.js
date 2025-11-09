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
    servicesTitle: "Onze Diensten", servicesSubtitle: "Wij bieden een breed scala aan diensten om uw tuin en woning in topconditie te houden.", 
    servicesList: [
      {
        _key: 'service_1721234567890',
        title: 'Professioneel Tuinonderhoud',
        description: 'Van wekelijks maaien tot seizoensgebonden snoeiwerk, wij zorgen ervoor dat uw tuin er het hele jaar door onberispelijk uitziet. Geniet van een gezonde, bloeiende tuin zonder zorgen.',
        customIcon: { url: 'https://i.postimg.cc/W4y742AR/gardening-icon.png', alt: 'Icoon van tuingereedschap' },
        published: true,
        hasPage: true,
        slug: 'professioneel-tuinonderhoud',
        pageContent: `<p>Professioneel tuinonderhoud is essentieel om uw tuin het hele jaar door in topconditie te houden. Het is meer dan alleen het gras maaien; het omvat een totaalaanpak die zorgt voor gezonde planten, een strak gazon en een verzorgde uitstraling. Bij Andries Service+ begrijpen we dat elke tuin uniek is. Daarom bieden we op maat gemaakte onderhoudsplannen die perfect aansluiten bij de specifieke behoeften van uw buitenruimte, of het nu gaat om een kleine stadstuin of een groot landelijk perceel.</p><p><br></p><img src="https://i.postimg.cc/T3j2C7K8/garden-maintenance-sample.jpg" alt="Een prachtig onderhouden tuin met bloeiende borders en een groen gazon" style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>Ons uitgebreide tuinonderhoud omvat een breed scala aan diensten. Denk hierbij aan het vakkundig snoeien van heesters, hagen en bomen op het juiste moment van het jaar om de groei en bloei te stimuleren. We verzorgen uw gazon met precisie, van regelmatig maaien en verticuteren tot bemesten en onkruidbestrijding. Ook het onderhoud van borders, het verwijderen van onkruid en het bemesten van planten behoren tot onze kerntaken. Wij zorgen ervoor dat uw tuin er niet alleen vandaag, maar ook in de toekomst prachtig uitziet.</p><p>Elk seizoen vraagt om een andere aanpak. In het voorjaar bereiden we de tuin voor op het groeiseizoen door te verticuteren, bemesten en de eerste snoeiwerkzaamheden uit te voeren. Gedurende de zomer focussen we op het onderhouden van het gazon, het in toom houden van onkruid en het zorgen voor voldoende water. In het najaar maken we de tuin winterklaar door blad te ruimen, vaste planten af te knippen en vorstgevoelige planten te beschermen. Zelfs in de winter kunnen wij snoeiwerkzaamheden uitvoeren om de tuin voor te bereiden op een nieuwe lente.</p><p>Door het tuinonderhoud aan ons over te laten, bespaart u niet alleen kostbare tijd en moeite, maar investeert u ook in de gezondheid en waarde van uw tuin. Een goed onderhouden tuin is een verlengstuk van uw woning, een plek waar u kunt ontspannen en genieten. Met onze expertise en professionele gereedschappen garanderen we een efficiënte en kwalitatieve service, zodat u zorgeloos van uw prachtige buitenruimte kunt genieten.</p><p>Bent u klaar om uw tuin de zorg te geven die het verdient? Neem vandaag nog contact met ons op voor een vrijblijvend gesprek. We bespreken graag uw wensen en stellen een onderhoudsplan op dat perfect bij u en uw tuin past.</p>`
      },
      {
        _key: 'service_1721234567891',
        title: 'Tuinaanleg & Herinrichting',
        description: 'Droomt u van een nieuwe tuin? Wij realiseren uw visie, van een compleet nieuw ontwerp tot de volledige aanleg. Creëer de buitenruimte die bij u past.',
        customIcon: { url: 'https://i.postimg.cc/sXyW1Z0b/landscape-design-icon.png', alt: 'Icoon van een landschapsontwerp' },
        published: true,
        hasPage: true,
        slug: 'tuinaanleg-en-herinrichting',
        pageContent: `<p>Een tuin aanleggen of herinrichten is het omzetten van een droom naar een levende, groene realiteit. Het gaat verder dan enkel planten in de grond steken; het is het creëren van een buitenruimte die naadloos aansluit bij uw levensstijl, de architectuur van uw woning en uw persoonlijke smaak. Of u nu droomt van een strakke, moderne tuin, een weelderige bloemenzee of een praktische, kindvriendelijke speelplek, wij vertalen uw visie naar een concreet en haalbaar plan.</p><p>Ons proces begint altijd met een persoonlijk gesprek. We luisteren aandachtig naar uw wensen, ideeën en de functionele eisen die u aan de tuin stelt. Op basis daarvan maken we een schetsontwerp waarin we de indeling, looproutes, terrassen en beplantingszones visualiseren. Samen bespreken we de materiaalkeuzes, van duurzaam hout en natuursteen voor terrassen en paden tot de selectie van planten die gedijen in uw specifieke omgeving.</p><p><br></p><img src="https://i.postimg.cc/k47vYvBw/garden-design-sample.jpg" alt="Een net aangelegde tuin met nieuwe bestrating, een houten vlonder en jonge beplanting." style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>De daadwerkelijke aanleg is een zorgvuldig proces dat we van A tot Z coördineren. Dit omvat alle grondwerken, de aanleg van bestrating, de bouw van structuren zoals pergola’s of tuinhuizen, en de installatie van verlichting en eventuele waterpartijen. De finishing touch is het beplantingsplan: we selecteren bomen, heesters, vaste planten en bloembollen die zorgen voor kleur en structuur gedurende alle seizoenen, en planten deze met vakkennis en zorg.</p><p>Een professioneel aangelegde tuin is een waardevolle investering in uw woning en uw levenskwaliteit. Het is een plek om te ontspannen, te entertainen en te genieten van de natuur, direct vanuit uw eigen huis. Wij zorgen voor een duurzaam resultaat waar u jarenlang plezier van zult hebben, met aandacht voor detail en een hoogwaardige afwerking in elke fase van het project.</p><p>Heeft u plannen voor een nieuwe tuin of wilt u uw huidige tuin een complete make-over geven? Neem contact met ons op om de mogelijkheden te bespreken. We komen graag bij u langs om uw droomtuin vorm te geven.</p>`
      }
    ],
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
    contactAdminEmailSubject: 'Nieuw bericht van {{name}} via Andries Service+',
    contactAdminEmailBody: `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nieuw bericht via Andries Service+</title><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f4f7;color:#333333}.container{max-width:600px;margin:0 auto;background-color:#ffffff;border-top:4px solid #16a34a}.content{padding:30px}.content-block{background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:20px;margin-top:20px}.info-label{color:#666666;font-size:14px;margin:0 0 5px 0}.info-data{font-size:16px;margin:0;word-break:break-word}.info-data a{color:#16a34a;text-decoration:none}.message-block{white-space:pre-wrap}.footer{padding:20px;text-align:center;font-size:12px;color:#888888}.footer a{color:#16a34a;text-decoration:none}</style></head><body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background-color:#f4f4f7;color:#333333"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7"><tr><td align="center" style="padding:20px"><div class="container" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-top:4px solid #16a34a"><div class="content" style="padding:30px"><h1 style="font-size:24px">Nieuw Website Bericht</h1><p style="font-size:16px;line-height:1.5">U heeft een nieuw bericht ontvangen via het contactformulier.</p><div class="content-block" style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:20px;margin-top:20px"><div style="padding-bottom:15px;margin-bottom:15px;border-bottom:1px solid #eeeeee"><p class="info-label" style="color:#666666;font-size:14px;margin:0 0 5px 0">Naam:</p><p class="info-data" style="font-size:16px;margin:0">{{name}}</p></div><div style="padding-bottom:15px;margin-bottom:15px;border-bottom:1px solid #eeeeee"><p class="info-label" style="color:#666666;font-size:14px;margin:0 0 5px 0">E-mailadres:</p><p class="info-data"><a href="mailto:{{email}}" style="color:#16a34a;text-decoration:none">{{email}}</a></p></div><div><p class="info-label" style="color:#666666;font-size:14px;margin:0 0 5px 0">Bericht:</p><p class="info-data message-block" style="font-size:16px;margin:0;white-space:pre-wrap">{{message}}</p></div></div></div><div class="footer" style="padding:20px;text-align:center;font-size:12px;color:#888888"><p style="margin:0 0 5px 0">Andries Service+ | Hazenstraat 65, 2500 Lier, België</p><a href="https://www.andriesserviceplus.be" style="color:#16a34a;text-decoration:none">Bezoek de website</a></div></div></td></tr></table></body></html>`,
    contactUserEmailSubject: 'Bedankt voor uw bericht, {{name}}!',
    contactUserEmailBody: `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bedankt voor uw bericht</title><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f4f7;color:#333333}.container{max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden}.header{background-color:#16a34a;padding:40px 20px;text-align:center}.header h1{color:#ffffff;margin:0;font-size:28px}.content{padding:30px}.content p{font-size:16px;line-height:1.6}.salutation{font-weight:bold}.signature-name{font-weight:bold;color:#16a34a;margin:0}.footer{padding:20px;text-align:center;font-size:12px;color:#888888;border-top:1px solid #eeeeee}.footer a{color:#16a34a;text-decoration:none}</style></head><body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background-color:#f4f4f7;color:#333333"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7"><tr><td align="center" style="padding:20px"><div class="container" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden"><div class="header" style="background-color:#16a34a;padding:40px 20px;text-align:center"><h1 style="color:#ffffff;margin:0;font-size:28px">Bericht Ontvangen!</h1></div><div class="content" style="padding:30px"><p class="salutation" style="font-weight:bold">Beste {{name}},</p><p>Bedankt voor uw interesse in Andries Service+. We hebben uw bericht in goede orde ontvangen en waarderen het dat u contact met ons opneemt.</p><p>We streven ernaar om zo spoedig mogelijk te reageren. U kunt binnen enkele werkdagen een antwoord van ons verwachten.</p><div style="margin-top:30px"><p>Met vriendelijke groeten,</p><p class="signature-name" style="font-weight:bold;color:#16a34a;margin:0">Het Andries Service+ Team</p></div></div><div class="footer" style="padding:20px;text-align:center;font-size:12px;color:#888888;border-top:1px solid #eeeeee"><p style="margin:0 0 5px 0">Andries Service+ | Hazenstraat 65, 2500 Lier, België</p><a href="https://www.andriesserviceplus.be" style="color:#16a34a;text-decoration:none">Bezoek de website</a></div></div></td></tr></table></body></html>`,
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
    const [settings, pageContent] = await Promise.all([kv.get('settings'), kv.get('pageContent')]);
    const emailUser = settings?.emailUser || process.env.EMAIL_USER;
    const emailPass = settings?.emailPass || process.env.EMAIL_PASS;
    const emailTo = settings?.emailTo || process.env.EMAIL_TO;
    if (!emailUser || !emailPass || !emailTo) throw new Error('E-mailconfiguratie ontbreekt.');
    
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
    const year = new Date().getFullYear();
    const content = pageContent || DEFAULT_CONTENT.pageContent;

    // Fix: Convert newlines to <br> tags for proper HTML email formatting.
    const formattedMessage = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

    const replacePlaceholders = (template, data) => {
        if (!template) return '';
        return template
            .replace(/{{name}}/g, data.name)
            .replace(/{{email}}/g, data.email)
            .replace(/{{message}}/g, data.message)
            .replace(/{{year}}/g, data.year);
    };

    // Admin Notification Email
    const adminSubject = replacePlaceholders(content.contactAdminEmailSubject || DEFAULT_CONTENT.pageContent.contactAdminEmailSubject, { name });
    const adminBody = replacePlaceholders(content.contactAdminEmailBody || DEFAULT_CONTENT.pageContent.contactAdminEmailBody, { name, email, message: formattedMessage, year });
    await transporter.sendMail({ from: `"Andries Service+ Website" <${emailUser}>`, to: emailTo, replyTo: email, subject: adminSubject, html: adminBody });

    // User Confirmation Email
    const userSubject = replacePlaceholders(content.contactUserEmailSubject || DEFAULT_CONTENT.pageContent.contactUserEmailSubject, { name });
    const userBody = replacePlaceholders(content.contactUserEmailBody || DEFAULT_CONTENT.pageContent.contactUserEmailBody, { name, email, message: formattedMessage, year });
    await transporter.sendMail({ from: `"Andries Service+" <${emailUser}>`, to: email, subject: userSubject, html: userBody });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Sorry, uw bericht kon niet worden verzonden.' });
  }
}

async function handleGetContent(req, res) {
  try {
    let [pageContent, galleryImages, settings] = await Promise.all([ kv.get('pageContent'), kv.get('galleryImages'), kv.get('settings') ]);
    
    // Use default if KV is empty
    if (!pageContent) {
      pageContent = DEFAULT_CONTENT.pageContent;
    } else {
      // Data migration: ensure all services have the new page-related fields
      if (pageContent.servicesList && Array.isArray(pageContent.servicesList)) {
        pageContent.servicesList.forEach(service => {
          if (typeof service.hasPage === 'undefined') {
            service.hasPage = false;
          }
          if (typeof service.slug === 'undefined') {
            service.slug = '';
          }
          if (typeof service.pageContent === 'undefined') {
            service.pageContent = '';
          }
        });
      }
    }

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

async function handleSitemap(req, res) {
  try {
    const pageContent = await kv.get('pageContent') || DEFAULT_CONTENT.pageContent;
    const services = pageContent?.servicesList || [];
    
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const baseUrl = `${protocol}://${host}`;

    const today = new Date().toISOString().split('T')[0];

    const urls = [
      { loc: baseUrl, lastmod: today, changefreq: 'weekly', priority: '1.0' },
    ];

    services.forEach(service => {
      if (service.published && service.hasPage && service.slug) {
        const safeSlug = encodeURIComponent(service.slug);
        urls.push({
          loc: `${baseUrl}/diensten/${safeSlug}`,
          lastmod: today,
          changefreq: 'monthly',
          priority: '0.8'
        });
      }
    });

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(sitemapXml.trim());
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ error: 'Failed to generate sitemap.' });
  }
}

// --- START: ANALYTICS HANDLERS ---
async function handleTrack(req, res) {
    try {
        const { type, path, referrer, uniqueId, eventName, eventDetail } = req.body;
        if (!path || !type || !uniqueId) return res.status(400).json({ error: 'Missing required tracking data.' });
        
        const today = new Date().toISOString().split('T')[0];
        const key = `analytics:${today}`;
        
        const pipeline = kv.pipeline();

        // Always track a page view or event
        pipeline.hincrby(key, 'total', 1);

        // Track unique visitor for the day
        pipeline.sadd(`analytics-unique:${today}`, uniqueId);

        // Location data from Vercel headers
        const country = req.headers['x-vercel-ip-country'] || 'Unknown';
        const city = req.headers['x-vercel-ip-city'] || 'Unknown';
        pipeline.hincrby(key, `loc:${country}:${city}`, 1);

        // Device data from User-Agent
        const ua = req.headers['user-agent'] || '';
        let device = 'Desktop';
        if (/mobile/i.test(ua)) device = 'Mobile';
        else if (/tablet/i.test(ua)) device = 'Tablet';
        pipeline.hincrby(key, `dev:${device}`, 1);

        if (type === 'pageview') {
            pipeline.hincrby(key, `page:${path}`, 1);
            let referrerHost = 'direct';
            if (referrer) {
                try {
                    referrerHost = new URL(referrer).hostname;
                } catch (e) {
                    referrerHost = 'other';
                }
            }
            pipeline.hincrby(key, `ref:${referrerHost}`, 1);
        } else if (type === 'event' && eventName && eventDetail) {
             pipeline.hincrby(key, `evt:${eventName}:${eventDetail}`, 1);
        }
        
        await pipeline.exec();
        
        // Set expiry to keep DB clean
        await kv.expire(key, 60 * 60 * 24 * 91); // 91 days
        await kv.expire(`analytics-unique:${today}`, 60 * 60 * 24 * 2); // 2 days for unique sets

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Analytics tracking error:", error);
        return res.status(200).json({ success: false }); // Fail silently
    }
}


async function handleGetAnalytics(req, res) {
    try {
        await authorizeRequest(req, ['SuperAdmin', 'Admin']);
        const url = new URL(req.url, `http://${req.headers.host}`);
        const days = parseInt(url.searchParams.get('days') || '30', 10);
        
        const dateKeys = [];
        const uniqueKeys = [];
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dateKeys.push(`analytics:${dateStr}`);
            uniqueKeys.push(`analytics-unique:${dateStr}`);
        }

        const [dailyData, uniqueData] = await Promise.all([
            dateKeys.length > 0 ? Promise.all(dateKeys.map(key => kv.hgetall(key))) : Promise.resolve([]),
            uniqueKeys.length > 0 ? Promise.all(uniqueKeys.map(k => kv.scard(k))) : Promise.resolve([])
        ]);
        
        const aggregated = {
            total: 0, uniques: 0, pages: {}, referrers: {}, daily: [], devices: {}, locations: {}, events: {}
        };
        
        const uniqueVisitorIds = new Set();
        const uniquePromises = uniqueKeys.map(key => kv.smembers(key));
        const allUniqueSets = await Promise.all(uniquePromises);
        allUniqueSets.forEach(set => set.forEach(id => uniqueVisitorIds.add(id)));
        aggregated.uniques = uniqueVisitorIds.size;
        
        dateKeys.forEach((key, index) => {
            const data = dailyData[index];
            const date = key.split(':')[1];
            const dailyUniques = uniqueData[index] || 0;
            
            if (data) {
                const totalViews = Number(data.total || 0);
                aggregated.total += totalViews;
                aggregated.daily.push({ date, visits: totalViews, uniques: dailyUniques });

                Object.keys(data).forEach(field => {
                    const value = Number(data[field]);
                    if (field.startsWith('page:')) aggregated.pages[field.substring(5)] = (aggregated.pages[field.substring(5)] || 0) + value;
                    else if (field.startsWith('ref:')) aggregated.referrers[field.substring(4)] = (aggregated.referrers[field.substring(4)] || 0) + value;
                    else if (field.startsWith('dev:')) aggregated.devices[field.substring(4)] = (aggregated.devices[field.substring(4)] || 0) + value;
                    else if (field.startsWith('loc:')) aggregated.locations[field.substring(4)] = (aggregated.locations[field.substring(4)] || 0) + value;
                    else if (field.startsWith('evt:')) aggregated.events[field.substring(4)] = (aggregated.events[field.substring(4)] || 0) + value;
                });
            } else {
                 aggregated.daily.push({ date, visits: 0, uniques: 0 });
            }
        });

        const sortAndSlice = (obj, limit = 10) => Object.entries(obj).sort(([, a], [, b]) => b - a).slice(0, limit);

        const topLocations = sortAndSlice(aggregated.locations, 10).map(([loc, visits]) => {
            const [country, city] = loc.split(':');
            return { country, city: decodeURIComponent(city), visits };
        });

        const topCity = topLocations[0] ? `${decodeURIComponent(topLocations[0].city)}, ${topLocations[0].country}` : 'N/A';
        const topReferrer = sortAndSlice(aggregated.referrers, 1)[0]?.[0] || 'N/A';

        const sortedDaily = aggregated.daily.sort((a, b) => new Date(a.date) - new Date(b.date));

        let chartData = sortedDaily;
        if (days > 60) {
            const weeklyData = [];
            for (let i = 0; i < sortedDaily.length; i += 7) {
                const weekSlice = sortedDaily.slice(i, i + 7);
                if (weekSlice.length > 0) {
                    const weekAggregate = weekSlice.reduce((acc, day) => {
                        acc.visits += day.visits;
                        acc.uniques += day.uniques; // Note: Sum of daily uniques, not true weekly uniques.
                        return acc;
                    }, { date: weekSlice[0].date, visits: 0, uniques: 0 });
                    weeklyData.push(weekAggregate);
                }
            }
            chartData = weeklyData;
        }

        return res.status(200).json({
            total: aggregated.total,
            uniques: aggregated.uniques,
            topReferrer: topReferrer,
            topCity: topCity,
            daily: chartData,
            pages: sortAndSlice(aggregated.pages).map(([path, visits]) => ({ path, visits })),
            referrers: sortAndSlice(aggregated.referrers).map(([source, visits]) => ({ source, visits })),
            devices: sortAndSlice(aggregated.devices, 3).map(([type, visits]) => ({ type, visits })),
            locations: topLocations,
            events: sortAndSlice(aggregated.events).map(([evt, count]) => {
                const [name, detail] = evt.split(':', 2);
                return { name, detail, count };
            }),
        });

    } catch (error) {
        console.error("Error getting analytics:", error);
        return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
    }
}
// --- END: ANALYTICS HANDLERS ---


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

  // SITEMAP ROUTE
  if (path === '/sitemap.xml' && req.method === 'GET') return handleSitemap(req, res);

  // PUBLIC ROUTES
  if (path === '/api/contact' && req.method === 'POST') return handleContact(req, res);
  if (path === '/api/content' && req.method === 'GET') return handleGetContent(req, res);
  if (path === '/api/event' && req.method === 'POST') return handleTrack(req, res);
  if (path === '/api/login' && req.method === 'POST') return handleLogin(req, res);
  
  // PROTECTED ADMIN ROUTES
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
  if (path === '/api/analytics' && req.method === 'GET') return handleGetAnalytics(req, res);


  return res.status(404).json({ error: 'Not Found' });
};