import type { LocaleCode } from "./i18n";

export type MarketValue =
  | "Employer ATS APIs"
  | "Technology"
  | "Financial services"
  | "Healthcare"
  | "Consumer"
  | "Climate & energy"
  | "Professional services"
  | "Data & AI"
  | "Analytics"
  | "Operations"
  | "Product"
  | "Consulting";

type MarketValueCatalog = Record<MarketValue, string>;
type RegionValue =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Middle East & Africa";

const marketValues = {
  en: ["Employer ATS APIs", "Technology", "Financial services", "Healthcare", "Consumer", "Climate & energy", "Professional services", "Data & AI", "Analytics", "Operations", "Product", "Consulting"],
  ja: ["雇用主 ATS API", "テクノロジー", "金融サービス", "ヘルスケア", "消費者向け", "気候・エネルギー", "プロフェッショナルサービス", "データ・AI", "分析", "オペレーション", "プロダクト", "コンサルティング"],
  ko: ["고용주 ATS API", "기술", "금융 서비스", "헬스케어", "소비재", "기후 및 에너지", "전문 서비스", "데이터 및 AI", "분석", "운영", "제품", "컨설팅"],
  "zh-CN": ["雇主 ATS API", "科技", "金融服务", "医疗健康", "消费产业", "气候与能源", "专业服务", "数据与 AI", "数据分析", "运营", "产品", "咨询"],
  "zh-TW": ["雇主 ATS API", "科技", "金融服務", "醫療保健", "消費產業", "氣候與能源", "專業服務", "資料與 AI", "資料分析", "營運", "產品", "顧問"],
  es: ["API ATS de empleadores", "Tecnología", "Servicios financieros", "Salud", "Consumo", "Clima y energía", "Servicios profesionales", "Datos e IA", "Analítica", "Operaciones", "Producto", "Consultoría"],
  fr: ["API ATS employeurs", "Technologie", "Services financiers", "Santé", "Biens de consommation", "Climat et énergie", "Services professionnels", "Données et IA", "Analyse", "Opérations", "Produit", "Conseil"],
  de: ["Arbeitgeber-ATS-APIs", "Technologie", "Finanzdienstleistungen", "Gesundheitswesen", "Konsumgüter", "Klima und Energie", "Professionelle Dienstleistungen", "Daten und KI", "Analytik", "Betrieb", "Produkt", "Beratung"],
  "pt-BR": ["APIs de ATS de empregadores", "Tecnologia", "Serviços financeiros", "Saúde", "Consumo", "Clima e energia", "Serviços profissionais", "Dados e IA", "Análise", "Operações", "Produto", "Consultoria"],
  it: ["API ATS dei datori di lavoro", "Tecnologia", "Servizi finanziari", "Sanità", "Beni di consumo", "Clima ed energia", "Servizi professionali", "Dati e IA", "Analisi", "Operazioni", "Prodotto", "Consulenza"],
  nl: ["ATS-API's van werkgevers", "Technologie", "Financiële diensten", "Gezondheidszorg", "Consumentengoederen", "Klimaat en energie", "Professionele diensten", "Data en AI", "Analyse", "Operaties", "Product", "Consultancy"],
  pl: ["API ATS pracodawców", "Technologia", "Usługi finansowe", "Ochrona zdrowia", "Dobra konsumpcyjne", "Klimat i energia", "Usługi profesjonalne", "Dane i AI", "Analityka", "Operacje", "Produkt", "Doradztwo"],
  tr: ["İşveren ATS API'leri", "Teknoloji", "Finansal hizmetler", "Sağlık", "Tüketici", "İklim ve enerji", "Profesyonel hizmetler", "Veri ve yapay zekâ", "Analitik", "Operasyon", "Ürün", "Danışmanlık"],
  ru: ["API ATS работодателей", "Технологии", "Финансовые услуги", "Здравоохранение", "Потребительский сектор", "Климат и энергетика", "Профессиональные услуги", "Данные и ИИ", "Аналитика", "Операции", "Продукт", "Консалтинг"],
  uk: ["API ATS роботодавців", "Технології", "Фінансові послуги", "Охорона здоров’я", "Споживчий сектор", "Клімат та енергетика", "Професійні послуги", "Дані та ШІ", "Аналітика", "Операції", "Продукт", "Консалтинг"],
  ar: ["واجهات ATS لأصحاب العمل", "التكنولوجيا", "الخدمات المالية", "الرعاية الصحية", "السلع الاستهلاكية", "المناخ والطاقة", "الخدمات المهنية", "البيانات والذكاء الاصطناعي", "التحليلات", "العمليات", "المنتج", "الاستشارات"],
  he: ["ממשקי ATS של מעסיקים", "טכנולוגיה", "שירותים פיננסיים", "בריאות", "מוצרי צריכה", "אקלים ואנרגיה", "שירותים מקצועיים", "נתונים ובינה מלאכותית", "אנליטיקה", "תפעול", "מוצר", "ייעוץ"],
  hi: ["नियोक्ता ATS API", "प्रौद्योगिकी", "वित्तीय सेवाएँ", "स्वास्थ्य सेवा", "उपभोक्ता", "जलवायु और ऊर्जा", "पेशेवर सेवाएँ", "डेटा और एआई", "विश्लेषण", "संचालन", "उत्पाद", "परामर्श"],
  bn: ["নিয়োগকর্তার ATS API", "প্রযুক্তি", "আর্থিক সেবা", "স্বাস্থ্যসেবা", "ভোক্তা পণ্য", "জলবায়ু ও জ্বালানি", "পেশাদার সেবা", "ডেটা ও এআই", "বিশ্লেষণ", "কার্যক্রম", "পণ্য", "পরামর্শ"],
  ur: ["آجر ATS APIs", "ٹیکنالوجی", "مالیاتی خدمات", "صحت کی دیکھ بھال", "صارفین", "آب و ہوا اور توانائی", "پیشہ ورانہ خدمات", "ڈیٹا اور اے آئی", "تجزیات", "آپریشنز", "پروڈکٹ", "مشاورت"],
  id: ["API ATS pemberi kerja", "Teknologi", "Jasa keuangan", "Kesehatan", "Konsumen", "Iklim dan energi", "Jasa profesional", "Data dan AI", "Analitik", "Operasi", "Produk", "Konsultasi"],
  ms: ["API ATS majikan", "Teknologi", "Perkhidmatan kewangan", "Penjagaan kesihatan", "Pengguna", "Iklim dan tenaga", "Perkhidmatan profesional", "Data dan AI", "Analitik", "Operasi", "Produk", "Perundingan"],
  th: ["API ATS ของนายจ้าง", "เทคโนโลยี", "บริการทางการเงิน", "การดูแลสุขภาพ", "สินค้าอุปโภคบริโภค", "ภูมิอากาศและพลังงาน", "บริการวิชาชีพ", "ข้อมูลและ AI", "การวิเคราะห์", "การดำเนินงาน", "ผลิตภัณฑ์", "ที่ปรึกษา"],
  vi: ["API ATS của nhà tuyển dụng", "Công nghệ", "Dịch vụ tài chính", "Chăm sóc sức khỏe", "Tiêu dùng", "Khí hậu và năng lượng", "Dịch vụ chuyên nghiệp", "Dữ liệu và AI", "Phân tích", "Vận hành", "Sản phẩm", "Tư vấn"],
  fil: ["Mga ATS API ng employer", "Teknolohiya", "Serbisyong pinansyal", "Pangangalagang pangkalusugan", "Konsyumer", "Klima at enerhiya", "Propesyonal na serbisyo", "Data at AI", "Analytics", "Operasyon", "Produkto", "Pagkonsulta"],
  sv: ["Arbetsgivares ATS-API:er", "Teknik", "Finansiella tjänster", "Hälso- och sjukvård", "Konsumentvaror", "Klimat och energi", "Professionella tjänster", "Data och AI", "Analys", "Verksamhet", "Produkt", "Rådgivning"],
  no: ["Arbeidsgiveres ATS-API-er", "Teknologi", "Finansielle tjenester", "Helse", "Forbruker", "Klima og energi", "Profesjonelle tjenester", "Data og KI", "Analyse", "Drift", "Produkt", "Rådgivning"],
  da: ["Arbejdsgiveres ATS-API'er", "Teknologi", "Finansielle tjenester", "Sundhed", "Forbruger", "Klima og energi", "Professionelle tjenester", "Data og AI", "Analyse", "Drift", "Produkt", "Rådgivning"],
  fi: ["Työnantajien ATS-rajapinnat", "Teknologia", "Rahoituspalvelut", "Terveydenhuolto", "Kuluttajatuotteet", "Ilmasto ja energia", "Asiantuntijapalvelut", "Data ja tekoäly", "Analytiikka", "Toiminnot", "Tuote", "Konsultointi"],
  cs: ["API ATS zaměstnavatelů", "Technologie", "Finanční služby", "Zdravotnictví", "Spotřební zboží", "Klima a energie", "Profesionální služby", "Data a AI", "Analytika", "Provoz", "Produkt", "Poradenství"],
  sk: ["API ATS zamestnávateľov", "Technológie", "Finančné služby", "Zdravotníctvo", "Spotrebný tovar", "Klíma a energia", "Profesionálne služby", "Dáta a AI", "Analytika", "Prevádzka", "Produkt", "Poradenstvo"],
  hu: ["Munkáltatói ATS API-k", "Technológia", "Pénzügyi szolgáltatások", "Egészségügy", "Fogyasztási cikkek", "Éghajlat és energia", "Szakmai szolgáltatások", "Adatok és MI", "Elemzés", "Működés", "Termék", "Tanácsadás"],
  ro: ["API ATS pentru angajatori", "Tehnologie", "Servicii financiare", "Sănătate", "Bunuri de consum", "Climă și energie", "Servicii profesionale", "Date și IA", "Analiză", "Operațiuni", "Produs", "Consultanță"],
  el: ["API ATS εργοδοτών", "Τεχνολογία", "Χρηματοοικονομικές υπηρεσίες", "Υγεία", "Καταναλωτικά αγαθά", "Κλίμα και ενέργεια", "Επαγγελματικές υπηρεσίες", "Δεδομένα και ΤΝ", "Αναλυτική", "Λειτουργίες", "Προϊόν", "Συμβουλευτική"],
  bg: ["API за ATS на работодатели", "Технологии", "Финансови услуги", "Здравеопазване", "Потребителски стоки", "Климат и енергия", "Професионални услуги", "Данни и ИИ", "Анализи", "Операции", "Продукт", "Консултиране"],
  hr: ["API-ji ATS-a poslodavaca", "Tehnologija", "Financijske usluge", "Zdravstvo", "Potrošačka roba", "Klima i energija", "Profesionalne usluge", "Podaci i AI", "Analitika", "Operacije", "Proizvod", "Savjetovanje"],
  sr: ["API-ји ATS-а послодаваца", "Технологија", "Финансијске услуге", "Здравство", "Потрошачка роба", "Клима и енергија", "Професионалне услуге", "Подаци и ВИ", "Аналитика", "Операције", "Производ", "Саветовање"],
  sl: ["API-ji ATS delodajalcev", "Tehnologija", "Finančne storitve", "Zdravstvo", "Potrošniško blago", "Podnebje in energija", "Strokovne storitve", "Podatki in UI", "Analitika", "Operacije", "Izdelek", "Svetovanje"],
  sw: ["API za ATS za waajiri", "Teknolojia", "Huduma za kifedha", "Afya", "Bidhaa za walaji", "Hali ya hewa na nishati", "Huduma za kitaalamu", "Data na AI", "Uchanganuzi", "Uendeshaji", "Bidhaa", "Ushauri"],
  fa: ["APIهای ATS کارفرمایان", "فناوری", "خدمات مالی", "مراقبت سلامت", "کالاهای مصرفی", "اقلیم و انرژی", "خدمات حرفه‌ای", "داده و هوش مصنوعی", "تحلیل", "عملیات", "محصول", "مشاوره"],
} satisfies Record<LocaleCode, readonly string[]>;

