import React, { useState } from 'react';
import { Question, CaretDown, BookOpen, Lifebuoy } from 'phosphor-react';

const faqData = [
    {
        question: "👋 Hoe werkt het dashboard algemeen?",
        answer: "Welkom in het CMS! Aan de linkerkant (of in het menu op mobiel) ziet u verschillende tabbladen. Elk tabblad staat voor een onderdeel van uw website. \n\n**Belangrijk:** Wanneer u wijzigingen aanbrengt (zoals tekst typen of foto's wisselen), ziet u rechtsboven de knop 'Wijzigingen Opslaan' groen worden. Klik hierop om uw aanpassingen live te zetten. Vergeet dit niet!"
    },
    {
        question: "🛠️ Hoe beheer ik mijn Diensten?",
        answer: "Ga naar het tabblad **'Diensten'**. \n\n1. **Toevoegen:** Klik onderaan op '+ Dienst Toevoegen'.\n2. **Bewerken:** Klik op een dienst in de lijst om deze open te klappen. U kunt de titel, omschrijving en het icoon aanpassen.\n3. **Volgorde:** Houdt een dienst ingedrukt en sleep deze naar boven of beneden om de volgorde op de website te wijzigen.\n4. **Eigen Pagina:** Vink 'Heeft eigen pagina' aan als u een uitgebreide pagina wilt voor deze dienst. Vul vervolgens een unieke 'URL Slug' in (bv. 'tuinaanleg') en gebruik de teksteditor om de pagina vorm te geven met tekst en foto's."
    },
    {
        question: "🖼️ Hoe werkt de Media Bibliotheek?",
        answer: "Het tabblad **'Media'** is uw centrale opslagplaats voor afbeeldingen. \n\n- U kunt hier foto's uploaden om ze later makkelijk te hergebruiken in blogs of diensten zonder ze opnieuw te hoeven uploaden.\n- Als u een afbeelding verwijdert uit de bibliotheek, verdwijnt deze ook van de plekken op de website waar hij gebruikt werd. Wees hier dus voorzichtig mee!"
    },
    {
        question: "📝 Hoe plaats ik een nieuw Project of Blogbericht?",
        answer: "Ga naar het tabblad **'Blog'**.\n\n1. Klik op 'Nieuwe Post'.\n2. Vul de titel en een korte samenvatting in.\n3. Kies een hoofdafbeelding (deze komt in het overzicht te staan).\n4. Schrijf uw verhaal in het grote tekstvak. U kunt hier tussenkopjes maken, lijsten toevoegen en extra foto's invoegen via het icoontje in de balk.\n5. Zet de schakelaar op **'Gepubliceerd'** als u klaar bent."
    },
    {
        question: "📷 Hoe beheer ik de Galerij?",
        answer: "In het tabblad **'Galerij'** beheert u de foto's van uw realisaties.\n\n- **Uploaden:** Klik op het lege vierkant met de plus (+).\n- **Volgorde:** Sleep foto's naar een nieuwe plek.\n- **Categorie:** U kunt een categorie typen (bv. 'Tuinonderhoud') om filters te maken op de website.\n- **Acties:** Selecteer meerdere foto's via de vinkjes om ze in één keer te verwijderen of te publiceren via het menu 'Acties'."
    },
    {
        question: "📧 Hoe stel ik het contactformulier in (Gmail)?",
        answer: "Ga naar het tabblad **'Instellingen'**. Om e-mails te kunnen versturen namens uw website, heeft Google een speciaal 'App-wachtwoord' nodig (uw normale wachtwoord werkt niet uit veiligheid).\n\n1. Log in op uw Google Account en ga naar Beveiliging.\n2. Zorg dat '2-staps-verificatie' aan staat.\n3. Zoek naar 'App-wachtwoorden'.\n4. Maak een nieuw wachtwoord aan (kies 'Anders' als naam, bv. 'Website').\n5. Kopieer de 16-cijferige code en plak deze in het veld 'Gmail App-wachtwoord' in het CMS."
    },
    {
        question: "🔍 Wat is SEO en waarom is 'Alt Tekst' belangrijk?",
        answer: "SEO zorgt dat u gevonden wordt in Google. \n\n- **Alt Tekst:** Bij elke foto ziet u een veld 'Alternatieve tekst'. Beschrijf hier kort wat er op de foto te zien is (bv. 'Strak aangelegd terras in Lier'). Dit is cruciaal voor Google om te snappen waar uw site over gaat.\n- **Titels & Slugs:** Zorg dat uw blogtitels en dienstnamen woorden bevatten waar mensen op zoeken."
    },
    {
        question: "👥 Wat is het verschil tussen Admin en Editor?",
        answer: "- **SuperAdmin:** (Dat bent u waarschijnlijk) Heeft toegang tot alles, inclusief gebruikersbeheer en geavanceerde instellingen.\n- **Admin:** Kan alle content en instellingen beheren, maar geen andere gebruikers verwijderen.\n- **Editor:** Kan alleen teksten, blogs en foto's aanpassen, maar niet aan de instellingen of e-mailconfiguratie komen."
    },
    {
        question: "😱 Ik heb een fout gemaakt! Kan ik terug?",
        answer: "Geen paniek! Ga naar het tabblad **'Geschiedenis'**.\n\nHier ziet u de laatste 10 versies van uw website. Klik op 'Herstel' naast een datum en tijdstip van gisteren of vorige week om de website volledig terug te zetten naar hoe hij toen was."
    }
];

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-zinc-700 last:border-0">
            <button
                className="w-full flex justify-between items-center text-left p-4 hover:bg-zinc-700/50 transition-colors focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="font-medium text-zinc-100 flex items-center gap-3">
                    <BookOpen size={20} className="text-green-500 flex-shrink-0" />
                    {question}
                </span>
                <CaretDown size={20} className={`text-zinc-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 pt-0 pl-11 bg-zinc-900/30 text-zinc-300 whitespace-pre-line leading-relaxed text-sm">
                    {answer}
                </div>
            </div>
        </div>
    )
}

const HelpTab = () => {
    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-zinc-100 flex items-center">
                    <Lifebuoy size={28} className="mr-3 text-green-500" />
                    Help & Handleiding
                </h2>
                <p className="text-zinc-400">
                    Hier vindt u uitleg over alle functies van uw website. Klik op een vraag om het antwoord te lezen.
                </p>
            </div>
            
            <div className="border border-zinc-700 rounded-lg bg-zinc-800/20 overflow-hidden">
                {faqData.map((item, index) => (
                    <AccordionItem key={index} question={item.question} answer={item.answer} />
                ))}
            </div>
            
            <div className="mt-8 p-4 bg-green-900/20 border border-green-900/50 rounded-lg text-center">
                <p className="text-green-100 text-sm">
                    Heeft u nog andere vragen of technische problemen? <br/>
                    Neem contact op met de beheerder van de applicatie.
                </p>
            </div>
        </>
    );
};

export default HelpTab;
