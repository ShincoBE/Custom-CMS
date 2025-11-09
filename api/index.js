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
    navHome: "Home", navServices: "Diensten", navBeforeAfter: "Voor & Na", navGallery: "Galerij", navContact: "Contact", navBlog: "Projecten",
    companyName: "Andries Service+", heroTitle: "Uw tuin, onze passie.", heroTagline: "Professioneel onderhoud voor een onberripselijke tuin.", heroButtonText: "Vraag Offerte Aan",
    servicesTitle: "Onze Diensten", servicesSubtitle: "Wij bieden een breed scala aan diensten om uw tuin en woning in topconditie te houden.", 
    servicesList: [
      {
        _key: 'service_1',
        title: 'Professioneel Tuinonderhoud',
        description: 'Van wekelijks maaien tot seizoensgebonden snoeiwerk, wij zorgen ervoor dat uw tuin er het hele jaar door onberispelijk uitziet.',
        customIcon: { url: 'https://i.postimg.cc/W4y742AR/gardening-icon.png', alt: 'Icoon van tuingereedschap' },
        published: true,
        hasPage: true,
        slug: 'professioneel-tuinonderhoud',
        pageContent: `<p>Een prachtige tuin is een bron van vreugde, maar vereist constante zorg en aandacht. Professioneel tuinonderhoud gaat verder dan enkel het gras maaien; het is een totaalaanpak die zorgt voor gezonde planten, een strak gazon en een verzorgde uitstraling door alle seizoenen heen. Bij Andries Service+ begrijpen we dat elke tuin uniek is en bieden we onderhoudsplannen op maat die perfect aansluiten bij uw wensen en de noden van uw tuin.</p><p><br></p><p>Onze onderhoudsdiensten zijn uitgebreid en seizoensgebonden. In het voorjaar bereiden we uw tuin voor op het groeiseizoen met verticuteren, bemesten en de eerste snoeiwerkzaamheden. Gedurende de zomer focussen we op gazononderhoud, onkruidbestrijding en het in vorm houden van hagen en heesters. In het najaar maken we alles winterklaar, zodat uw tuin de koude maanden goed doorkomt en klaar is voor een nieuwe lente.</p><p><br></p><img src="https://i.postimg.cc/T3j2C7K8/garden-maintenance-sample.jpg" alt="Een prachtig onderhouden tuin met bloeiende borders en een groen gazon" style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>Wij nemen het zware werk uit handen, zodat u meer tijd heeft om te genieten. Ons team beschikt over de kennis en het professionele gereedschap om elke klus efficiënt en vakkundig uit te voeren. Van het correct snoeien van fruitbomen tot het verzorgen van delicate rozenstruiken, wij garanderen een aanpak die de gezondheid en schoonheid van uw beplanting bevordert.</p><p>Door te kiezen voor ons professioneel onderhoud, investeert u in de waarde en uitstraling van uw woning. Een goed onderhouden tuin is een verlengstuk van uw leefruimte, een plek voor ontspanning en plezier. Laat ons de zorg dragen voor uw groene oase, zodat u er zorgeloos van kunt genieten.</p>`
      },
      {
        _key: 'service_2',
        title: 'Tuinaanleg & Herinrichting',
        description: 'Droomt u van een nieuwe tuin? Wij realiseren uw visie, van een compleet nieuw ontwerp tot de volledige aanleg.',
        customIcon: { url: 'https://i.postimg.cc/sXyW1Z0b/landscape-design-icon.png', alt: 'Icoon van een landschapsontwerp' },
        published: true,
        hasPage: true,
        slug: 'tuinaanleg-en-herinrichting',
        pageContent: `<p>Uw tuin is een leeg canvas vol mogelijkheden. Met onze expertise in tuinaanleg en herinrichting transformeren we uw buitenruimte tot de droomtuin die u altijd al wilde. Of u nu start vanaf nul of uw bestaande tuin een complete make-over wilt geven, wij begeleiden u van het eerste idee tot de finale realisatie. We luisteren naar uw wensen en vertalen deze naar een functioneel en esthetisch ontwerp dat past bij uw levensstijl.</p><p><br></p><p>Het proces start met een grondige analyse van de ruimte en een persoonlijk gesprek. We bespreken de gewenste sfeer, functies (zoals een terras, speelruimte of moestuin) en uw voorkeur voor beplanting en materialen. Op basis hiervan werken we een gedetailleerd plan uit, inclusief de indeling van paden, terrassen, borders en eventuele structuren zoals een pergola of tuinhuis.</p><p><br></p><img src="https://i.postimg.cc/k47vYvBw/garden-design-sample.jpg" alt="Een net aangelegde tuin met nieuwe bestrating, een houten vlonder en jonge beplanting." style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>De aanlegfase wordt met de grootste zorg en precisie uitgevoerd. Dit omvat alle grondwerken, de aanleg van bestrating en terrassen, en de constructie van eventuele bouwelementen. Vervolgens brengen we de tuin tot leven met een doordacht beplantingsplan, waarbij we planten selecteren die niet alleen mooi zijn, maar ook geschikt voor de bodem en de lichtinval in uw tuin. We creëren een harmonieus geheel dat door de seizoenen heen boeiend blijft.</p><p>Een professioneel aangelegde tuin verhoogt niet alleen het plezier dat u uit uw woning haalt, maar ook de marktwaarde ervan. Het is een investering in levenskwaliteit en duurzame schoonheid. Laat ons uw partner zijn in het creëren van een unieke buitenruimte waar u jarenlang van zult genieten.</p>`
      },
      {
        _key: 'service_3',
        title: 'Vakkundig Schilderwerk',
        description: 'Een frisse verflaag doet wonderen. Wij verzorgen al uw binnen- en buitenschilderwerk met oog voor detail en een perfecte afwerking.',
        customIcon: { url: 'https://i.postimg.cc/pXG5TBDd/painting-icon.png', alt: 'Icoon van een verfroller' },
        published: true,
        hasPage: true,
        slug: 'vakkundig-schilderwerk',
        pageContent: `<p>Een nieuwe verflaag kan een ruimte volledig transformeren. Of het nu gaat om het opfrissen van uw interieur of het beschermen van de buitengevel, vakkundig schilderwerk is essentieel voor een duurzaam en esthetisch resultaat. Bij Andries Service+ benaderen we elke schilderklus met de grootste precisie, van de voorbereiding tot de laatste afwerkingslaag.</p><p>Een perfect eindresultaat begint met een onberispelijke voorbereiding. We besteden uitgebreid aandacht aan het schuren, plamuren en reinigen van de ondergronden. Muren, plafonds, deuren en kozijnen worden zorgvuldig voorbereid om een gladde en hechtende basis te garanderen. We beschermen uw meubels en vloeren met de nodige afdekmaterialen, zodat alles na afloop netjes wordt achtergelaten.</p><p><br></p><img src="https://i.postimg.cc/d117zVfW/painting-sample.jpg" alt="Een schilder die met precisie een muur afplakt voor het schilderen." style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>Voor buitenschilderwerk is duurzaamheid cruciaal. We gebruiken hoogwaardige, weerbestendige verven die uw houtwerk, gevels en andere buitenelementen beschermen tegen de invloeden van het weer. Een professioneel aangebrachte verflaag voorkomt houtrot en andere schade, en zorgt ervoor dat uw woning er jarenlang verzorgd uitziet. We adviseren u graag over de juiste verfsystemen en kleurkeuzes die passen bij de stijl van uw huis.</p><p>Of u nu een enkele kamer wilt laten schilderen of een volledig project heeft, wij staan garant voor een strakke en professionele afwerking. We werken met kwaliteitsverf en modern gereedschap voor een efficiënte uitvoering met minimale overlast. Geef uw woning de uitstraling die het verdient met ons vakkundig schilderwerk.</p>`
      },
      {
        _key: 'service_4',
        title: 'Klussen in en rond de Woning',
        description: 'Van kleine reparaties tot het monteren van meubels. Voor die klusjes waar u zelf niet aan toekomt, zijn wij uw betrouwbare partner.',
        customIcon: { url: 'https://i.postimg.cc/8z0FzJv0/handyman-icon.png', alt: 'Icoon van een hamer en moersleutel' },
        published: true,
        hasPage: true,
        slug: 'klussen-in-en-rond-woning',
        pageContent: `<p>Iedereen heeft wel een lijstje met klusjes in en rond het huis die blijven liggen. Een lekkende kraan, een klemmende deur, een lamp die opgehangen moet worden of meubels die in elkaar gezet moeten worden. Voor al die taken waar u zelf geen tijd voor heeft of het juiste gereedschap voor mist, biedt Andries Service+ een betrouwbare en veelzijdige klussendienst.</p><p><br></p><p>Onze expertise is breed en we pakken elke klus, groot of klein, met dezelfde professionaliteit aan. Denk aan het monteren van kasten, het ophangen van schilderijen en rekken, het vervangen van deurbeslag of het uitvoeren van kleine reparaties aan sanitair. We zorgen voor een nette en degelijke uitvoering, zodat u zeker weet dat het goed gebeurt.</p><p><br></p><img src="https://i.postimg.cc/J0yJHYT5/handyman-sample.jpg" alt="Een vakman die een keukenkastje installeert." style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>Ook voor klussen buitenshuis kunt u op ons rekenen. Het reinigen van uw terras met een hogedrukreiniger, het repareren van een tuinscherm, het monteren van een tuinhuis of het opruimen van uw garage of zolder; wij nemen het u graag uit handen. We beschikken over het juiste materiaal om deze taken efficiënt en veilig uit te voeren.</p><p>Het inschakelen van onze klussendienst bespaart u niet alleen tijd en frustratie, maar geeft u ook de gemoedsrust dat de werkzaamheden correct worden uitgevoerd. Geen klus is te klein voor onze aandacht. Heeft u een lijstje met taken? Neem contact met ons op en we bespreken graag hoe we u kunnen helpen om uw huis weer helemaal op orde te krijgen.</p>`
      }
    ],
    beforeAfterTitle: "Voor & Na", beforeAfterSubtitle: "Zie het verschil dat professioneel onderhoud maakt.",
    testimonialsTitle: "Wat Klanten Zeggen", testimonialsSubtitle: "Onze grootste trots is de tevredenheid van onze klanten.",
    testimonials: [
      {
        _key: 'testimonial_1',
        quote: "Andries Service+ heeft onze verwilderde tuin omgetoverd tot een paradijs. Professioneel, stipt en met oog voor detail. Een absolute aanrader!",
        name: "Familie Peeters",
        rating: 5,
        published: true
      },
      {
        _key: 'testimonial_2',
        quote: "Het buitenschilderwerk van onze woning is perfect uitgevoerd. De voorbereiding was grondig en het eindresultaat is prachtig. Zeer tevreden over de service.",
        name: "Jan De Smet",
        rating: 5,
        published: true
      }
    ],
    blogTitle: "Laatste Projecten", blogSubtitle: "Een kijkje in onze recente werkzaamheden en verhalen.",
    servicesCtaTitle: "Bekijk Ons Werk", servicesCtaSubtitle: "Een foto zegt meer dan duizend woorden. Ontdek onze projecten in de galerij.", servicesCtaButtonText: "Open Galerij",
    galleryTitle: "Galerij", gallerySubtitle: "Een selectie van onze voltooide projecten.",
    contactTitle: "Neem Contact Op", contactSubtitle: "Heeft u vragen of wilt u een vrijblijvende offerte? Wij staan voor u klaar.",
    contactInfoTitle: "Contactgegevens", contactInfoText: "U kunt ons bereiken via de onderstaande gegevens.",
    contactAddressTitle: "Adres", contactAddress: "Hazenstraat 65\n2500 Lier\nBelgië",
    contactEmailTitle: "Email", contactEmail: "info.andries.serviceplus@gmail.com",
    contactPhoneTitle: "Telefoon", contactPhone: "+32 494 39 92 86",
    contactMapEnabled: false, contactMapUrl: "",
    quoteAdminEmailSubject: "Nieuwe Offerteaanvraag van {name}",
    quoteAdminEmailBody: `
      <p>Er is een nieuwe offerteaanvraag binnengekomen via de website.</p>
      <p><strong>Naam:</strong> {name}<br>
      <strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
      <hr>
      <p><strong>Gekozen Diensten:</strong></p>
      <p>{services}</p>
      <hr>
      <p><strong>Details van de aanvraag:</strong></p>
      <div>{details}</div>
      <p>{imageUrl}</p>
    `,
    quoteUserEmailSubject: "Bedankt voor uw offerteaanvraag!",
    quoteUserEmailBody: `
      <p>Beste {name},</p>
      <p>Bedankt voor uw interesse in Andries Service+! We hebben uw offerteaanvraag goed ontvangen en zullen deze zo spoedig mogelijk bekijken.</p>
      <p>We nemen binnen 2 werkdagen contact met u op om de details verder te bespreken.</p>
      <p>Met vriendelijke groeten,</p>
      <p>Het team van Andries Service+</p>
    `,
    facebookUrl: "https://www.facebook.com/", footerCopyrightText: "Andries Service+. Alle rechten voorbehouden.",
    logo: { url: '/favicon.svg', alt: 'Andries Service+ Logo' }, heroImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg', alt: 'Mooi onderhouden tuin' },
    beforeImage: { url: 'https://i.postimg.cc/L8gP8SYb/before-image.jpg', alt: 'Tuin voor onderhoud' }, afterImage: { url: 'https://i.postimg.cc/j5XbQ8cQ/after-image.jpg', alt: 'Tuin na onderhoud' },
    ogImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg', alt: 'Andries Service+ Tuinonderhoud' },
  },
  galleryImages: [],
  blogPosts: [
      {
        _id: 'post_1',
        title: 'Project: Volledige Tuinmetamorfose in Lier',
        slug: 'project-tuinmetamorfose-lier',
        excerpt: 'Ontdek hoe we een overwoekerde achtertuin hebben omgetoverd tot een moderne, onderhoudsvriendelijke oase met een strak terras en nieuwe beplanting.',
        mainImage: { url: 'https://i.postimg.cc/j5XbQ8cQ/after-image.jpg', alt: 'Een moderne tuin met een nieuw terras en perfecte beplanting.' },
        content: '<p>Onlangs kregen we de uitdaging om een verwaarloosde tuin in Lier volledig te transformeren. De wens van de klant was duidelijk: een moderne, strakke tuin die toch groen aanvoelde en vooral onderhoudsvriendelijk was. Het project omvatte het volledig leeghalen van de bestaande tuin, het aanleggen van een nieuw terras en het creëren van een doordacht beplantingsplan.</p><p><br></p><p>We zijn gestart met het verwijderen van de oude, verzakte tegels en de overwoekerde beplanting. Na het egaliseren van de ondergrond hebben we een ruim terras aangelegd met grote, keramische tegels in een antracietkleur. Dit vormt de basis voor de moderne uitstraling. Om het geheel te breken en een warmere sfeer te creëren, hebben we verhoogde plantenborders van cortenstaal geplaatst.</p><p><br></p><img src="https://i.postimg.cc/431ktwwb/Hero.jpg" alt="Close-up van de nieuwe, moderne beplanting in de tuin." style="max-width: 100%; height: auto; border-radius: 8px;"><p><br></p><p>De keuze van de beplanting was cruciaal voor het onderhoudsvriendelijke aspect. We hebben gekozen voor een mix van groenblijvende siergrassen, winterharde vaste planten en enkele bloeiende heesters die weinig snoeiwerk vereisen. Het resultaat is een tuin die het hele jaar door interessant is, met minimale inspanning van de eigenaars. Het eindresultaat is een perfecte balans tussen design en natuur, een plek waar de bewoners weer volop kunnen genieten van hun buitenruimte.</p>',
        published: true,
        publishedAt: new Date().toISOString()
      }
  ],
};
// --- END: DEFAULT CONTENT ---

