import type { Settings, ApiKeyConfig, LegalDocs, PriceProof } from './types';

export const DEFAULT_SETTINGS: Settings = {
  rmbToEurRate: 0.128,
  currencyBufferPct: 3,
  merchantTo1688Ratio: 45,
  cnCargoFeePct: 6,
  domesticChinaShippingEur: 1.20,
  railRatePerKg: 2.50,
  airRatePerKg: 4.95,
  airFreightEnabled: true,
  volumeWeightDivisor: 8000,
  b2bDutyPct: 12,
  postnlRate: 0.75,
  postnlRebate: 1.0,
  platformMarginPerCategory: 0.0,
  dutchVatPct: 21,
  minBundleItems: 6,
  returnShippingSingle: 3.95,
  returnShippingMultiple: 6.95,
  communityFundStandard: 0.5,
  communityFundClothing: 0.85,
  shopCreditBonusPct: 10,
  blockedKeywords: ['namaak', 'replica', 'merk', 'batterij', 'accu', 'vloeistof', 'mes', 'wapen', 'medicijn', 'voeding', 'cosmetica'],
  euSurcharge: 6.05,
  maxParcelLength: 100,
  maxParcelWidth: 50,
  maxParcelHeight: 50,
  maxParcelWeight: 20,
  launchCities: { rotterdam: true, denHaag: false, amsterdam: false, utrecht: false },
  firstOrderMaxPriceCap: 30,
  firstOrderMaxPriceCapEnabled: true,
  returnPickupFee: 6.0,
  qcInstructionEn: 'QC MANDATORY CHECK: 1) Verify visible CE marking and EU manual on packaging for applicable items; reject immediately if missing. 2) Remove bulky shoeboxes/retail boxes and pack footwear/apparel tightly in polybags to minimize volumetric weight. 3) Take 2 clear QC photos (front + label) per item, remove Chinese invoices, and attach anonymous ChiNed barcode CN-RTM-XXXX. 4) SPACE OPTIMIZATION (NESTING): If an order contains a suitcase, backpack, or large storage box, pack smaller items (shoes in polybags, apparel, accessories) inside the hollow space to eliminate wasted volumetric weight.',
  explainerVideoUrl: '',
  oneboundKey: '',
  oneboundSecret: '',
};

export const DEFAULT_PRICE_PROOFS: PriceProof[] = [
  { id: 'proof-boots', title: 'Praktijkvoorbeeld #1', imageUrl: '/20261116_214243.jpg', sourceImageUrl: '/20261116_233350_(1).jpg', temuPrice: 10.92, euSurcharge: 6.05, sourceRmb: 17.5, sourceEur: 2.28, chinedPrice: 7.95, saving: 9.02, savingPct: 53, temuUrl: 'https://www.temu.com', sourceUrl: 'https://www.1688.com' },
  { id: 'proof-hiking', title: 'Praktijkvoorbeeld #2', imageUrl: '/20261116_214412_(2).jpg', sourceImageUrl: '/20261116_233840.jpg', temuPrice: 42.34, euSurcharge: 6.05, sourceRmb: 79, sourceEur: 10.27, chinedPrice: 26.95, saving: 21.44, savingPct: 44, temuUrl: 'https://www.temu.com', sourceUrl: 'https://www.1688.com' },
];

export const DEFAULT_API_KEYS: ApiKeyConfig = {
  merchant1688Key: '',
  merchant1688Endpoint: 'https://open.1688.com/api',
  sheinKey: '',
  sheinEndpoint: 'https://api.shein.com/v1',
  temuKey: '',
  temuEndpoint: 'https://api.temu.com/sourcing',
  aliexpressKey: '',
  aliexpressEndpoint: 'https://api.aliexpress.com/ds',
  pspProvider: 'mollie',
  pspLiveKey: '',
  pspMerchantId: '',
  pspWebhookSecret: '',
  pspIdeal: true,
  pspCreditcard: true,
  pspKlarna: true,
  pspBancontact: false,
  chinaPayoutProvider: 'alipay',
  chinaPayoutKey: '',
  postnlApiKey: '',
  postnlCustomerCode: '',
  postnlBlcContract: '',
  eoriNumber: '',
  oneboundKey: '',
  oneboundSecret: '',
};

