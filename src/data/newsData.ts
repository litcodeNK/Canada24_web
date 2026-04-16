import type { Article } from '../context/AppContext';

export const TOP_STORIES: Article[] = [
  {
    id: 'ts1',
    headline: "Ukraine scoffs at Putin's claims of Russian victory in besieged Mariupol",
    category: '',
    time: 'AN HOUR AGO',
    imgUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
    isLive: false,
    duration: '3:26',
  },
  {
    id: 'ts2',
    headline: 'House of Commons resumes with focus on housing affordability',
    category: 'POLITICS',
    time: '2 HOURS AGO',
    imgUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
  },
  {
    id: 'ts3',
    headline: 'New report highlights rapid melting of Arctic ice shelves',
    category: 'CLIMATE',
    time: '3 HOURS AGO',
    imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  },
  {
    id: 'ts4',
    headline: 'Bank of Canada holds interest rate amid economic uncertainty',
    category: 'BUSINESS',
    time: '4 HOURS AGO',
    imgUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
  },
  {
    id: 'ts5',
    headline: 'Federal health minister announces new pandemic preparedness plan',
    category: 'HEALTH',
    time: '5 HOURS AGO',
    imgUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400',
  },
];

export const TOP_STORIES_SUBITEMS = [
  { id: 's1', headline: 'The National: Special Report', isLive: true },
  { id: 's2', headline: "Trudeau says Canada is sending artillery to Ukraine. Here's what that could mean", isLive: false },
  { id: 's3', headline: 'The battle for Mariupol: Photographs from the front lines', category: 'PHOTOS', isLive: false },
];