// --- START: API HANDLERS ---

async function handleQuote(req, res) {
  const { name, email, services, details, imageUrl } = req.body;
  
  if (!name || !email || !services || services.length === 0 || !details) {
    return res.status(400).json({ error: 'Alle velden zijn verplicht.' });
  }

  try {
    const [settings, pageContent] = await Promise.all([
      kv.get('settings'), 
      kv.get('pageContent').then(pc => pc || DEFAULT_CONTENT.pageContent)
    ]);
    const emailUser = settings?.emailUser || process.env.EMAIL_USER;
    const emailPass = settings?.emailPass || process.env.EMAIL_PASS;
    const emailTo = settings?.emailTo || process.env.EMAIL_TO;

    if (!emailUser || !emailPass || !emailTo) {
      throw new Error('E-mailconfiguratie ontbreekt.');
    }

    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });

    const servicesList = services.join(', ');
    const formattedDetails = details.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const imageHtml = imageUrl ? `<p><strong>Bijgevoegde foto:</strong></p><a href="${imageUrl}"><img src="${imageUrl}" alt="Bijlage" style="max-width:400px;height:auto;"/></a>` : '';

    const placeholders = {
        '{name}': name,
        '{email}': email,
        '{services}': servicesList,
        '{details}': formattedDetails,
        '{imageUrl}': imageHtml,
    };
    
    const replacePlaceholders = (template) => {
        let result = template;
        for (const [key, value] of Object.entries(placeholders)) {
            result = result.replace(new RegExp(key, 'g'), value);
        }
        return result;
    }

    // Utility to strip HTML for the 'From' field.
    const stripHtml = (html) => (html || '').replace(/<[^>]*>?/gm, '');
    const fromNameAdmin = stripHtml(pageContent.companyName) || 'Website Offertes';
    const fromNameUser = stripHtml(pageContent.companyName) || 'Klantenservice';

    // Email to Admin
    const adminSubject = replacePlaceholders(pageContent.quoteAdminEmailSubject || "Nieuwe Offerteaanvraag van {name}");
    const adminBody = replacePlaceholders(pageContent.quoteAdminEmailBody || "");
    
    await transporter.sendMail({
        from: `"${fromNameAdmin}" <${emailUser}>`,
        to: emailTo,
        replyTo: email,
        subject: adminSubject,
        html: adminBody,
    });
    
    // Confirmation Email to User
    const userSubject = replacePlaceholders(pageContent.quoteUserEmailSubject || "Bedankt voor uw aanvraag");
    const userBody = replacePlaceholders(pageContent.quoteUserEmailBody || "");
    
    await transporter.sendMail({
        from: `"${fromNameUser}" <${emailUser}>`,
        to: email,
        subject: userSubject,
        html: userBody
    });

    return res.status(200).json({ success: true, message: 'Offerteaanvraag succesvol verzonden!' });
  } catch (error) {
    console.error('Error sending quote email:', error);
    return res.status(500).json({ error: 'Sorry, uw offerteaanvraag kon niet worden verzonden.' });
  }
}

