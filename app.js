// Логика калькулятора. Цены здесь не хранятся — они все в data.js.

// Цвета категорий на графике — в гамме «Ночной Дубай».
// Порядок важен: соседние цвета проверены на различимость, в том числе
// для людей с нарушениями цветового зрения, и на контраст с тёмной карточкой.
const CATEGORIES = [
  { key: "tuition", label: "Учёба", color: "#E9B949" }, // золотой
  { key: "housing", label: "Жильё", color: "#4F86C6" }, // синий
  { key: "food", label: "Еда", color: "#F2E8D0" }, // молочный
  { key: "transport", label: "Транспорт", color: "#C26E3A" }, // медный
  { key: "other", label: "Прочее", color: "#86C5E8" }, // небесный
];

// Что сейчас выбрано (значения по умолчанию)
const state = {
  university: UNIVERSITIES[0].id,
  program: "bachelor",
  specialty: 0, // номер специальности в списке
  housing: "shared",
  transport: "metro",
  lifestyle: "medium",
  months: "10", // сколько месяцев живёшь в Дубае (для апарт-отеля и шеринга)
  merit: false,
};

// ---------- Помощники ----------

function formatNumber(amount) {
  return Math.round(amount).toLocaleString("ru-RU");
}

function formatAED(amount) {
  return formatNumber(amount) + " AED";
}

function currentUniversity() {
  return UNIVERSITIES.find((u) => u.id === state.university);
}

function currentProgram() {
  return currentUniversity().programs[state.program];
}

function currentSpecialty() {
  return currentProgram().specialties[state.specialty];
}

// Доступен ли вариант у выбранного университета
function isAvailable(group, key) {
  const uni = currentUniversity();
  if (group === "program") {
    const program = uni.programs[key];
    return program != null && program.available !== false;
  }
  if (group === "housing" && key === "dorm") return uni.dorm != null && DORMS[uni.dorm] != null;
  return true;
}

// Если выбранный вариант стал недоступен (сменили университет) —
// переключаемся на запасной: для программы это бакалавриат.
function fixUnavailable(group, options, fallback) {
  if (isAvailable(group, state[group])) return;
  if (fallback && isAvailable(group, fallback)) {
    state[group] = fallback;
  } else {
    state[group] = Object.keys(options).find((key) => isAvailable(group, key));
  }
}

// ---------- Отрисовка кнопок ----------

function renderChips(group, options) {
  const container = document.getElementById(group);
  container.innerHTML = "";

  for (const [key, option] of Object.entries(options)) {
    const available = isAvailable(group, key);
    const label = chipLabel(group, key, option, available);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = label;
    button.disabled = !available;
    button.setAttribute("aria-pressed", state[group] === key);

    button.addEventListener("click", () => {
      if (state[group] !== key && group === "program") state.specialty = 0;
      state[group] = key;
      update();
    });

    container.appendChild(button);
  }
}

// Подпись на кнопке
function chipLabel(group, key, option, available) {
  if (group === "housing" && key === "dorm") {
    return available ? DORMS[currentUniversity().dorm].label : "нет общежития";
  }
  const label = typeof option === "string" ? option : option.label;
  return available ? label : "нет " + label;
}

// Подсказка, если у вуза нет какой-то программы (например, про курсы английского)
function renderProgramHint() {
  const hints = Object.values(currentUniversity().programs)
    .filter((p) => p.available === false && p.hint)
    .map((p) => p.hint);
  const box = document.getElementById("program-hint");
  box.textContent = hints.join(" ");
  box.hidden = hints.length === 0;
}

// Выбор специальности — показываем, только если вариантов больше одного
function renderSpecialties() {
  const specialties = currentProgram().specialties;
  const field = document.getElementById("specialty-field");
  const select = document.getElementById("specialty");

  field.hidden = specialties.length < 2;
  select.innerHTML = "";
  specialties.forEach((spec, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = spec.name;
    select.appendChild(option);
  });
  select.value = state.specialty;
}

// Официальная цена выбранной программы (до скидок и НДС)
function renderPriceInfo() {
  const uni = currentUniversity();
  const program = currentProgram();
  const spec = currentSpecialty();
  const [min, max] = priceRange(spec);

  let text;
  if (spec.upTo) text = `до ${formatAED(max)}`;
  else if (min !== max) text = `от ${formatNumber(min)} до ${formatAED(max)}`;
  else text = formatAED(min);

  if (program.per === "program") {
    text += ` за всю программу (${formatYears(programYears())})`;
  } else {
    text += " в год";
  }

  const extras = [];
  if (uni.vat) extras.push(`+${uni.vat * 100}% НДС`);
  if (state.merit) extras.push(`−${MERIT_DISCOUNT * 100}% merit-скидка`);

  document.getElementById("price-info").innerHTML =
    `<span>Стоимость обучения:</span> <b>${uni.approx ? "~" : ""}${text}</b>` +
    (extras.length ? `<small>В расчёте: ${extras.join(", ")}</small>` : "");
}

