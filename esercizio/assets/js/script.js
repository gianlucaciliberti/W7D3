
// Bottone "Svuota tutto"
document.getElementById("svuota-tutto").addEventListener("click", () => {
    libri = [];
    localStorage.removeItem(STORAGE_KEY);
    renderLibri();
});


// === Render iniziale (con dati da localStorage se presenti) ===
//renderLibri();

function mostraSpinner() {
    const spinner = document.getElementById("spinner");
    const errore = document.getElementById("errore");

    spinner.removeAttribute("hidden");

    errore.setAttribute("hidden", "");
    errore.textContent = "";
}

function nascondiSpinner() {
    const spinner = document.getElementById("spinner");
    spinner.setAttribute("hidden", "");
}

function mostraErrore(msg) {
    const errore = document.getElementById("errore");

    errore.textContent = msg;
    errore.removeAttribute("hidden");
}

// === Stato ===
let libri = caricaLibri();

// === Persistenza ===

const STORAGE_KEY = "libri";

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const stringa = localStorage.getItem(STORAGE_KEY);
  if (!stringa) return [];

  const arrayDati = JSON.parse(stringa);

  
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


//FUNZIONE RICERCA

function cerca(query) {
    query = query.trim();

    if (query.length < 3) {
        document.getElementById("risultati").innerHTML = "";
        return;
    }

    mostraSpinner();
    
    const query = input.value.trim();
    if (query.length < 3) return;

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore HTTP");
            }
            return response.json();
        })
        .then(dati => {
            nascondiSpinner();

            // qui lavorerai con dati.docs
            console.log(dati.docs);
        })
        .catch(err => {
            nascondiSpinner();
            mostraErrore("Errore durante la ricerca");
        });
}


function renderRisultati(docs) {
  const lista = document.getElementById("risultati");

  if (!docs || docs.length === 0) {
    lista.innerHTML = "<li>Nessun risultato</li>";
    return;
  }

  const html = docs
    .map(d => {
      const titolo = d.title;
      const autore = d.author_name ? d.author_name[0] : "Sconosciuto";
      const anno = d.first_publish_year ? d.first_publish_year : "?";

      return `
        <li>
          <div class="info">
            <span class="titolo">${titolo}</span>
            <div class="meta">${autore} — ${anno}</div>
          </div>

          <button
            data-titolo="${titolo}"
            data-autore="${autore}"
            data-anno="${anno}"
          >
            Aggiungi
          </button>
        </li>
      `;
    })
    .join("");

  lista.innerHTML = html;
}

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