async function handleGetContent(req, res) {
  try {
    let [pageContent, galleryImages, blogPosts, settings] = await Promise.all([ kv.get('pageContent'), kv.get('galleryImages'), kv.get('blogPosts'), kv.get('settings') ]);
    
    // Use default if KV is empty
    if (!pageContent) {
      pageContent = DEFAULT_CONTENT.pageContent;
    } else {
      // Data migration: ensure all services have the new page-related fields
      if (pageContent.servicesList && Array.isArray(pageContent.servicesList)) {
        pageContent.servicesList.forEach(service => {
          if (typeof service.hasPage === 'undefined') service.hasPage = false;
          if (typeof service.slug === 'undefined') service.slug = '';
          if (typeof service.pageContent === 'undefined') service.pageContent = '';
        });
      }
      if (typeof pageContent.testimonials === 'undefined') pageContent.testimonials = DEFAULT_CONTENT.pageContent.testimonials;
    }

    if (galleryImages === null || galleryImages === undefined) galleryImages = DEFAULT_CONTENT.galleryImages;
    if (blogPosts === null || blogPosts === undefined) blogPosts = DEFAULT_CONTENT.blogPosts;
    if (!settings) settings = {};
    if (typeof settings.showTestimonials === 'undefined') settings.showTestimonials = true;
    if (typeof settings.showBlog === 'undefined') settings.showBlog = true;
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ pageContent, galleryImages, blogPosts, settings });
  } catch (error) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ error: 'Failed to fetch content.' });
  }
}