const marketKeys: MarketValue[] = [
  "Employer ATS APIs", "Technology", "Financial services", "Healthcare",
  "Consumer", "Climate & energy", "Professional services", "Data & AI",
  "Analytics", "Operations", "Product", "Consulting",
];

const catalogs = Object.fromEntries(
  Object.entries(marketValues).map(([locale, values]) => [
    locale,
    Object.fromEntries(marketKeys.map((key, index) => [key, values[index]])),
  ]),
) as Record<LocaleCode, MarketValueCatalog>;

const regionValues = {
  en: ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa"],
  ja: ["北米", "ヨーロッパ", "アジア太平洋", "ラテンアメリカ", "中東・アフリカ"],
  ko: ["북아메리카", "유럽", "아시아 태평양", "라틴 아메리카", "중동 및 아프리카"],
  "zh-CN": ["北美洲", "欧洲", "亚太地区", "拉丁美洲", "中东与非洲"],
  "zh-TW": ["北美洲", "歐洲", "亞太地區", "拉丁美洲", "中東與非洲"],
  es: ["Norteamérica", "Europa", "Asia-Pacífico", "Latinoamérica", "Oriente Medio y África"],
  fr: ["Amérique du Nord", "Europe", "Asie-Pacifique", "Amérique latine", "Moyen-Orient et Afrique"],
  de: ["Nordamerika", "Europa", "Asien-Pazifik", "Lateinamerika", "Naher Osten und Afrika"],
  "pt-BR": ["América do Norte", "Europa", "Ásia-Pacífico", "América Latina", "Oriente Médio e África"],
  it: ["Nord America", "Europa", "Asia-Pacifico", "America Latina", "Medio Oriente e Africa"],
  nl: ["Noord-Amerika", "Europa", "Azië-Pacific", "Latijns-Amerika", "Midden-Oosten en Afrika"],
  pl: ["Ameryka Północna", "Europa", "Azja i Pacyfik", "Ameryka Łacińska", "Bliski Wschód i Afryka"],
  tr: ["Kuzey Amerika", "Avrupa", "Asya-Pasifik", "Latin Amerika", "Orta Doğu ve Afrika"],
  ru: ["Северная Америка", "Европа", "Азиатско-Тихоокеанский регион", "Латинская Америка", "Ближний Восток и Африка"],
  uk: ["Північна Америка", "Європа", "Азійсько-Тихоокеанський регіон", "Латинська Америка", "Близький Схід і Африка"],
  ar: ["أمريكا الشمالية", "أوروبا", "آسيا والمحيط الهادئ", "أمريكا اللاتينية", "الشرق الأوسط وأفريقيا"],
  he: ["צפון אמריקה", "אירופה", "אסיה והאוקיינוס השקט", "אמריקה הלטינית", "המזרח התיכון ואפריקה"],
  hi: ["उत्तरी अमेरिका", "यूरोप", "एशिया-प्रशांत", "लैटिन अमेरिका", "मध्य पूर्व और अफ्रीका"],
  bn: ["উত্তর আমেরিকা", "ইউরোপ", "এশিয়া-প্যাসিফিক", "লাতিন আমেরিকা", "মধ্যপ্রাচ্য ও আফ্রিকা"],
  ur: ["شمالی امریکہ", "یورپ", "ایشیا بحرالکاہل", "لاطینی امریکہ", "مشرق وسطیٰ اور افریقہ"],
  id: ["Amerika Utara", "Eropa", "Asia-Pasifik", "Amerika Latin", "Timur Tengah dan Afrika"],
  ms: ["Amerika Utara", "Eropah", "Asia-Pasifik", "Amerika Latin", "Timur Tengah dan Afrika"],
  th: ["อเมริกาเหนือ", "ยุโรป", "เอเชียแปซิฟิก", "ลาตินอเมริกา", "ตะวันออกกลางและแอฟริกา"],
  vi: ["Bắc Mỹ", "Châu Âu", "Châu Á - Thái Bình Dương", "Mỹ Latinh", "Trung Đông và Châu Phi"],
  fil: ["Hilagang Amerika", "Europa", "Asia-Pacific", "Latin America", "Gitnang Silangan at Africa"],
  sv: ["Nordamerika", "Europa", "Asien och Stillahavsområdet", "Latinamerika", "Mellanöstern och Afrika"],
  no: ["Nord-Amerika", "Europa", "Asia og Stillehavet", "Latin-Amerika", "Midtøsten og Afrika"],
  da: ["Nordamerika", "Europa", "Asien og Stillehavsområdet", "Latinamerika", "Mellemøsten og Afrika"],
  fi: ["Pohjois-Amerikka", "Eurooppa", "Aasian ja Tyynenmeren alue", "Latinalainen Amerikka", "Lähi-itä ja Afrikka"],
  cs: ["Severní Amerika", "Evropa", "Asie a Tichomoří", "Latinská Amerika", "Blízký východ a Afrika"],
  sk: ["Severná Amerika", "Európa", "Ázia a Tichomorie", "Latinská Amerika", "Blízky východ a Afrika"],
  hu: ["Észak-Amerika", "Európa", "Ázsia és a csendes-óceáni térség", "Latin-Amerika", "Közel-Kelet és Afrika"],
  ro: ["America de Nord", "Europa", "Asia-Pacific", "America Latină", "Orientul Mijlociu și Africa"],
  el: ["Βόρεια Αμερική", "Ευρώπη", "Ασία-Ειρηνικός", "Λατινική Αμερική", "Μέση Ανατολή και Αφρική"],
  bg: ["Северна Америка", "Европа", "Азиатско-Тихоокеански регион", "Латинска Америка", "Близък изток и Африка"],
  hr: ["Sjeverna Amerika", "Europa", "Azija i Pacifik", "Latinska Amerika", "Bliski istok i Afrika"],
  sr: ["Северна Америка", "Европа", "Азија и Пацифик", "Латинска Америка", "Блиски исток и Африка"],
  sl: ["Severna Amerika", "Evropa", "Azija in Pacifik", "Latinska Amerika", "Bližnji vzhod in Afrika"],
  sw: ["Amerika Kaskazini", "Ulaya", "Asia-Pasifiki", "Amerika ya Kusini", "Mashariki ya Kati na Afrika"],
  fa: ["آمریکای شمالی", "اروپا", "آسیا و اقیانوسیه", "آمریکای لاتین", "خاورمیانه و آفریقا"],
} satisfies Record<LocaleCode, readonly string[]>;

