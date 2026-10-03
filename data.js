/*
 * ============================================================
 *  ДАННЫЕ КАЛЬКУЛЯТОРА — все цены здесь
 * ============================================================
 *
 *  Все суммы — в дирхамах (AED).
 *
 *  Пометки в комментариях:
 *    ПРИМЕР    — выдуманная цифра, нужно заменить на настоящую
 *    ПРОВЕРИТЬ — цифра примерная или под вопросом, стоит уточнить
 *
 *  Как редактировать:
 *  - Меняй только числа и тексты в кавычках. Запятые и скобки не трогай.
 *  - Если что-то сломалось — сайт покажет пустую страницу.
 *    Скорее всего, потерялась запятая или скобка.
 */

// Плашка вверху сайта. Пустые кавычки "" — плашка исчезнет.
const TOP_NOTICE =
  "Цены на обучение, жильё и транспорт — осень 2026. Еда пока примерная.";

// Merit-скидка: 0.15 = 15%. Уменьшает только стоимость обучения (сборы не трогает).
const MERIT_DISCOUNT = 0.15;

/*
 * ---------- Университеты ----------
 *
 *  approx — true: перед суммой будет значок ~ (цена приблизительная)
 *  vat    — НДС, который нужно ДОБАВИТЬ к цене обучения (0.05 = 5%)
 *  note   — сноска под результатом для всего университета
 *  dorm   — какое общежитие у вуза: название из списка DORMS ниже (null = общежития нет)
 *
 *  programs — Foundation / бакалавриат / магистратура:
 *    specialties — список специальностей. Если в списке одна — выбор не показывается.
 *        name  — название
 *        price — цена обучения: число или диапазон [от, до]
 *                (в бюджете считается по минимальной, с пометкой «от»)
 *        upTo  — true, если известна только верхняя граница («до …»)
 *        fees  — сборы, которые НЕ уменьшаются merit-скидкой
 *        years — своя длительность для этой специальности (если отличается от программы)
 *        note  — сноска для этой специальности
 *    per   — "year" — цена за год (по умолчанию), "program" — за всю программу
 *    years — длительность в годах, если per: "program". В бюджете цена делится на years.
 *    note  — сноска для программы
 *
 *    Если программы нет: { available: false, hint: "подсказка" }
 */
