import type { LocaleCode } from "./i18n";

type QuestionBankPolicyCopy = {
  title: string;
  policy: string;
};

const QUESTION_BANK_POLICY_COPY: Record<LocaleCode, QuestionBankPolicyCopy> = {
  en: {
    title: "Continuously updated, reviewed question bank",
    policy:
      "New questions are added continuously only after source licensing, quality, duplication, and safety review. InterviewThread does not run an unreviewed real-time web crawler.",
  },
  ja: {
    title: "継続的に更新される、審査済みの質問バンク",
    policy:
      "新しい質問は、出典のライセンス、品質、重複、安全性の審査を通過したものだけを継続的に追加します。InterviewThread は、未審査のリアルタイム Web クローラーを運用しません。",
  },
  ko: {
    title: "지속적으로 업데이트되는 검토된 질문 은행",
    policy:
      "새 질문은 출처 라이선스, 품질, 중복 여부, 안전성 검토를 통과한 경우에만 지속적으로 추가됩니다. InterviewThread는 검토되지 않은 실시간 웹 크롤러를 운영하지 않습니다.",
  },
  "zh-CN": {
    title: "持续更新的审核题库",
    policy:
      "新题目会持续增加，但必须先通过来源授权、质量、重复和安全审核。InterviewThread 不会运行未经审核的实时全网爬虫，也不会为了题量牺牲授权、质量或安全性。",
  },
  "zh-TW": {
    title: "持續更新的受審核題庫",
    policy:
      "新題目會持續增加，但必須先通過來源授權、品質、重複與安全審核。InterviewThread 不會執行未經審核的即時全網爬蟲，也不會為了題量犧牲授權、品質或安全性。",
  },
  es: {
    title: "Banco de preguntas revisado y actualizado continuamente",
    policy:
      "Solo se añaden preguntas nuevas después de revisar la licencia de la fuente, la calidad, los duplicados y la seguridad. InterviewThread no utiliza un rastreador web en tiempo real sin revisión.",
  },
  fr: {
    title: "Banque de questions vérifiée et continuellement enrichie",
    policy:
      "De nouvelles questions sont ajoutées uniquement après vérification des licences des sources, de la qualité, des doublons et de la sécurité. InterviewThread n’utilise pas de robot d’exploration Web en temps réel sans validation.",
  },
  de: {
    title: "Laufend aktualisierte und geprüfte Fragenbank",
    policy:
      "Neue Fragen werden erst nach Prüfung der Quellenlizenz, Qualität, Duplikate und Sicherheit hinzugefügt. InterviewThread betreibt keinen ungeprüften Echtzeit-Webcrawler.",
  },
  "pt-BR": {
    title: "Banco de perguntas revisado e atualizado continuamente",
    policy:
      "Novas perguntas são adicionadas continuamente somente após a análise da licença da fonte, qualidade, duplicidade e segurança. A InterviewThread não usa um rastreador da Web em tempo real sem revisão.",
  },
  it: {
    title: "Banca di domande verificata e aggiornata continuamente",
    policy:
      "Le nuove domande vengono aggiunte solo dopo la verifica delle licenze delle fonti, della qualità, dei duplicati e della sicurezza. InterviewThread non utilizza un crawler Web in tempo reale privo di revisione.",
  },
  nl: {
    title: "Doorlopend bijgewerkte en beoordeelde vragenbank",
    policy:
      "Nieuwe vragen worden pas toegevoegd na controle van bronlicenties, kwaliteit, duplicaten en veiligheid. InterviewThread gebruikt geen ongecontroleerde realtime webcrawler.",
  },
  pl: {
    title: "Stale aktualizowana i weryfikowana baza pytań",
    policy:
      "Nowe pytania są dodawane dopiero po sprawdzeniu licencji źródła, jakości, duplikatów i bezpieczeństwa. InterviewThread nie korzysta z niezweryfikowanego robota indeksującego sieć w czasie rzeczywistym.",
  },
  tr: {
    title: "Sürekli güncellenen ve incelenen soru bankası",
    policy:
      "Yeni sorular yalnızca kaynak lisansı, kalite, tekrar ve güvenlik incelemesinden sonra eklenir. InterviewThread, incelenmemiş gerçek zamanlı bir web tarayıcısı çalıştırmaz.",
  },
  ru: {
    title: "Постоянно обновляемый и проверяемый банк вопросов",
    policy:
      "Новые вопросы добавляются только после проверки лицензии источника, качества, дубликатов и безопасности. InterviewThread не использует непроверенный веб-краулер реального времени.",
  },
  uk: {
    title: "Банк запитань, що постійно оновлюється та перевіряється",
    policy:
      "Нові запитання додаються лише після перевірки ліцензії джерела, якості, дублікатів і безпеки. InterviewThread не використовує неперевірений вебкраулер у реальному часі.",
  },
  ar: {
    title: "بنك أسئلة مُراجع ومحدَّث باستمرار",
    policy:
      "تُضاف الأسئلة الجديدة باستمرار فقط بعد مراجعة ترخيص المصدر والجودة والتكرار والسلامة. لا يشغّل InterviewThread زاحف ويب فوريًا من دون مراجعة.",
  },
  he: {
    title: "מאגר שאלות מתעדכן ומבוקר",
    policy:
      "שאלות חדשות מתווספות רק לאחר בדיקת רישיון המקור, האיכות, הכפילויות והבטיחות. InterviewThread אינו מפעיל סורק רשת בזמן אמת ללא בקרה.",
  },
  hi: {
    title: "लगातार अपडेट और समीक्षा किया गया प्रश्न बैंक",
    policy:
      "नए प्रश्न केवल स्रोत लाइसेंस, गुणवत्ता, दोहराव और सुरक्षा की समीक्षा के बाद लगातार जोड़े जाते हैं। InterviewThread बिना समीक्षा वाला रीयल-टाइम वेब क्रॉलर नहीं चलाता।",
  },
  bn: {
    title: "নিয়মিত হালনাগাদ ও পর্যালোচিত প্রশ্নভান্ডার",
    policy:
      "উৎসের লাইসেন্স, মান, পুনরাবৃত্তি ও নিরাপত্তা যাচাইয়ের পরই নতুন প্রশ্ন যোগ করা হয়। InterviewThread পর্যালোচনাহীন রিয়েল-টাইম ওয়েব ক্রলার চালায় না।",
  },
  ur: {
    title: "مسلسل اپ ڈیٹ اور جانچ شدہ سوالات کا ذخیرہ",
    policy:
      "نئے سوالات صرف ماخذ کے لائسنس، معیار، نقل اور حفاظت کی جانچ کے بعد شامل کیے جاتے ہیں۔ InterviewThread بغیر جانچ کے حقیقی وقت کا ویب کرالر نہیں چلاتا۔",
  },
  id: {
    title: "Bank pertanyaan yang terus diperbarui dan ditinjau",
    policy:
      "Pertanyaan baru hanya ditambahkan setelah lisensi sumber, kualitas, duplikasi, dan keamanannya ditinjau. InterviewThread tidak menjalankan perayap web waktu nyata tanpa peninjauan.",
  },
  ms: {
    title: "Bank soalan yang sentiasa dikemas kini dan disemak",
    policy:
      "Soalan baharu hanya ditambah selepas lesen sumber, kualiti, pendua dan keselamatannya disemak. InterviewThread tidak menjalankan perangkak web masa nyata tanpa semakan.",
  },
  th: {
    title: "คลังคำถามที่ผ่านการตรวจสอบและอัปเดตอย่างต่อเนื่อง",
    policy:
      "คำถามใหม่จะถูกเพิ่มหลังผ่านการตรวจสอบสิทธิ์การใช้แหล่งข้อมูล คุณภาพ ความซ้ำซ้อน และความปลอดภัยเท่านั้น InterviewThread ไม่ใช้โปรแกรมรวบรวมข้อมูลเว็บแบบเรียลไทม์ที่ไม่มีการตรวจสอบ",
  },
  vi: {
    title: "Ngân hàng câu hỏi được kiểm duyệt và cập nhật liên tục",
    policy:
      "Câu hỏi mới chỉ được bổ sung sau khi kiểm tra giấy phép nguồn, chất lượng, nội dung trùng lặp và độ an toàn. InterviewThread không vận hành trình thu thập dữ liệu web theo thời gian thực khi chưa qua kiểm duyệt.",
  },
  fil: {
    title: "Patuloy na ina-update at sinusuring question bank",
    policy:
      "Nagdaragdag lamang ng bagong tanong matapos suriin ang lisensya ng pinagmulan, kalidad, pagkakadoble, at kaligtasan. Hindi nagpapatakbo ang InterviewThread ng hindi nasuring real-time web crawler.",
  },
  sv: {
    title: "Kontinuerligt uppdaterad och granskad frågebank",
    policy:
      "Nya frågor läggs endast till efter granskning av källlicens, kvalitet, dubbletter och säkerhet. InterviewThread använder ingen ogranskad webbsökrobot i realtid.",
  },
  no: {
    title: "Kontinuerlig oppdatert og kvalitetssikret spørsmålsbank",
    policy:
      "Nye spørsmål legges bare til etter kontroll av kildelisens, kvalitet, duplikater og sikkerhet. InterviewThread bruker ikke en ukontrollert nettsøkerobot i sanntid.",
  },
  da: {
    title: "Løbende opdateret og kvalitetssikret spørgsmålsbank",
    policy:
      "Nye spørgsmål tilføjes kun efter kontrol af kildelicens, kvalitet, dubletter og sikkerhed. InterviewThread bruger ikke en ukontrolleret webcrawler i realtid.",
  },
  fi: {
    title: "Jatkuvasti päivittyvä ja tarkistettu kysymyspankki",
    policy:
      "Uusia kysymyksiä lisätään vasta lähdelisenssin, laadun, päällekkäisyyksien ja turvallisuuden tarkistuksen jälkeen. InterviewThread ei käytä tarkistamatonta reaaliaikaista verkkorobottia.",
  },
  cs: {
    title: "Průběžně aktualizovaná a kontrolovaná databáze otázek",
    policy:
      "Nové otázky přidáváme až po kontrole licence zdroje, kvality, duplicit a bezpečnosti. InterviewThread nepoužívá nekontrolovaný webový crawler v reálném čase.",
  },
  sk: {
    title: "Priebežne aktualizovaná a kontrolovaná databáza otázok",
    policy:
      "Nové otázky pridávame až po kontrole licencie zdroja, kvality, duplicít a bezpečnosti. InterviewThread nepoužíva nekontrolovaný webový crawler v reálnom čase.",
  },
  hu: {
    title: "Folyamatosan frissített és ellenőrzött kérdésbank",
    policy:
      "Új kérdések csak a forráslicenc, a minőség, az ismétlődések és a biztonság ellenőrzése után kerülnek be. Az InterviewThread nem használ ellenőrizetlen, valós idejű webes keresőrobotot.",
  },
  ro: {
    title: "Bancă de întrebări verificată și actualizată continuu",
    policy:
      "Întrebările noi sunt adăugate numai după verificarea licenței sursei, a calității, a duplicatelor și a siguranței. InterviewThread nu utilizează un crawler web în timp real neverificat.",
  },
  el: {
    title: "Συνεχώς ενημερωμένη και ελεγμένη τράπεζα ερωτήσεων",
    policy:
      "Νέες ερωτήσεις προστίθενται μόνο μετά από έλεγχο της άδειας της πηγής, της ποιότητας, των διπλοτύπων και της ασφάλειας. Το InterviewThread δεν χρησιμοποιεί μη ελεγμένο πρόγραμμα ανίχνευσης ιστού σε πραγματικό χρόνο.",
  },
  bg: {
    title: "Постоянно обновявана и проверявана банка с въпроси",
    policy:
      "Нови въпроси се добавят само след проверка на лиценза на източника, качеството, дубликатите и безопасността. InterviewThread не използва непроверен уеб робот в реално време.",
  },
  hr: {
    title: "Kontinuirano ažurirana i provjerena baza pitanja",
    policy:
      "Nova pitanja dodaju se tek nakon provjere licence izvora, kvalitete, duplikata i sigurnosti. InterviewThread ne koristi neprovjereni web-pretraživač u stvarnom vremenu.",
  },
  sr: {
    title: "Континуирано ажурирана и проверена база питања",
    policy:
      "Нова питања се додају тек након провере лиценце извора, квалитета, дупликата и безбедности. InterviewThread не користи непроверени веб-пописивач у реалном времену.",
  },
  sl: {
    title: "Stalno posodobljena in pregledana zbirka vprašanj",
    policy:
      "Nova vprašanja dodamo šele po preverjanju licence vira, kakovosti, podvojenih vsebin in varnosti. InterviewThread ne uporablja nepregledanega spletnega pajka v realnem času.",
  },
  sw: {
    title: "Hifadhi ya maswali inayosasishwa na kukaguliwa kila mara",
    policy:
      "Maswali mapya huongezwa tu baada ya kukagua leseni ya chanzo, ubora, marudio na usalama. InterviewThread haitumii kitambazi cha wavuti cha moja kwa moja ambacho hakijakaguliwa.",
  },
  fa: {
    title: "بانک پرسشِ بازبینی‌شده و پیوسته به‌روزشونده",
    policy:
      "پرسش‌های جدید فقط پس از بررسی مجوز منبع، کیفیت، موارد تکراری و ایمنی افزوده می‌شوند. InterviewThread خزندهٔ وب بلادرنگِ بازبینی‌نشده اجرا نمی‌کند.",
  },
};

export function questionBankPolicyCopyFor(locale: LocaleCode) {
  return QUESTION_BANK_POLICY_COPY[locale];
}
