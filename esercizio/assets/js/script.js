// Mini-libreria — Settimana VII Giorno II
// Estensione: persistenza in localStorage (i libri sopravvivono al refresh).


// === Classi ===

class Libro {
  static contatore = 0;

  constructor(titolo, autore, anno) {
    this.id = ++Libro.contatore;
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
    this.letto = false;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    return "cartaceo";
  }
}

class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, dimensioneMb) {
    super(titolo, autore, anno);
    this.dimensioneMb = dimensioneMb;
  }

  formato() {
    return `digitale (${this.dimensioneMb} MB)`;
  }
}


// === Persistenza ===

const STORAGE_KEY = "libri";

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const stringa = localStorage.getItem(STORAGE_KEY);
  if (!stringa) return [];

  const arrayDati = JSON.parse(stringa);

  // Ri-istanziamo: JSON.parse restituisce oggetti puri, non Libro/LibroDigitale.
  // Per riavere i metodi (segnaComeLetto, formato), ricreiamo le istanze.
  return arrayDati.map(d => {
    let l;
    if (d.dimensioneMb !== undefined) {
      l = new LibroDigitale(d.titolo, d.autore, d.anno, d.dimensioneMb);
    } else {
      l = new Libro(d.titolo, d.autore, d.anno);
    }
    l.id = d.id;
    l.letto = d.letto;
    if (d.id > Libro.contatore) Libro.contatore = d.id;  // ripristina il contatore
    return l;
  });
}


// === Stato ===

let libri = caricaLibri();


// === Render ===

function renderLibri() {
  const html = libri.map(l => `
    <li class="${l.letto ? 'letto' : ''}" data-id="${l.id}">
      <div class="info">
        <span class="titolo">${l.titolo}</span>
        <span class="badge-formato">${l.formato()}</span>
        <div class="meta">${l.autore} — ${l.anno}</div>
      </div>
      <div class="azioni">
        ${l.letto
          ? '<span>✓ letto</span> <button data-azione="rimuovi">Rimuovi</button>'
          : '<button data-azione="leggi">Segna come letto</button> <button data-azione="rimuovi">Rimuovi</button>'}
      </div>
    </li>
  `).join("");

  document.getElementById("lista-libri").innerHTML = html;
  document.getElementById("contatore").textContent = libri.length;
}


// === Eventi ===

document.getElementById("formato").addEventListener("change", (e) => {
  const campo = document.getElementById("campo-dimensione");
  if (e.target.value === "digitale") {
    campo.removeAttribute("hidden");
  } else {
    campo.setAttribute("hidden", "");
  }
});

document.getElementById("aggiungi-libro").addEventListener("submit", (e) => {
  e.preventDefault();

  const titolo = document.getElementById("titolo").value;
  const autore = document.getElementById("autore").value;
  const anno = parseInt(document.getElementById("anno").value);
  const formato = document.getElementById("formato").value;

  let nuovo;
  if (formato === "digitale") {
    const dim = parseFloat(document.getElementById("dimensione").value) || 0;
    nuovo = new LibroDigitale(titolo, autore, anno, dim);
  } else {
    nuovo = new Libro(titolo, autore, anno);
  }

  libri.push(nuovo);
  salvaLibri();
  renderLibri();
  e.target.reset();
  document.getElementById("campo-dimensione").setAttribute("hidden", "");
});

document.getElementById("lista-libri").addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return;

  const card = bottone.closest("li");
  const id = parseInt(card.dataset.id);
  const azione = bottone.dataset.azione;

  if (azione === "leggi") {
    const libro = libri.find(l => l.id === id);
    if (libro) libro.segnaComeLetto();
  } else if (azione === "rimuovi") {
    libri = libri.filter(l => l.id !== id);
  }

  salvaLibri();
  renderLibri();
});

// Bottone "Svuota tutto"
document.getElementById("svuota-tutto").addEventListener("click", () => {
  libri = [];
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();
});


// === Render iniziale (con dati da localStorage se presenti) ===
renderLibri();