const UNIVERSITIES = [
  {
    id: "uowd",
    name: "University of Wollongong in Dubai (UOWD)",
    dorm: "myriad",
    programs: {
      foundation: {
        specialties: [{ name: "Foundation (NCUK)", price: 60000 }],
        meritNote: "На NCUK Foundation уже действует скидка, дополнительная может не суммироваться.",
      },
      bachelor: {
        specialties: [
          { name: "Все программы, кроме инженерии", price: 63449 },
          { name: "Инженерия", price: 68909 },
        ],
      },
      master: {
        per: "program",
        years: 2,
        specialties: [
          { name: "AI и другие программы", price: 112985 },
          { name: "MBA", price: 115167 },
        ],
      },
    },
  },
  {
    id: "heriot-watt",
    name: "Heriot-Watt University Dubai",
    approx: true,
    vat: 0.05, // цены даны без НДС — добавляем 5%
    note: "Цены неофициальные, уточняйте на сайте университета. В расчёт добавлен НДС 5%.",
    dorm: "myriad",
    programs: {
      foundation: {
        specialties: [{ name: "Foundation", price: 63000 }],
      },
      bachelor: {
        specialties: [{ name: "Бакалавриат", price: [76045, 82264] }],
      },
      master: {
        per: "program",
        years: 1,
        specialties: [{ name: "Магистратура", price: [91990, 99349] }],
      },
    },
  },
  {
    id: "aud",
    name: "American University in Dubai (AUD)",
    dorm: "myriad",
    programs: {
      foundation: {
        available: false,
        hint: "В AUD нет Foundation. Есть программа английского языка — 29 400 AED за семестр.",
      },
      bachelor: {
        specialties: [
          // 106 051 обучение + 2 000 сбор = 108 051 в год
          { name: "Бакалавриат", price: 106051, fees: 2000 },
        ],
        note: "Цена бакалавриата включает сбор 2 000 AED.",
      },
      master: {
        per: "program",
        specialties: [
          { name: "Магистратура (10 курсов)", price: 144900, years: 1.5 }, // ПРОВЕРИТЬ длительность
          { name: "MBA", price: 173880, years: 2 },
        ],
      },
    },
  },
  {
    id: "cud",
    name: "Canadian University Dubai (CUD)",
    note: "Цены с официального сайта. Вуз может повышать их до 10% в год.",
    dorm: "myriad",
    // Цены с cud.ac.ae/fees, НДС уже включён. price — обучение, fees — сборы.
    programs: {
      foundation: {
        available: false,
        hint: "В CUD нет Foundation. Есть курсы английского языка EAP.",
      },
      bachelor: {
        // В год: обучение + сборы 2 236.50
        specialties: [
          { name: "Computer Science / Software Design / Cyber Security", price: 72466, fees: 2236.5 },
          { name: "Artificial Intelligence", price: 79712, fees: 2236.5 },
          { name: "Cloud Computing", price: 74881, fees: 2236.5 },
          { name: "Инженерия (Mechatronics, Power & Renewable Energy)", price: 82128, fees: 2236.5 },
          { name: "BBA (все направления)", price: 70781, fees: 2236.5 },
          { name: "Communication (журналистика, реклама, PR)", price: 64040, fees: 2236.5 },
          { name: "Psychology", price: 67410, fees: 2236.5 },
          { name: "Architecture / Interior Design / Design and AI", price: 88476, fees: 2236.5 },
        ],
      },
      master: {
        // За всю программу: обучение + сборы 2 604
        per: "program",
        years: 1.5, // ПРОВЕРИТЬ длительность
        specialties: [
          { name: "MBA", price: 101115, fees: 2604 },
          { name: "MSc Business Analytics", price: 84263, fees: 2604 },
          { name: "MSc Financial Technology", price: 92689, fees: 2604 },
          { name: "MSc Artificial Intelligence", price: 135135, fees: 2604 },
        ],
      },
    },
  },
  {
    id: "middlesex",
    name: "Middlesex University Dubai",
    dorm: "myriad",
    programs: {
      foundation: {
        specialties: [{ name: "Foundation (IFP)", price: 50301 }],
      },
      bachelor: {
        specialties: [{ name: "Бакалавриат", price: 64557 }],
        note: "Одна цена на все программы бакалавриата. За 3 года — 193 671 AED.",
      },
      master: {
        per: "program",
        years: 1,
        specialties: [
          { name: "MSc Data Science and AI / Cyber Security / Robotics", price: 76491 },
          {
            name: "Другие MSc",
            price: 98345,
            upTo: true, // известна только верхняя граница — ПРОВЕРИТЬ
            note: "Для «Других MSc» известна только верхняя граница цены, расчёт по ней.",
          },
          { name: "MBA", price: 84872 },
          { name: "Executive MBA", price: 117548 },
        ],
      },
    },
  },
  {
    id: "birmingham",
    name: "University of Birmingham Dubai",
    approx: true,
    note: "К цене может добавиться 5% НДС, уточняйте на сайте университета.",
    dorm: "myriad",
    programs: {
      foundation: {
        specialties: [{ name: "Foundation Year", price: 123506 }],
        note: "Это первый год программы с Foundation Year. Дальше — 134 922 AED в год.",
      },
      bachelor: {
        specialties: [{ name: "Бакалавриат", price: [128695, 156718] }],
        note: "Дороже всего — Computer Science.",
      },
      master: {
        // У Birmingham цена магистратуры уже ЗА ГОД
        specialties: [{ name: "Магистратура", price: [166356, 174509] }],
      },
    },
  },
  {
    id: "murdoch",
    name: "Murdoch University Dubai",
    approx: true,
    note: "Цены Murdoch пока примерные — настоящих ещё нет.",
    dorm: "myriad",
    programs: {
      foundation: { specialties: [{ name: "Foundation", price: 45000 }] }, // ПРИМЕР
      bachelor: { specialties: [{ name: "Бакалавриат", price: 68000 }] }, // ПРИМЕР
      master: { specialties: [{ name: "Магистратура", price: 78000 }] }, // ПРИМЕР
    },
  },
];

// ---------- Программы ----------
// Названия на сайте. Цены — у каждого университета выше.
const PROGRAMS = {
  foundation: "Foundation",
  bachelor: "Бакалавриат",
  master: "Магистратура",
};

// ---------- Общежития ----------
// Сейчас у всех вузов — Myriad. Чтобы дать вузу своё общежитие:
//   1) добавь сюда новую запись, например  hw: { label: "...", perMonth: ..., ... },
//   2) у университета выше поставь  dorm: "hw"
//
//  perMonth — цена за месяц, perYear — за весь контракт,
//  months — длительность контракта в месяцах, contract — подпись срока,
//  bills — подпись про коммунальные счета
const DORMS = {
  myriad: {
    label: "Студ. резиденция (Myriad)",
    perMonth: 5000,
    perYear: 50000,
    months: 10,
    contract: "за 10 месяцев учебного года",
    bills: "счета включены",
  },
};

