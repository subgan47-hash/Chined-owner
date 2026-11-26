import type { LaunchCitySettings } from './types';

export type LaunchCity = 'rotterdam' | 'denHaag' | 'amsterdam' | 'utrecht';

export interface PickupPoint {
  city: LaunchCity;
  cityLabel: string;
  postcode: string;
  neighborhood: string;
  name: string;
  type: string;
}

export const CITY_RANGES: Record<LaunchCity, { label: string; min: number; max: number }> = {
  rotterdam: { label: 'Rotterdam', min: 3000, max: 3099 },
  denHaag: { label: 'Den Haag', min: 2500, max: 2599 },
  amsterdam: { label: 'Amsterdam', min: 1000, max: 1109 },
  utrecht: { label: 'Utrecht', min: 3500, max: 3585 },
};

export const PICKUP_POINTS: PickupPoint[] = ([
  ['Zevenkamp','3068','Winkelcentrum Ambachtsplein','Pakketkluis & Afhaalpunt'], ['Prinsenland','3066','Winkelcentrum Mia van IJperenplein','ChiNed Hub & Kluis'], ['Nesselande','3059','Winkelcentrum Boulevard Nesselande','Pakketkluis'], ['Ommoord','3068','Winkelcentrum Hesseplaats / Binnenhof','Pakketkluis & Afhaalpunt'], ['Oosterflank / Alexander','3067','Winkelcentrum Alexandrium','Pakketkluis'], ['Kralingen','3062','Lusthofstraat / Oudedijk','Wijkafhaalpunt'], ['Hillegersberg','3054','Bergse Dorpsstraat','Wijkafhaalpunt'], ['Schiebroek','3053','Peppelweg','Pakketkluis & Afhaalpunt'], ['Noord / Bergpolder','3035','Eudokiaplein / Zwart Janstraat','Wijkafhaalpunt'], ['Centrum','3011','Koopgoot / Binnenrotte','24/7 Pakketkluis'], ['Delfshaven / Spangen','3026','Schiedamseweg / Mathenesserplein','Wijkafhaalpunt'], ['Overschie','3043','Burgemeester Baumannlaan','Pakketkluis & Afhaalpunt'], ['Zuidplein / Charlois','3083','Winkelcentrum Zuidplein','Pakketkluis'], ['IJsselmonde','3078','Winkelcentrum Keizerswaard','Pakketkluis & Afhaalpunt'], ['Katendrecht / Kop van Zuid','3072','Wilhelminapier / Fenix','Pakketkluis'],
  ['Centrum','2511','Spui / Grote Marktstraat','24/7 Pakketkluis'], ['Ypenburg','2597','Winkelcentrum Ypenburg','Pakketkluis & Afhaalpunt'], ['Leidschenveen','2492','Winkelcentrum \'t Hoge Veen','Pakketkluis & Afhaalpunt'], ['Loosduinen','2552','Winkelcentrum Loosduinen','Wijkafhaalpunt'], ['Scheveningen','2586','Palace Promenade / Stevinstraat','Pakketkluis'], ['Mariahoeve / Bezuidenhout','2592','Winkelcentrum Het Kleine Loo','Pakketkluis & Afhaalpunt'], ['Escamp / Leyweg','2545','Winkelcentrum Leyweg','Pakketkluis'],
  ['Centrum','1012','Kalverpassage / Centraal Station','24/7 Pakketkluis'], ['Amsterdam-Noord','1025','Winkelcentrum Boven\'t Y','Pakketkluis & Afhaalpunt'], ['Amsterdam-Oost','1093','Oostpoort Winkelcentrum','Pakketkluis & Afhaalpunt'], ['Amsterdam-Zuid / De Pijp','1072','Albert Cuyp / Ferdinand Bolstraat','Wijkafhaalpunt'], ['Amsterdam-West / Osdorp','1068','Osdorpplein','Pakketkluis & Afhaalpunt'], ['Amsterdam-Zuidoost','1102','Amsterdamse Poort','Pakketkluis & Afhaalpunt'], ['Amstelveen / Buitenveldert','1082','Gelderlandplein','Pakketkluis'],
  ['Centrum','3511','Hoog Catharijne / Utrecht Centraal','24/7 Pakketkluis'], ['Leidsche Rijn','3541','Leidsche Rijn Centrum','Pakketkluis & Afhaalpunt'], ['Overvecht','3561','Shoppingcenter Overvecht','Pakketkluis & Afhaalpunt'], ['Kanaleneiland','3526','Winkelcentrum Nova','Wijkafhaalpunt'], ['Lunetten','3524','Winkelcentrum Lunetten','Pakketkluis & Afhaalpunt'], ['Oost / Wittevrouwen','3572','Biltstraat / Nachtegaalstraat','Wijkafhaalpunt'],
] as Array<[string, string, string, string]>).map(([neighborhood, postcode, name, type]) => {
  const numeric = Number(postcode);
  const city = numeric >= 3000 && numeric <= 3099 ? 'rotterdam' : numeric >= 2500 && numeric <= 2599 ? 'denHaag' : numeric >= 1000 && numeric <= 1109 ? 'amsterdam' : 'utrecht';
  return { city, cityLabel: CITY_RANGES[city].label, postcode, neighborhood, name, type };
});

export function cityForPostcode(postcode: string): LaunchCity | null {
  const numeric = Number(postcode.replace(/\s/g, '').slice(0, 4));
  if (!Number.isFinite(numeric)) return null;
  return (Object.keys(CITY_RANGES) as LaunchCity[]).find(city => numeric >= CITY_RANGES[city].min && numeric <= CITY_RANGES[city].max) || null;
}

export function activeCityForPostcode(postcode: string, settings: LaunchCitySettings): LaunchCity | null {
  const city = cityForPostcode(postcode);
  return city && settings[city] ? city : null;
}

export function pickupPointsForCity(city: LaunchCity, postcode: string): PickupPoint[] {
  const prefix = postcode.replace(/\s/g, '').slice(0, 4);
  return PICKUP_POINTS.filter(point => point.city === city).sort((a, b) => Math.abs(Number(a.postcode) - Number(prefix)) - Math.abs(Number(b.postcode) - Number(prefix)));
}