const regionKeys: RegionValue[] = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
];

const regionCatalogs = Object.fromEntries(
  Object.entries(regionValues).map(([locale, values]) => [
    locale,
    Object.fromEntries(regionKeys.map((key, index) => [key, values[index]])),
  ]),
) as Record<LocaleCode, Record<RegionValue, string>>;

const countryCodes: Record<string, string> = {
  "United States": "US", Canada: "CA", Mexico: "MX", "United Kingdom": "GB",
  Germany: "DE", France: "FR", Netherlands: "NL", Spain: "ES", Japan: "JP",
  "South Korea": "KR", Singapore: "SG", Taiwan: "TW", Australia: "AU",
  India: "IN", Brazil: "BR", Argentina: "AR", Colombia: "CO",
  "United Arab Emirates": "AE", "Saudi Arabia": "SA", "South Africa": "ZA",
  Kenya: "KE",
};

export function marketValueFor(locale: LocaleCode, value: string) {
  return catalogs[locale][value as MarketValue] || value;
}

export function countryLabelFor(locale: LocaleCode, value: string) {
  const code = countryCodes[value];
  if (!code) return value;
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) || value;
}

export function regionLabelFor(locale: LocaleCode, value: string) {
  return regionCatalogs[locale][value as RegionValue] || value;
}

export function timeRangeLabelFor(locale: LocaleCode, value: string) {
  const ranges: Record<string, { value: number; unit: "day" | "month" }> = {
    "Last 30 days": { value: 30, unit: "day" },
    "Last 3 months": { value: 3, unit: "month" },
    "Last 6 months": { value: 6, unit: "month" },
    "Last 12 months": { value: 12, unit: "month" },
  };
  const range = ranges[value];
  if (!range) return value;
  if (locale === "en") return value;
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: range.unit,
    unitDisplay: "long",
  }).format(range.value);
}