// ---------- Жильё ----------
// Цена студии, апарт-отеля и шеринга зависит от образа жизни (economy / medium / comfort).
//
//  contract: "year"  — годовой контракт на 12 месяцев (студия):
//      range   — диапазон цен за ГОД [от, до], для подсказки
//      perYear — цена за год, по которой идёт расчёт
//  contract: "month" — помесячная аренда (апарт-отель, шеринг):
//      range    — диапазон цен за МЕСЯЦ [от, до], для подсказки (можно не указывать)
//      perMonth — цена за месяц, по которой идёт расчёт
//      Годовая сумма = perMonth × число месяцев, которое выберет пользователь (10 или 12)
//  area     — районы
//  hintName — как вариант называется в подсказке под результатом
//  bills    — подпись про коммунальные счета
const HOUSING = {
  dorm: { label: "Общежитие" }, // цена и название — в DORMS, у каждого вуза своё
  shared: {
    label: "Комната в шеринге (своя ванная)",
    hintName: "Шеринг",
    contract: "month",
    bills: "коммуналка обычно включена",
    byLifestyle: {
      economy: { area: "JVC / The Greens / Sports City", range: [3000, 4000], perMonth: 3500 },
      medium: { area: "Barsha Heights", range: [3500, 4500], perMonth: 4000 },
      comfort: { area: "Marina / Downtown / Business Bay", range: [4500, 6500], perMonth: 5500 },
    },
  },
  studio: {
    label: "Студия",
    hintName: "Студия",
    contract: "year",
    bills: "коммуналка в расчёт не входит", // ПРОВЕРИТЬ сумму коммуналки для студии
    byLifestyle: {
      economy: { area: "JVC / The Greens / Sports City", range: [50000, 55000], perYear: 52000 },
      medium: { area: "Barsha Heights", range: [50000, 60000], perYear: 55000 },
      comfort: { area: "Marina / Downtown / Business Bay", range: [65000, 100000], perYear: 85000 },
    },
  },
  aparthotel: {
    label: "Апарт-отель (студия)",
    hintName: "Апарт-отель",
    contract: "month",
    bills: "счета обычно включены",
    byLifestyle: {
      economy: { area: "JVC / The Greens / Sports City", range: [5000, 6500], perMonth: 5750 },
      medium: { area: "Barsha Heights", perMonth: 8500 },
      comfort: { area: "Marina / Downtown / Business Bay", perMonth: 10000 },
    },
  },
};

// Сколько месяцев живёшь в Дубае — для помесячной аренды (апарт-отель, шеринг)
const STAY_MONTHS = {
  10: "10 (учебный год)",
  12: "12",
};

// ---------- Транспорт ----------
// Цена за МЕСЯЦ, зависит от образа жизни (economy / medium / comfort).
// В годовом бюджете транспорт считается за столько же месяцев, сколько жильё.
//  notes — сноски под результатом, когда выбран этот вариант
const TRANSPORT = {
  metro: {
    label: "Метро / трамвай",
    // Студенческий проездной Nol (Blue card) на все зоны — 175 + иногда такси
    byLifestyle: {
      economy: 175, // только проездной
      medium: 325, // 175 + 150 такси
      comfort: 475, // 175 + 300 такси
    },
    notes: [
      "Студенческая скидка 50% действует для студентов до 23 лет. Без скидки проездной на все зоны — 350 AED.",
      "Разово при переезде: студенческая Nol-карта — 70 AED.",
    ],
  },
  taxi: {
    label: "Такси",
    byLifestyle: {
      economy: 1000, // ~32 поездки в месяц (только вуз)
      medium: 1450, // ~48 поездок (вуз + выходные)
      comfort: 2200, // такси везде, поездки длиннее
    },
    notes: ["10 минут на такси — около 22 AED. Расчёт: поездка ~15 минут ≈ 30 AED."],
  },
};

// ---------- Образ жизни ----------
// food  — еда за МЕСЯЦ
// other — прочее за МЕСЯЦ (связь, развлечения, одежда, мелочи)
const LIFESTYLE = {
  economy: { label: "Экономно", food: 1200, other: 600 }, // ПРИМЕР
  medium: { label: "Средне", food: 1800, other: 1200 }, // ПРИМЕР
  comfort: { label: "Комфортно", food: 3000, other: 2500 }, // ПРИМЕР
};