export const DEFAULT_LEGAL: LegalDocs = {
  heroBanner: 'Vind producten op Shein, AliExpress en Temu. Wij zoeken ze goedkoper in China en verkopen vanuit voorraad in Rotterdam.',
  trustBar: '100% Duurzame Treinvracht · Voorraad in Rotterdam (1-2 dagen) & Wekelijkse Rotterdam-drops (18-24 dagen)',
  terms: `## Algemene Voorwaarden van ChiNed

**Artikel 1 – Definities**
ChiNed: de handelsnaam van de cross-border e-commerce aggregator gevestigd te Rotterdam, die namens Nederlandse consumenten producten inkoop bij 1688.com, Shein, Temu en AliExpress en deze in één bundel via Rotterdam importeert.
Klant: de natuurlijke persoon die via de ChiNed-platform een bestelling plaatst.
Bundel: een gecombineerde zending van minimaal 6 items afkomstig van verschillende Chinese webshops.

**Artikel 2 – Eerst inkopen, dan verkopen**
ChiNed koopt producten eerst zelf in bij Chinese sourcing-sites en voert deze in via Rotterdam. Pas wanneer de producten fysiek in Rotterdam op voorraad liggen, worden ze in de webshop aangeboden voor directe verkoop. Klanten kunnen voor producten die nog niet op voorraad zijn een vrijblijvende aanvraag doen voor een volgende Rotterdam-drop. Er wordt geen betaling gevraagd voor producten die nog niet fysiek in voorraad zijn.

**Artikel 3 – Prijzen en wisselkoersen**
Alle prijzen op ChiNed worden berekend op basis van de actuele RMB-naar-EUR wisselkoers vermeerderd met een valuta-buffer van 3%. De getoonde all-in prijs is de prijs die de klant betaalt, inclusief btw, invoerrechten, vracht en bezorging. Voor producten die nog niet op voorraad zijn, wordt een vrijblijvende richtprijs getoond.

**Artikel 4 – Transportmodi**
ChiNed verzamelt bestellingen bij Chinese sourcing-sites, controleert de producten en verwerkt ze via de Rotterdamse hub.

**Artikel 5 – ChiNed Retour-Spaarpot**
ChiNed hanteert één all-in prijs per product. Daarbij is een gratis loyaliteitsbonus inbegrepen: de ChiNed Retour-Spaarpot. Bij een retour binnen 14 dagen ontvangt de klant wettelijk 100% van het aankoopbedrag terug. Klanten die gedurende 12 maanden geen retour indienen, ontvangen de opgebouwde spaarpot + 10% bonus als shoptegoed, of 100% als contante uitbetaling. De spaarpot is geen aparte toeslag en wordt niet extra in rekening gebracht.

**Artikel 6 – Risico- en nalevingscontrole**
ChiNed blokkeert automatisch producten die voldoen aan risicokenmerken (namaak, replica, merkartikelen, batterijen, accu's, vloeistoffen, messen, wapens, medicijnen, voeding en cosmetica). Maximale pakketafmetingen: 100 x 50 x 50 cm, maximaal gewicht 20 kg.

**Artikel 7 – Betaling en levering**
Betaling vindt plaats via iDEAL, creditcard of Klarna. Levering geschiedt door PostNL, aan huis of op een Pakketautomaat naar keuze van de klant.

**Artikel 8 – Aansprakelijkheid**
ChiNed fungeert als inkoopbemiddelaar en is niet de fabrikant van de aangeboden producten. Garanties lopen via de oorspronkelijke fabrikant.

**Artikel 9 – Toepasselijk recht**
Op alle overeenkomsten is Nederlands recht van toepassing.

Laatst bijgewerkt: 2026`,
  returnPolicy: `## Retourbeleid ChiNed

**Teruggavekosten**
Bij retour van 1 item bedragen de retourverzendkosten € 3,95. Bij retour van meerdere items € 6,95. Deze kosten worden verhaald op de klant.

**Retour-Spaarpot – Schadevrij-Voorrangsregel**
De ChiNed Retour-Spaarpot is een gratis loyaliteitsbonus, inbegrepen in de all-in prijs. Bij een retour binnen 14 dagen ontvangt de klant wettelijk 100% van het aankoopbedrag terug. Er zijn geen extra retourkosten of afschrijvingen voor de klant.

Klanten met 0 retouren in een 12-maands periode:
• Krijgen voorrang bij uitkering
• Ontvangen de opgebouwde spaarpot + 10% bonus als ChiNed shoptegoed
• Keuze: ChiNed Shoptegoed + 10% bonus, of contante uitbetaling naar bankrekening

**Retourprocedure**
1. Meld je retour aan via je ChiNed-account binnen 14 dagen na levering
2. Print het PostNL-retourlabel
3. Lever het pakket in bij een PostNL-punt
4. Je ontvangt 100% van het aankoopbedrag terug

Laatst bijgewerkt: 2026`,
  privacy: `## Privacybeleid (AVG) ChiNed

**1. Verwerkte gegevens**
ChiNed verwerkt: naam, e-mailadres, telefoonnummer, bezorgadres, bestelgeschiedenis en Retour-Spaarpot-bijdragen.

**2. Doel van verwerking**
Het uitvoeren van bestellingen, bezorging via PostNL, beheer van de ChiNed Retour-Spaarpot en klantenservice.

**3. Bewaartermijn**
Bestelgegevens worden 7 jaar bewaard voor fiscale doeleinden. Accountgegevens worden bewaard zolang het account actief is.

**4. Delen met derden**
ChiNed deelt anonieme inkooplijsten (zonder klantnamen) met CN Cargo in China. Bezorggegevens worden gedeeld met PostNL. Verder worden geen gegevens verstrekt aan derden.

**5. Jouw rechten**
Je hebt het recht op inzage, correctie en verwijdering van je gegevens. Neem contact op via privacy@chined.nl.

**6. Beveiliging**
Alle gegevens worden versleuteld opgeslagen. API-sleutels worden beveiligd opgeslagen en nooit in platte tekst getoond aan derden.

Laatst bijgewerkt: 2026`,
  handbookAdmin: `# Beheerdershandboek

Gebruik de tabs links als dagelijkse checklist. Tab 1 toont omzet, marge en volumes. Tab 2 beheert wisselkoers, vracht, de € 6,50 binnenlandse buffer, de minimale bundel van 6 items en de vier stads-schakelaars. Tab 3 beheert de ChiNed Retour-Spaarpot en registreert retourverlies. Tab 4 exporteert inkooplijsten en beheert QC en de productcatalogus. Tab 5 scant CN-RTM-codes, sorteert op stad, postcode en wijkpunt en maakt labels. Tab 6 bevat koppelingen en betaalstromen. Tab 7 beheert juridische teksten, banners en prijsbewijs. Tab 8 is de boardroom-simulator.

Werk dagelijks van Nieuw naar QC Goedgekeurd, naar Rotterdam en daarna naar bezorging. Controleer voor elke bundel het minimum van 6 items en noteer afwijkingen direct bij de order.

Gebruik Print / Exporteer Handboek voor een overdraagbare werkinstructie.`,
  handbookCustomer: `# Klantenhandleiding

1. Bekijk een product op Temu, Shein of AliExpress.
2. Plak een productlink of upload een foto in de ChiNed zoekbalk.
3. Vergelijk de etalageprijs met de ChiNed all-in richtprijs.
4. Is het product op voorraad in Rotterdam? Voeg het toe aan je mandje en reken direct af.
5. Nog niet op voorraad? Doe een vrijblijvende aanvraag voor de volgende Rotterdam-drop.
6. Volg je bestelling via je account met Track & Trace.
7. Je ChiNed Retour-Spaarpot blijft zichtbaar in Mijn Account — bij 0 retouren in 12 maanden ontvang je de spaarpot + 10% bonus.`,
  guide: `# Hoe werkt ChiNed?

**1. Kies een etalageproduct** — gebruik Temu, Shein of AliExpress om ideeën te vinden.

**2. Zoek via ChiNed** — plak een link of upload een foto. ChiNed zoekt direct op 1688.com en toont de all-in richtprijs.

**3. Vergelijk echt** — bekijk de etalageprijs en de ChiNed all-in prijs naast elkaar.

**4. Op voorraad? Direct bestellen** — producten met het groene 'Op voorraad' badge kun je direct afrekenen.

**5. Nog niet op voorraad? Vraag aan** — doe een vrijblijvende aanvraag voor de volgende Rotterdam-drop. Geen betaling nodig.

**6. Ontvang en volg** — registreer je, kies thuisbezorging of een wijkpunt en volg elke stap in je account.`,
  faq: `## Veelgestelde Vragen

**Waarom zijn sommige producten niet direct op voorraad?**
ChiNed koopt eerst in bij Chinese sourcing-sites en voert producten in via Rotterdam. Pas als ze fysiek in voorraad liggen, kun je direct afrekenen. Voor andere producten kun je een vrijblijvende aanvraag doen voor de volgende Rotterdam-drop.

**Wat is de ChiNed Retour-Spaarpot?**
Dat is een gratis loyaliteitsbonus, inbegrepen in de all-in prijs. Bij een retour binnen 14 dagen ontvang je wettelijk 100% van je aankoopbedrag terug. Bij 0 retouren in 12 maanden ontvang je de opgebouwde spaarpot + 10% bonus als shoptegoed.

**Hoe lang duurt de levering?**
Voor producten op voorraad in Rotterdam: 1-2 werkdagen. Voor Rotterdam-drop aanvragen: 18-24 dagen (treinvracht).

**Kan ik items uit verschillende webshops combineren?**
Ja! ChiNed zoekt producten van 1688, Shein, Temu en AliExpress en bundelt ze in één bestelling.

**Wat als mijn product niet leverbaar blijkt?**
CN Cargo in China controleert elke bestelling met foto's (QC) voordat deze naar Rotterdam gaat. Als een product niet aan de kwaliteitsnorm voldoet, bestellen we het opnieuw of crediteren we het bedrag.

**Zijn Chinese maten anders?**
Ja, Chinese maten vallen 1 tot 2 maten kleiner. Raadpleeg altijd de maattabel in de productbeschrijving.`,
};