// ---------- Расчёт ----------

// Цена специальности как диапазон [от, до]
function priceRange(spec) {
  const fees = spec.fees || 0;
  if (Array.isArray(spec.price)) return [spec.price[0] + fees, spec.price[1] + fees];
  return [spec.price + fees, spec.price + fees];
}

// Обучение за год, с учётом скидки, НДС и длительности программы
// Длительность программы: у специальности может быть своя
function programYears() {
  const program = currentProgram();
  if (program.per !== "program") return 1;
  return currentSpecialty().years || program.years;
}

function formatYears(years) {
  return years.toLocaleString("ru-RU") + " г.";
}

function tuitionPerYear(price) {
  const uni = currentUniversity();
  const fees = currentSpecialty().fees || 0;
  const years = programYears();

  let tuition = price - fees; // скидка и НДС — только на обучение, не на сборы
  if (state.merit) tuition = tuition * (1 - MERIT_DISCOUNT);
  if (uni.vat) tuition = tuition * (1 + uni.vat);

  return (tuition + fees) / years;
}

// Жильё: цена в месяц, за год, срок и подписи
function housingDetails() {
  if (state.housing === "dorm") {
    const dorm = DORMS[currentUniversity().dorm];
    return {
      perMonth: dorm.perMonth,
      perYear: dorm.perYear,
      months: dorm.months,
      term: "Контракт " + dorm.contract + ".",
      hint: `${dorm.label}: ${formatAED(dorm.perMonth)} в месяц, ${formatAED(dorm.perYear)} ${dorm.contract}; ${dorm.bills}.`,
    };
  }

  const housing = HOUSING[state.housing];
  const level = housing.byLifestyle[state.lifestyle];
  const range = level.range;

  if (housing.contract === "year") {
    // Годовой контракт: 12 месяцев
    const roundTo100 = (x) => Math.round(x / 100) * 100;
    const rangeText = range
      ? `${formatNumber(range[0])}–${formatAED(range[1])} в год ` +
        `(${formatNumber(roundTo100(range[0] / 12))}–${formatNumber(roundTo100(range[1] / 12))} в месяц)`
      : `${formatAED(level.perYear)} в год`;
    return {
      perMonth: level.perYear / 12,
      perYear: level.perYear,
      months: 12,
      term: "Годовой контракт на 12 месяцев.",
      hint: `${housing.hintName} в ${level.area}: ${rangeText}, ${housing.bills}.`,
    };
  }

  // Помесячная аренда: срок выбирает пользователь
  const months = Number(state.months);
  const rangeText = range
    ? `${formatNumber(range[0])}–${formatAED(range[1])} в месяц`
    : `${formatAED(level.perMonth)} в месяц`;
  return {
    perMonth: level.perMonth,
    perYear: level.perMonth * months,
    months,
    term: null, // вместо подписи показываем переключатель 10 / 12
    hint: `${housing.hintName} в ${level.area}: ${rangeText}, ${housing.bills}.`,
  };
}

// Считаем каждую категорию в месяц и за год
function calculate() {
  const spec = currentSpecialty();
  const [min, max] = priceRange(spec);
  const housing = housingDetails();
  const life = LIFESTYLE[state.lifestyle];
  const transport = TRANSPORT[state.transport].byLifestyle[state.lifestyle];

  // Для диапазона считаем по минимальной цене, для «до …» — по верхней
  const tuitionYear = tuitionPerYear(spec.upTo ? max : min);

  return {
    tuition: { month: tuitionYear / 12, year: tuitionYear },
    housing: { month: housing.perMonth, year: housing.perYear, months: housing.months },
    food: { month: life.food, year: life.food * 12 },
    // Транспорт — за столько же месяцев, сколько жильё
    transport: { month: transport, year: transport * housing.months, months: housing.months },
    other: { month: life.other, year: life.other * 12 },
  };
}

// Срок проживания: переключатель для помесячной аренды или подпись для остальных
function renderStay() {
  const term = housingDetails().term;
  document.getElementById("months-field").hidden = term !== null;
  const termText = document.getElementById("housing-term");
  termText.textContent = term || "";
  termText.hidden = term === null;
  if (term === null) renderChips("months", STAY_MONTHS);
}

// Приставка к сумме: «~», «от», «до»
function pricePrefix() {
  const spec = currentSpecialty();
  const [min, max] = priceRange(spec);
  let prefix = currentUniversity().approx ? "~" : "";
  if (spec.upTo) prefix += "до ";
  else if (min !== max) prefix += "от ";
  return prefix;
}

// ---------- Отрисовка результата ----------

