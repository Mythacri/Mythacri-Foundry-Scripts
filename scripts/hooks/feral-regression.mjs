/**
 * Add a Feral Regression meter to character sheets.
 * @param {ActorSheet} sheet      The character sheet.
 * @param {HTMLElement} html      The html element.
 */
export default (sheet, [html]) => {
  const enabled = sheet.document.getFlag("dnd5e", "feralRegression");
  if (!enabled) return;

  let value = sheet.document.getFlag("mythacri-scripts", "feralRegression");
  if (!value) value = 0;

  const negative = value < 0 ? Math.abs(value) : 0;
  const negPct = Math.round(negative / 5 * 100) + "%";
  const positive = value > 0 ? value : 0;
  const posPct = Math.round(positive / 5 * 100) + "%";

  const css = "meter feral-regression progress";
  const attributes = Object.entries({
    role: "meter",
    "aria-valuemin": "0",
    "aria-valuemax": "5",
  }).map(([k, v]) => `${k}="${v}"`).join(" ");

  const template = `
  <div class="meter-group feral-regression">
    <div class="label roboto-condensed-upper">
      <span>${game.i18n.localize("MYTHACRI.FlagsFeralRegression")}</span>
    </div>
    <div class="meters">
      <div class="${css} negative" ${attributes} aria-valuenow="${negative}" style="--bar-percentage: ${negPct}">
        <div class="label">${negative ? "&minus;" + negative : ""}</div>
      </div>
      <div class="${css} positive" ${attributes} aria-valuenow="${positive}" style="--bar-percentage: ${posPct}">
        <div class="label">${positive ? "&plus;" + positive : ""}</div>
      </div>
    </div>
  </div>`;

  const div = document.createElement("DIV");
  div.innerHTML = template;

  div.querySelectorAll(".meters > .meter").forEach(element => element.addEventListener("click", event => {
    const t = event.currentTarget;
    const delta = t.classList.contains("positive") ? 1 : -1;
    return sheet.document.setFlag("mythacri-scripts", "feralRegression", Math.clamp(value + delta, -5, 5));
  }));

  html.querySelector(".meter-group").parentElement.insertAdjacentElement("beforeend", div.firstElementChild);
};