export const LOCAL_ARTICLES: Record<string, Article[]> = {
  Calgary: [
    { id: 'c1', headline: 'Mental health concerns for Airdrie man accused of murdering mother', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
    { id: 'c2', headline: "Police identify man killed in northeast Calgary shooting as city's 11th homicide victim", time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300', isUpdated: true },
    { id: 'c3', headline: 'Calgary Transit to increase security presence at downtown stations', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300' },
  ],
  Manitoba: [
    { id: 'm1', headline: 'Manitoba government announces new healthcare funding initiative', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300' },
    { id: 'm2', headline: 'Winnipeg floods prompt emergency response across the region', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=300' },
  ],
  'Kitchener-Waterloo': [
    { id: 'kw1', headline: 'Waterloo tech company announces major expansion plans', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300' },
    { id: 'kw2', headline: 'Region of Waterloo invests in green transit solutions', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300' },
  ],
  Edmonton: [
    { id: 'e1', headline: 'Edmonton Oilers face off in critical playoff match', time: '30 mins ago', imgUrl: 'https://images.unsplash.com/photo-1580847097346-72d80f164702?w=300' },
    { id: 'e2', headline: 'City of Edmonton unveils new park redevelopment project', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300' },
  ],
};

export const ALL_REGIONS = [
  'British Columbia', 'Calgary', 'Edmonton', 'Hamilton', 'Kitchener-Waterloo',
  'London', 'Manitoba', 'Montreal', 'NL', 'New Brunswick', 'North',
  'Nova Scotia', 'Ottawa', 'PEI', 'Quebec', 'Saskatchewan', 'Toronto', 'Windsor',
];

export const CITY_TABS = ['Calgary', 'Manitoba', 'Kitchener-Waterloo', 'Edmonton'];

export interface VideoItem {
  id: string;
  title: string;
  duration?: string;
  showDuration: boolean;
  date: string;
  imgUrl: string;
  isLive: boolean;
  liveText?: string;
}

export const TRENDING_VIDEOS: VideoItem[] = [
  { id: 'v1', title: "Mariupol has not fallen because Russians 'inept,' says U.S. analyst", duration: '10:09', showDuration: true, date: 'April 27', imgUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300', isLive: false },
  { id: 'v2', title: 'Non-invasive COVID tests aim to make testing more accessible', duration: '03:45', showDuration: true, date: 'April 26', imgUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=300', isLive: false },
  { id: 'v3', title: 'Economic shifts impact local Canadian housing markets', duration: '05:12', showDuration: true, date: 'April 26', imgUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300', isLive: false },
];

export const NATIONAL_VIDEOS: VideoItem[] = [
  { id: 'n1', title: 'The National for April 27, 2022 - Full Broadcast', showDuration: false, date: 'LIVE AT 9PM', imgUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300', isLive: true, liveText: 'COMING UP' },
  { id: 'n2', title: 'Searching for answers in the wake of the latest storm', duration: '5:18', showDuration: true, date: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=300', isLive: false },
  { id: 'n3', title: 'Scientists discover breakthrough in satellite communication', duration: '08:15', showDuration: true, date: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300', isLive: false },
];

export const SECTION_FALLBACK_ARTICLES: Record<string, Article[]> = {
  Business: [
    { id: 'b1', headline: 'Bank of Canada holds interest rate steady as inflation pressures ease', category: 'BUSINESS', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600', isLive: false },
    { id: 'b2', headline: 'Canadian dollar gains ground against U.S. dollar amid trade optimism', category: 'BUSINESS', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=600', isLive: false },
    { id: 'b3', headline: 'Toronto housing market sees first price decline in three years', category: 'BUSINESS', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600', isLive: false },
    { id: 'b4', headline: 'Canada announces new trade deal with Indo-Pacific partners', category: 'BUSINESS', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600', isLive: false },
    { id: 'b5', headline: "Shopify reports record revenue as Canada's tech sector rebounds", category: 'BUSINESS', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', isLive: false },
    { id: 'b6', headline: 'Federal budget allocates $2B for small business recovery fund', category: 'BUSINESS', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', isLive: false },
  ],
  Health: [
    { id: 'h1', headline: 'Federal health minister announces expanded mental health funding for youth', category: 'HEALTH', time: '30 minutes ago', imgUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600', isLive: false },
    { id: 'h2', headline: 'New study links ultra-processed foods to higher dementia risk in Canadians', category: 'HEALTH', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600', isLive: false },
    { id: 'h3', headline: 'Canada approves new RSV vaccine for adults over 60', category: 'HEALTH', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', isLive: false },
    { id: 'h4', headline: 'Long-term care reform bill passes third reading in Parliament', category: 'HEALTH', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600', isLive: false },
    { id: 'h5', headline: 'Opioid crisis: BC declares provincial health emergency extension', category: 'HEALTH', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600', isLive: false },
    { id: 'h6', headline: 'Canada invests $500M to clear surgical backlog from pandemic', category: 'HEALTH', time: '7 hours ago', imgUrl: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600', isLive: false },
  ],
  Entertainment: [
    { id: 'en1', headline: 'TIFF 2025 lineup features record number of Canadian-directed films', category: 'ENTERTAINMENT', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600', isLive: false },
    { id: 'en2', headline: 'Drake announces surprise stadium tour across Canadian cities', category: 'ENTERTAINMENT', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600', isLive: false },
    { id: 'en3', headline: "New Canadian drama series tops streaming charts in 40 countries", category: 'ENTERTAINMENT', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600', isLive: false },
    { id: 'en4', headline: 'Celine Dion makes emotional comeback at Montreal benefit concert', category: 'ENTERTAINMENT', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600', isLive: false },
    { id: 'en5', headline: 'National Arts Centre announces free summer programming across Canada', category: 'ENTERTAINMENT', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600', isLive: false },
    { id: 'en6', headline: 'Canadian video game studio wins BAFTA for best narrative design', category: 'ENTERTAINMENT', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', isLive: false },
  ],
  Technology: [
    { id: 't1', headline: 'Canada launches national AI safety institute to regulate emerging tech', category: 'TECHNOLOGY', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', isLive: false },
    { id: 't2', headline: 'Waterloo startup raises $200M to bring quantum computing to hospitals', category: 'TECHNOLOGY', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600', isLive: false },
    { id: 't3', headline: 'Rogers and Bell expand rural 5G coverage to 500 new communities', category: 'TECHNOLOGY', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', isLive: false },
    { id: 't4', headline: 'Ottawa introduces new privacy bill targeting social media data collection', category: 'TECHNOLOGY', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600', isLive: false },
    { id: 't5', headline: 'Canadian university develops biodegradable circuit board from wood pulp', category: 'TECHNOLOGY', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600', isLive: false },
    { id: 't6', headline: 'Sidewalk Labs returns to Toronto with scaled-down smart city plan', category: 'TECHNOLOGY', time: '9 hours ago', imgUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600', isLive: false },
  ],
  Sports: [
    { id: 'sp1', headline: 'Maple Leafs advance to second round after dramatic Game 7 comeback', category: 'SPORTS', time: '45 minutes ago', imgUrl: 'https://images.unsplash.com/photo-1580847097346-72d80f164702?w=600', isLive: false },
    { id: 'sp2', headline: 'Canada women\'s soccer team qualifies for 2026 World Cup in style', category: 'SPORTS', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', isLive: false },
    { id: 'sp3', headline: 'Raptors sign top free agent in biggest deal in franchise history', category: 'SPORTS', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600', isLive: false },
    { id: 'sp4', headline: 'Snowboarder Mark McMorris claims gold at World Championships in Innsbruck', category: 'SPORTS', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600', isLive: false },
    { id: 'sp5', headline: 'CFL announces expansion franchise in Halifax set for 2027 season', category: 'SPORTS', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600', isLive: false },
    { id: 'sp6', headline: 'Canada wins five medals on day three of Paris athletics championships', category: 'SPORTS', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', isLive: false },
  ],
  Arts: [
    { id: 'ar1', headline: 'Indigenous artist Christi Belcourt named Canada\'s new Poet Laureate', category: 'ARTS', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600', isLive: false },
    { id: 'ar2', headline: 'National Gallery acquires landmark collection of Inuit sculpture', category: 'ARTS', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600', isLive: false },
    { id: 'ar3', headline: 'Montreal jazz festival celebrates 45th anniversary with free concerts', category: 'ARTS', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600', isLive: false },
    { id: 'ar4', headline: 'Canadian Ballet announces groundbreaking production of new Indigenous story', category: 'ARTS', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600', isLive: false },
    { id: 'ar5', headline: 'Stratford Festival sees record attendance after post-pandemic resurgence', category: 'ARTS', time: '7 hours ago', imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', isLive: false },
    { id: 'ar6', headline: "Ottawa's new gallery of contemporary Canadian art opens to acclaim", category: 'ARTS', time: '9 hours ago', imgUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600', isLive: false },
  ],
  Science: [
    { id: 'sc1', headline: 'Canadian researchers find new method to detect early-stage Alzheimer\'s', category: 'SCIENCE', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600', isLive: false },
    { id: 'sc2', headline: "UBC team's climate model selected by UN for global projections", category: 'SCIENCE', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600', isLive: false },
    { id: 'sc3', headline: 'Canada Space Agency selects four astronaut candidates for Lunar Gateway', category: 'SCIENCE', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600', isLive: false },
    { id: 'sc4', headline: 'TRIUMF lab achieves record particle acceleration breakthrough in Vancouver', category: 'SCIENCE', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600', isLive: false },
    { id: 'sc5', headline: 'McGill study links microplastics to inflammation in human lung tissue', category: 'SCIENCE', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600', isLive: false },
    { id: 'sc6', headline: 'Canadian Arctic research station detects record low sea ice extent', category: 'SCIENCE', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', isLive: false },
  ],
  Indigenous: [
    { id: 'in1', headline: 'First Nations leaders reach historic water rights agreement with federal government', category: 'INDIGENOUS', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600', isLive: false },
    { id: 'in2', headline: 'Residential school survivors receive long-awaited compensation payments', category: 'INDIGENOUS', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', isLive: false },
    { id: 'in3', headline: "Nunavut's first Indigenous-language university program launches this fall", category: 'INDIGENOUS', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278bc?w=600', isLive: false },
    { id: 'in4', headline: 'Crown and Métis Nation sign landmark self-governance agreement', category: 'INDIGENOUS', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600', isLive: false },
    { id: 'in5', headline: "Missing and Murdered Indigenous Women inquiry: new task force's first year report", category: 'INDIGENOUS', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600', isLive: false },
    { id: 'in6', headline: 'Six Nations creates Canada\'s first fully Indigenous-run renewable energy grid', category: 'INDIGENOUS', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600', isLive: false },
  ],
  World: [
    { id: 'w1', headline: "Canada's foreign minister to lead G7 discussion on Arctic sovereignty", category: 'WORLD', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600', isLive: false },
    { id: 'w2', headline: 'NATO allies look to Canada to increase peacekeeping contributions', category: 'WORLD', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600', isLive: false },
    { id: 'w3', headline: 'Canadian aid workers evacuated from conflict zone in Sudan', category: 'WORLD', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1584531870082-6d06b4f83ca7?w=600', isLive: false },
    { id: 'w4', headline: "Canada-EU trade pact enters new phase as CETA review concludes", category: 'WORLD', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=600', isLive: false },
    { id: 'w5', headline: 'Canada pledges $300M in humanitarian aid for climate-affected nations', category: 'WORLD', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600', isLive: false },
    { id: 'w6', headline: 'Ukraine ceasefire talks: Canada pushes for accountability mechanisms', category: 'WORLD', time: '7 hours ago', imgUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600', isLive: false },
  ],
  Opinion: [
    { id: 'op1', headline: "Why Canada's housing crisis is a failure of political will, not policy", category: 'OPINION', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600', isLive: false },
    { id: 'op2', headline: 'The case for proportional representation — and why it matters now', category: 'OPINION', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600', isLive: false },
    { id: 'op3', headline: "Canada's climate targets are ambitious. Our follow-through is not", category: 'OPINION', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600', isLive: false },
    { id: 'op4', headline: 'Dear premiers: Stop treating healthcare as a political football', category: 'OPINION', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600', isLive: false },
    { id: 'op5', headline: 'The oilsands debate we are not having — and should be', category: 'OPINION', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600', isLive: false },
    { id: 'op6', headline: 'Immigration is not the housing problem. Blaming newcomers is easier than fixing zoning', category: 'OPINION', time: '9 hours ago', imgUrl: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=600', isLive: false },
  ],
  Politics: [
    { id: 'po1', headline: 'Liberal government survives confidence vote by narrow margin', category: 'POLITICS', time: '45 minutes ago', imgUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600', isLive: false },
    { id: 'po2', headline: 'PM announces cabinet shuffle, elevates Atlantic Canada representation', category: 'POLITICS', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600', isLive: false },
    { id: 'po3', headline: 'House of Commons passes new anti-corruption legislation', category: 'POLITICS', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', isLive: false },
    { id: 'po4', headline: 'Federal election speculation grows as party polling narrows dramatically', category: 'POLITICS', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600', isLive: false },
    { id: 'po5', headline: 'Senate blocks controversial data surveillance bill, sends it back to Commons', category: 'POLITICS', time: '5 hours ago', imgUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600', isLive: false },
    { id: 'po6', headline: 'Quebec premier meets PM over language law dispute ahead of court ruling', category: 'POLITICS', time: '7 hours ago', imgUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278bc?w=600', isLive: false },
  ],
  Environment: [
    { id: 'ev1', headline: 'Canada sets bold new methane reduction targets ahead of COP31', category: 'ENVIRONMENT', time: '1 hour ago', imgUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600', isLive: false },
    { id: 'ev2', headline: 'Wildfire season begins early: thousands evacuated in BC interior', category: 'ENVIRONMENT', time: '2 hours ago', imgUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600', isLive: false },
    { id: 'ev3', headline: 'Great Lakes water levels at 50-year low, scientists warn of ecological crisis', category: 'ENVIRONMENT', time: '3 hours ago', imgUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600', isLive: false },
    { id: 'ev4', headline: 'Ottawa invests $4B in clean hydrogen economy for western Canada', category: 'ENVIRONMENT', time: '4 hours ago', imgUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600', isLive: false },
    { id: 'ev5', headline: 'Polar bear population in Churchill at record low, new census finds', category: 'ENVIRONMENT', time: '6 hours ago', imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', isLive: false },
    { id: 'ev6', headline: 'Canada bans single-use plastics in national parks and federal facilities', category: 'ENVIRONMENT', time: '8 hours ago', imgUrl: 'https://images.unsplash.com/photo-1466611653911-0072c949b957?w=600', isLive: false },
  ],
};