async function handleUpdateContent(req, res) {
  try {
    await authorizeRequest(req, ['SuperAdmin', 'Admin', 'Editor']);
    const { pageContent, galleryImages, blogPosts, settings } = req.body;
    if (!pageContent || galleryImages === undefined || blogPosts === undefined || settings === undefined) return res.status(400).json({ error: 'Invalid payload.' });
    const [currentContent, currentGallery, currentBlog, currentSettings] = await Promise.all([kv.get('pageContent'), kv.get('galleryImages'), kv.get('blogPosts'), kv.get('settings')]);
    if (currentContent && (currentGallery !== null && currentGallery !== undefined) && currentBlog && currentSettings) {
      const timestamp = new Date().toISOString();
      await kv.set(`history:${timestamp}`, { pageContent: currentContent, galleryImages: currentGallery, blogPosts: currentBlog, settings: currentSettings }, { ex: 60 * 60 * 24 * 30 });
      await kv.lpush('content_history', timestamp);
      await kv.ltrim('content_history', 0, 9);
    }
    await Promise.all([ kv.set('pageContent', pageContent), kv.set('galleryImages', galleryImages), kv.set('blogPosts', blogPosts), kv.set('settings', settings) ]);
    return res.status(200).json({ success: true, message: 'Content en instellingen succesvol opgeslagen!' });
  } catch (error) {
    return res.status(error.message === 'Access denied.' ? 403 : 500).json({ error: error.message });
  }
}

