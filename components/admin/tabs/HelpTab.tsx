import React, { useState } from 'react';
import { Question, CaretDown } from 'phosphor-react';

const faqData = [
    {
        question: "Hoe voeg ik een nieuwe dienst toe?",
        answer: "Ga naar de 'Diensten' tab. Klik onderaan de lijst op de knop '+ Dienst Toevoegen'. Er verschijnt een nieuw, ingeklapt item. Klik erop om het uit te vouwen en de details (titel, omschrijving, icoon) in te vullen. Vergeet niet op 'Wijzigingen Opslaan' te klikken als u klaar bent."
    },
    {
        question: "Wat is 'Alt Text' bij een afbeelding?",
        answer: "Alt-tekst (alternatieve tekst) is een beschrijving van een afbeelding. Deze tekst is cruciaal voor twee redenen: 1) Zoekmachines zoals Google gebruiken het om te begrijpen waar de afbeelding over gaat, wat uw SEO verbetert. 2) Schermlezers voor slechtziende gebruikers lezen deze tekst voor, waardoor uw website toegankelijker wordt. Een goede alt-tekst is kort maar beschrijvend, bv: 'Modern aangelegde stadstuin met houten terras en groene plantenborders'."
    },
    {
        question: "Wat betekent 'Gepubliceerd' vs 'Concept'?",
        answer: "Elke dienst en galerij-afbeelding heeft een 'Gepubliceerd' schakelaar. Als deze AAN staat, is het item zichtbaar op de live website voor iedereen. Als de schakelaar UIT staat (de status is 'Concept'), is het item opgeslagen in het systeem, maar onzichtbaar voor bezoekers. Dit is handig om content voor te bereiden en pas te tonen wanneer u er helemaal klaar voor bent."
    },
    {
        question: "Hoe verander ik de volgorde van diensten of galerij-afbeeldingen?",
        answer: "U kunt de volgorde eenvoudig aanpassen door een item aan te klikken, uw muisknop ingedrukt te houden, en het naar de gewenste positie te slepen. Laat de muisknop los om het op de nieuwe plek te plaatsen. De wijziging wordt pas definitief nadat u op 'Wijzigingen Opslaan' heeft geklikt."
    },
    {
        question: "Ik heb per ongeluk iets verkeerds opgeslagen. Kan ik dit herstellen?",
        answer: "Ja! Ga naar de 'Geschiedenis' tab. Hier vindt u een lijst van de laatste 10 keer dat de content is opgeslagen. Klik op de 'Herstel' knop naast een eerdere versie om de volledige website-inhoud terug te zetten naar die staat. Dit is een krachtige functie om fouten ongedaan te maken."
    }
];

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-zinc-700">
            <button
                className="w-full flex justify-between items-center text-left p-4 hover:bg-zinc-700/50"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="font-medium text-zinc-100">{question}</span>
                <CaretDown size={20} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 bg-zinc-900/50">
                    <p className="text-zinc-300 whitespace-pre-line">{answer}</p>
                </div>
            )}
        </div>
    )
}

const HelpTab = () => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-1 text-zinc-100 flex items-center"><Question size={28} className="mr-3 text-green-500" />Help & Documentatie</h2>
            <p className="text-zinc-400 mb-6">Hier vindt u antwoorden op veelgestelde vragen over het beheer van de website.</p>
            
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
                {faqData.map((item, index) => (
                    <AccordionItem key={index} question={item.question} answer={item.answer} />
                ))}
            </div>
        </>
    );
};

export default HelpTab;