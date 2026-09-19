// När bannern "Ny version" ska synas. Ren logik utan DOM, så den går att testa.
//
// Synlig = en ny version finns OCH bannern inte är undertryckt (t.ex. medan en
// övning pågår) OCH användaren inte tryckt på "Senare". `onChange(visible)`
// anropas bara när synligheten faktiskt ändras.
export function createUpdateState(onChange) {
  let available = false;
  let suppressed = false;
  let dismissed = false;

  const isVisible = () => available && !suppressed && !dismissed;

  function update(change) {
    const before = isVisible();
    change();
    const after = isVisible();
    if (after !== before) onChange?.(after);
  }

  return {
    get visible() {
      return isVisible();
    },
    setAvailable() {
      update(() => {
        available = true;
      });
    },
    setSuppressed(value) {
      update(() => {
        suppressed = Boolean(value);
      });
    },
    dismiss() {
      update(() => {
        dismissed = true;
      });
    },
  };
}