async function handleUpload(req, res) {
    try {
        // Authorization removed to allow public uploads for the quote form.
        const filename = req.headers['x-vercel-filename'];
        if (!filename || typeof filename !== 'string') {
            return res.status(400).json({ error: 'Filename is missing.' });
        }

        const imageBuffer = await streamToBuffer(req);

        // Process image with Sharp: resize and convert to webp for optimization.
        const finalBuffer = await sharp(imageBuffer)
            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        
        const finalFilename = `${filename.split('.').slice(0, -1).join('.')}.webp`;

        const blob = await put(finalFilename, finalBuffer, {
            access: 'public',
            cacheControl: 'public, max-age=0, must-revalidate', // Tell browsers to revalidate cache.
            contentType: 'image/webp'
        });
        
        return res.status(200).json(blob);
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: 'Upload failed.' });
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
    await Promise.all([ kv.set('pageContent', historicalContent.pageContent), kv.set('galleryImages', historicalContent.galleryImages), kv.set('blogPosts', historicalContent.blogPosts), kv.set('settings', historicalContent.settings) ]);
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
    const [pageContent, blogPosts] = await Promise.all([
        kv.get('pageContent') || DEFAULT_CONTENT.pageContent,
        kv.get('blogPosts') || DEFAULT_CONTENT.blogPosts
    ]);
    const services = pageContent?.servicesList || [];
    
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const baseUrl = `${protocol}://${host}`;

    const today = new Date().toISOString().split('T')[0];

    const urls = [
      { loc: baseUrl, lastmod: today, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
    ];

    services.forEach(service => {
      if (service.published && service.hasPage && service.slug) {
        urls.push({
          loc: `${baseUrl}/diensten/${encodeURIComponent(service.slug)}`,
          lastmod: today, changefreq: 'monthly', priority: '0.8'
        });
      }
    });

    blogPosts.forEach(post => {
      if (post.published && post.slug) {
        urls.push({
          loc: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
          lastmod: new Date(post.publishedAt).toISOString().split('T')[0],
          changefreq: 'monthly', priority: '0.7'
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
  
  // Middleware to parse JSON body for POST requests, EXCEPT for file uploads.
  // The stream can only be consumed once.
  if (req.method === 'POST' && path !== '/api/upload') {
    try {
      const bodyBuffer = await streamToBuffer(req);
      req.body = JSON.parse(bodyBuffer.toString() || '{}');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  // SITEMAP ROUTE
  if (path === '/sitemap.xml' && req.method === 'GET') return handleSitemap(req, res);

  // PUBLIC ROUTES
  if (path === '/api/quote' && req.method === 'POST') return handleQuote(req, res);
  if (path === '/api/content' && req.method === 'GET') return handleGetContent(req, res);
  if (path === '/api/event' && req.method === 'POST') return handleTrack(req, res);
  if (path === '/api/login' && req.method === 'POST') return handleLogin(req, res);
  if (path === '/api/upload' && req.method === 'POST') return handleUpload(req, res);
  
  // PROTECTED ADMIN ROUTES
  if (path === '/api/update-content' && req.method === 'POST') return handleUpdateContent(req, res);
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