function renderResult(costs) {
  const items = Object.values(costs);
  const totalMonth = items.reduce((sum, x) => sum + x.month, 0);
  const totalYear = items.reduce((sum, x) => sum + x.year, 0);
  const prefix = pricePrefix();

  document.getElementById("total-month").textContent = prefix + formatAED(totalMonth);
  document.getElementById("total-year").textContent = prefix + formatAED(totalYear);

  const bar = document.getElementById("bar");
  const list = document.getElementById("breakdown");
  bar.innerHTML = "";
  list.innerHTML = "";

  const summary = [];

  for (const cat of CATEGORIES) {
    const cost = costs[cat.key];
    const percent = (cost.year / totalYear) * 100; // доля в годовом бюджете
    const valuePrefix = cat.key === "tuition" ? prefix : "";
    const period = cost.months && cost.months !== 12 ? `за ${cost.months} мес.` : "в год";
    summary.push(`${cat.label} ${Math.round(percent)}%`);

    // Кусочек полоски
    const segment = document.createElement("div");
    segment.className = "bar-segment";
    segment.style.width = percent + "%";
    segment.style.background = cat.color;
    segment.dataset.key = cat.key;
    bar.appendChild(segment);

    // Строка в списке
    const item = document.createElement("li");
    item.className = "breakdown-item";
    item.dataset.key = cat.key;
    item.innerHTML = `
      <span class="dot" style="background:${cat.color}"></span>
      <span class="breakdown-name">${cat.label}</span>
      <span class="breakdown-percent">${Math.round(percent)}%</span>
      <span class="breakdown-values">
        <b>${valuePrefix}${formatAED(cost.month)}</b><small>${valuePrefix}${formatAED(cost.year)} ${period}</small>
      </span>`;
    list.appendChild(item);

    // Наведение на строку подсвечивает кусочек на полоске
    item.addEventListener("mouseenter", () => highlight(cat.key));
    item.addEventListener("mouseleave", () => highlight(null));
    segment.addEventListener("mouseenter", () => highlight(cat.key));
    segment.addEventListener("mouseleave", () => highlight(null));
  }

  bar.setAttribute("aria-label", "Разбивка расходов: " + summary.join(", "));
}

function highlight(key) {
  document.querySelectorAll("[data-key]").forEach((el) => {
    el.classList.toggle("dimmed", key !== null && el.dataset.key !== key);
  });
}

// Сноски под результатом
function renderNotes() {
  const uni = currentUniversity();
  const program = currentProgram();
  const spec = currentSpecialty();
  const [min, max] = priceRange(spec);

  const notes = [];
  if (min !== max && !spec.upTo) notes.push("Цена указана диапазоном — в бюджете посчитано по минимальной.");
  if (program.per === "program") {
    notes.push(`Цена магистратуры — за всю программу, в бюджете она разделена на ${formatYears(programYears())}`);
  }
  notes.push("Учёба за год делится на 12, чтобы показать сумму в месяц.");
  if (state.housing === "dorm" || HOUSING[state.housing].contract === "month") {
    const months = housingDetails().months;
    if (months !== 12) notes.push(`Жильё и транспорт в годовом бюджете — за ${months} мес., еда и прочее — за 12.`);
  }
  if (uni.note) notes.push(uni.note);
  if (program.note) notes.push(program.note);
  if (spec.note) notes.push(spec.note);
  notes.push(...TRANSPORT[state.transport].notes);
  if (state.merit && program.meritNote) notes.push(program.meritNote);

  const list = document.getElementById("notes");
  list.innerHTML = "";
  for (const text of notes) {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  }
}

// ---------- Главная функция: пересчитать и перерисовать всё ----------

function update() {
  fixUnavailable("program", PROGRAMS, "bachelor");
  fixUnavailable("housing", HOUSING);
  if (!currentProgram().specialties[state.specialty]) state.specialty = 0;

  renderChips("program", PROGRAMS);
  renderChips("housing", HOUSING);
  renderChips("transport", TRANSPORT);
  renderChips("lifestyle", LIFESTYLE);
  renderStay();
  renderProgramHint();
  renderSpecialties();
  renderPriceInfo();

  renderResult(calculate());
  document.getElementById("housing-hint").textContent = housingDetails().hint;
  renderNotes();
}

// ---------- Запуск ----------

function init() {
  const uniSelect = document.getElementById("university");
  for (const uni of UNIVERSITIES) {
    const option = document.createElement("option");
    option.value = uni.id;
    option.textContent = uni.name;
    uniSelect.appendChild(option);
  }
  uniSelect.addEventListener("change", () => {
    state.university = uniSelect.value;
    state.specialty = 0;
    update();
  });

  document.getElementById("specialty").addEventListener("change", (event) => {
    state.specialty = Number(event.target.value);
    update();
  });

  document.getElementById("merit").addEventListener("change", (event) => {
    state.merit = event.target.checked;
    update();
  });

  const notice = document.getElementById("top-notice");
  notice.textContent = "⚠️ " + TOP_NOTICE;
  notice.hidden = !TOP_NOTICE;

  update();
}

init();
