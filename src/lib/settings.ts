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
  oneboundKey: 't_31647448998',
  oneboundSecret: '89988a49',
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
  heroBanner: 'Vind producten op Shein, AliExpress en Temu. Wij zoeken ze goedkoper in China.',
  trustBar: '100% Transparante Fabrieksprijs · Geconsolideerde B2B-import via Rotterdam · QC met foto in China · Veilig betalen (iDEAL / Klarna / Bancontact) · 14 dagen zichttermijn',
  terms: `## Algemene Voorwaarden van ChiNed

**Artikel 1 – Definities**
ChiNed: de handelsnaam van de cross-border e-commerce aggregator gevestigd te Rotterdam, die namens Nederlandse consumenten producten inkoop bij 1688.com, Shein, Temu en AliExpress en deze in één bundel via Rotterdam importeert.
Klant: de natuurlijke persoon die via de ChiNed-platform een bestelling plaatst.
Bundel: een gecombineerde zending van minimaal 6 items afkomstig van verschillende Chinese webshops.

**Artikel 2 – Minimumbundel van 6 items**
Om meerdere producten efficiënt samen te sourcen en als één bundel te importeren, stelt ChiNed een minimum van 6 items per bestelling.

**Artikel 3 – Prijzen en wisselkoersen**
Alle prijzen op ChiNed worden berekend op basis van de actuele RMB-naar-EUR wisselkoers vermeerderd met een valuta-buffer van 3%. De getoonde sourcingprijs maakt duidelijk welke kosten in de bundel zijn verwerkt.

**Artikel 4 – Transportmodi**
ChiNed verzamelt bestellingen bij Chinese sourcing-sites, controleert de producten en verwerkt ze via de Rotterdamse hub.

**Artikel 5 – Community Retourfonds**
Elke bestelling bevat een bijdrage aan het ChiNed Collectief Community Retourfonds (€ 0,50 per standaarditem, € 0,85 per kledingstuk). Klanten die gedurende 12 maanden geen retour indienen, ontvangen hun volledige inleg terug met 10% bonus als shoptegoed, of 100% als contante uitbetaling.

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

**Community Retourfonds – Schadevrij-Voorrangsregel**
Naast de retourverzendkosten worden interne afschrijvingen, inspectie- en herverpakkingskosten in Rotterdam verhaald op het collectieve community-fonds, niet op de individuele klant.

Klanten met 0 retouren in een 12-maands periode:
• Krijgen voorrang bij uitkering
• Ontvangen tot 100% van hun persoonlijke inleg terug
• Keuze: ChiNed Shoptegoed + 10% bonus, of contante uitbetaling naar bankrekening

Het resterende fonds wordt pro-rata verdeeld onder klanten die wel retouren hebben ingediend.

**Retourprocedure**
1. Meld je retour aan via je ChiNed-account
2. Print het PostNL-retourlabel
3. Lever het pakket in bij een PostNL-punt
4. Na inspectie in Rotterdam wordt je inlegpositie bijgewerkt

Laatst bijgewerkt: 2026`,
  privacy: `## Privacybeleid (AVG) ChiNed

**1. Verwerkte gegevens**
ChiNed verwerkt: naam, e-mailadres, telefoonnummer, bezorgadres, bestelgeschiedenis en Community Fonds-bijdragen.

**2. Doel van verwerking**
Het uitvoeren van bestellingen, bezorging via PostNL, beheer van het Community Retourfonds en klantenservice.

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

Gebruik de tabs links als dagelijkse checklist. Tab 1 toont omzet, marge en volumes. Tab 2 beheert wisselkoers, vracht, de € 6,50 binnenlandse buffer, de minimale bundel van 6 items en de vier stads-schakelaars. Tab 3 beheert het Collectief Community Retourfonds en registreert retourverlies. Tab 4 exporteert inkooplijsten en beheert QC en de productcatalogus. Tab 5 scant CN-RTM-codes, sorteert op stad, postcode en wijkpunt en maakt labels. Tab 6 bevat koppelingen en betaalstromen. Tab 7 beheert juridische teksten, banners en prijsbewijs. Tab 8 is de boardroom-simulator.

Werk dagelijks van Nieuw naar QC Goedgekeurd, naar Rotterdam en daarna naar bezorging. Controleer voor elke bundel het minimum van 6 items en noteer afwijkingen direct bij de order.

Gebruik Print / Exporteer Handboek voor een overdraagbare werkinstructie.`,
  handbookCustomer: `# Klantenhandleiding

1. Bekijk een product op Temu, Shein, AliExpress of 1688.
2. Plak een productlink of upload een foto in de zoekbalk.
3. Vergelijk de etalageprijs met de ChiNed sourcingprijs.
4. Voeg minimaal 6 items uit verschillende categorieën toe aan je bundel.
5. Registreer of log in voor afrekenen, kies thuisbezorging of een wijkpunt en volg daarna je bestelling.
6. Je bijdrage aan het Community Retourfonds blijft zichtbaar in Mijn Account.`,
  guide: `# Hoe werkt ChiNed?

**1. Kies een etalageproduct** — gebruik Temu, Shein, AliExpress of 1688 om ideeën te vinden.

**2. Deel de link of foto** — ChiNed gebruikt je link of foto om een vergelijkbaar product bij Chinese sourcing-sites te vinden.

**3. Vergelijk echt** — bekijk bronprijs, bundelkosten en de duidelijke ChiNed-prijs.

**4. Bundel 6 items** — combineer producten zodat de B2B-route efficiënt kan worden verwerkt.

**5. Ontvang en volg** — registreer je, kies thuisbezorging of een wijkpunt en volg elke stap in je account.`,
  faq: `## Veelgestelde Vragen

**Waarom een minimum van 6 items?**
Door minimaal 6 items te bundelen, kunnen we de bestelling als één efficiënte B2B-import verwerken en onnodige losse pakketkosten voorkomen.

**Wat is het Community Retourfonds?**
Elke bestelling bevat een kleine bijdrage (€ 0,50 per item, € 0,85 per kledingstuk) aan een collectief fonds. Klanten die een jaar lang niets retourneren krijgen hun inleg terug plus 10% bonus.

**Hoe lang duurt de levering?**
De actuele verwerking en bezorgopties worden tijdens het afrekenen duidelijk weergegeven.

**Kan ik items uit verschillende webshops combineren?**
Ja! Dat is juist het idee van ChiNed. Je combineert items van 1688, Shein, Temu en AliExpress in één mandje.

**Wat als mijn product niet leverbaar blijkt?**
CN Cargo in China controleert elke bestelling met foto's (QC) voordat deze naar Rotterdam gaat. Als een product niet aan de kwaliteitsnorm voldoet, bestellen we het opnieuw of crediteren we het bedrag.

**Zijn Chinese maten anders?**
Ja, Chinese maten vallen 1 tot 2 maten kleiner. Raadpleeg altijd de maattabel in de productbeschrijving.`,
};
