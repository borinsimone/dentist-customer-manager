# 🦷 Gestionale Studio Dentistico

Sistema di gestione completo per studi dentistici con funzionalità per pazienti, appuntamenti, preventivi e pagamenti.

## 🌐 Demo Live

👉 **[Apri l'applicazione](https://borinsimone.github.io/dentist-customer-manager/)**

### Credenziali Demo

- **Email**: `demo@studio.it`
- **Password**: `demo123`

## 🚀 Caratteristiche Implementate

### ✅ **Versione 0.1 - Demo Locale**

#### 🔐 **Autenticazione**

- Login semplificato con credenziali demo
- Struttura pronta per Supabase Auth
- Gestione sessione persistente

#### � **Dashboard Interattiva**

- **Statistiche in tempo reale**: Pazienti totali, appuntamenti oggi, prossimi appuntamenti
- **Appuntamenti del giorno**: Vista lista con dettagli completi
- **Prossimi appuntamenti**: Previsione 7 giorni
- **Quick Edit**: Clic sugli appuntamenti per modifica rapida tramite modal compatto
- **Pagamenti in sospeso**: Monitoraggio debiti pazienti

#### 👥 **Gestione Pazienti**

- **Anagrafica completa**: Nome, telefono, email
- **Ricerca in tempo reale**: Filtra per nome, telefono o email
- **Note cliniche**: Campo testo per informazioni mediche
- **Avatar colorati**: Identificazione visiva rapida
- **Modal CRUD**: Crea, modifica ed elimina pazienti
- **Validazione form**: Controlli su campi obbligatori

#### 📅 **Gestione Appuntamenti**

- **Due visualizzazioni**:
  - **Lista**: Appuntamenti ordinati cronologicamente con quick view al click
  - **Calendario**: Vista mensile completa con navigazione
- **Quick View Universale**:
  - Clic su appuntamento nella **lista** → modal di modifica rapida
  - Clic su mini-appuntamento nel **calendario** → modal di modifica rapida
- **Filtri per stato**: Programmato, Confermato, Completato, Annullato
- **Stati colorati**: Codifica visiva immediata
- **Dettagli completi**: Data, ora, durata, paziente, note
- **Modifica rapida**: Modal compatto con:
  - Cambio stato con pulsanti colorati
  - Modifica data/ora
  - Aggiunta note
  - Eliminazione integrata
- **Effetti hover interattivi**:
  - Icona occhio (👁️) e testo "Visualizza" su hover
  - Bordo colorato sinistro su card lista
  - Spostamento laterale delle card
  - Badge stato che si sposta per mostrare azione

#### � **Preventivi**

- **Creazione preventivi completa**: Multiple linee di trattamento
- **Stati preventivo**: Bozza, Inviato, Accettato, Rifiutato
- **Selezione da listino**: Auto-compilazione prezzi da database
- **Calcolo automatico**: Totali per riga e generale
- **Items builder**: Aggiungi/rimuovi trattamenti dinamicamente
- **Export PDF professionale**:
  - Header studio personalizzabile
  - Tabella trattamenti formattata
  - Totali evidenziati
  - Note e validità
- **Filtri per stato**: Vista organizzata per stato preventivo
- **Validità temporale**: Data di scadenza preventivo

#### 💳 **Pagamenti**

- **Registrazione pagamenti**: Collegamento con pazienti e preventivi
- **Metodi di pagamento**: Contanti, Carta, Bonifico, Altro
- **Collegamento preventivi**: Auto-compilazione da preventivo accettato
- **Statistiche finanziarie**:
  - Incassi giornalieri
  - Incassi mensili
  - Totale incassi
  - Numero transazioni
- **Filtri avanzati**: Per metodo e data
- **Badge colorati**: Identificazione visiva metodo pagamento
- **Note personalizzate**: Campo libero per annotazioni

#### ⚙️ **Impostazioni**

- **Listino prezzi trattamenti**:
  - CRUD completo prezzi
  - Categorie (Igiene, Conservativa, Endodonzia, Protesi, etc.)
  - Prezzi predefiniti per preventivi
- **Statistiche sistema**:
  - Contatori entità (pazienti, appuntamenti, etc.)
  - Informazioni storage
- **Backup dati**: Download completo in JSON
- **Informazioni applicazione**: Versione, framework, stato

#### �💾 **Storage & Dati**

- **localStorage**: Persistenza locale dei dati
- **Struttura pronta per Supabase**: Architettura facilmente migrabile
- **ID univoci**: Generazione automatica
- **Timestamp**: Tracciamento creazione/modifica
- **Backup/Restore**: Funzioni di esportazione/importazione

#### 🎨 **UI/UX**

- **Design professionale**: Pulito e adatto ad ambiente medico
- **SCSS modulare**: Stili organizzati e manutenibili
- **Responsive**: Adattabile a diverse risoluzioni
- **Animazioni smooth**: Transizioni fluide
- **Modal moderni**: Overlay con animazioni fadeIn/slideUp
- **Feedback visivi**: Hover, stati, colori codificati

### 🚧 **Da Implementare (Prossime Versioni)**

#### v0.3 - Documenti e Storico

- Upload documenti clinici (RX, foto, PDF)
- Galleria immagini per paziente
- Storico trattamenti completo
- Timeline clinica

#### v0.4 - Notifiche e Comunicazioni

- Reminder appuntamenti via email/SMS
- Conferme automatiche
- Sistema notifiche in-app

#### v0.5 - Migrazione Supabase

- Autenticazione Supabase Auth
- Database PostgreSQL
- Storage per file clinici
- Sync real-time
- Backup automatico cloud

## 🛠️ Tecnologie

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: SCSS Modules
- **Storage**: localStorage (temporaneo)
- **Backend futuro**: Supabase

## 📦 Installazione

```bash
# Clone del repository
git clone https://github.com/borinsimone/dentist-customer-manager.git
cd dentist-customer-manager

# Installa dipendenze
npm install

# Avvia in modalità sviluppo
npm run dev

# Build per produzione
npm run build

# Deploy su GitHub Pages
npm run deploy
```

## 🚀 Deploy

Il deploy su **GitHub Pages** avviene automaticamente ad ogni push sul branch `main` tramite GitHub Actions.

### Deploy Manuale

```bash
npm run deploy
```

### Configurazione GitHub Pages

1. Vai su **Settings** → **Pages**
2. Seleziona **Source**: GitHub Actions
3. Il workflow `.github/workflows/deploy.yml` gestirà il deploy automatico

- Creazione preventivi tseslint.configs.strictTypeChecked,

- Tracciamento pagamenti // Optionally, add this for stylistic rules

- Report finanziari tseslint.configs.stylisticTypeChecked,

4. **Impostazioni** // Other configs...

   - Listino prezzi trattamenti ],

   - Backup/Restore dati languageOptions: {

     parserOptions: {

## 🛠️ Tecnologie project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

- **Frontend**: React 19 + TypeScript },

- **Styling**: SCSS (moduli CSS) // other options...

- **Routing**: React Router v6 },

- **Build Tool**: Vite },

- **Storage**: localStorage (→ Supabase in futuro)])

````

## 📦 Installazione

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```bash

# Installa le dipendenze```js

npm install// eslint.config.js
## 🎯 Utilizzo

1. Avvia l'applicazione: `npm run dev`
2. Apri il browser su `http://localhost:5173`
3. Effettua il login con le credenziali demo:
   - **Email**: `demo@studio.it`
   - **Password**: `demo123`

### 📱 Funzionalità Principali

#### Dashboard
- Visualizza statistiche generali
- Clicca su un appuntamento per modificarlo rapidamente

#### Pazienti
- Clicca "➕ Aggiungi Paziente" per creare un nuovo paziente
- Usa la barra di ricerca per trovare pazienti
- Clicca su una card paziente per modificare i dati

#### Appuntamenti
- Passa tra vista **Lista** e **Calendario** con i pulsanti in alto
- **Vista Calendario**: Clicca su un mini-appuntamento per aprire il modal di modifica rapida
- **Vista Lista**: Clicca su un appuntamento per modificarlo
- Filtra per stato usando il dropdown
- Clicca "➕ Nuovo Appuntamento" per crearne uno

## 📁 Struttura del Progetto

```
src/
├── components/
│   ├── auth/              # Login e autenticazione
│   ├── common/            # Componenti riutilizzabili (Button, Card)
│   ├── dashboard/         # Dashboard + QuickEditAppointment
│   ├── patients/          # Gestione pazienti
│   ├── appointments/      # Gestione appuntamenti (lista + calendario)
│   └── layout/            # Layout principale e sidebar
├── contexts/
│   └── AuthContext.tsx    # Context per autenticazione
├── services/
│   └── storage.ts         # Gestione localStorage
├── styles/
│   ├── _variables.scss    # Variabili globali SCSS
│   └── global.scss        # Stili globali
├── types/
│   └── index.ts           # TypeScript interfaces
├── App.tsx                # Router principale
└── main.tsx               # Entry point
```

## 🎨 Design System

### Colori
- **Primary**: Blu (`#2563eb`) - Azioni principali
- **Success**: Verde (`#10b981`) - Conferme/completamenti
- **Warning**: Arancione (`#f59e0b`) - Attenzioni
- **Danger**: Rosso (`#ef4444`) - Eliminazioni/errori
- **Info**: Blu chiaro (`#3b82f6`) - Informazioni

### Componenti
- **Button**: Varianti primary, secondary, success, danger
- **Card**: Container con header/body/footer
- **Modal**: Overlay animato con fadeIn/slideUp
- **QuickEditAppointment**: Modal compatto per modifiche rapide

## 🔧 Configurazione

### Variabili SCSS Personalizzabili
Modifica `src/styles/_variables.scss` per personalizzare:
- Colori del tema
- Spaziature
- Border radius
- Ombre
- Dimensioni sidebar/header

## 📝 Note per lo Sviluppo

### Migrazione a Supabase
Il codice è strutturato per facilitare la migrazione:
1. Sostituisci `localStorage` con chiamate API Supabase in `src/services/storage.ts`
2. Implementa Supabase Auth in `src/contexts/AuthContext.tsx`
3. Configura Supabase Storage per upload documenti

### Aggiunta Nuove Funzionalità
1. Crea types in `src/types/index.ts`
2. Aggiungi service methods in `src/services/storage.ts`
3. Crea componente in `src/components/[nome-feature]/`
4. Aggiungi route in `src/App.tsx`
5. Aggiungi link nella sidebar in `src/components/layout/Layout.tsx`

## 🐛 Debug

Controlla la console del browser per eventuali errori.
I dati sono salvati in localStorage - usa gli strumenti di sviluppo del browser per ispezionarli.

## 📄 Licenza

MIT

## 👨‍💻 Autore

Simone Borin - [@borinsimone](https://github.com/borinsimone)

---

**Nota**: Questa è una versione demo con storage locale. Per uso in produzione, configura Supabase per database e storage cloud.

├── services/
│   └── storage.ts      # Servizi per localStorage/Supabase
├── styles/
│   ├── _variables.scss # Variabili SCSS
│   └── global.scss     # Stili globali
├── types/
│   └── index.ts        # Type definitions TypeScript
├── App.tsx             # App principale con routing
└── main.tsx            # Entry point
````

## 🔄 Migrazione a Supabase (Pianificata)

La struttura del codice è già predisposta per la migrazione a Supabase:

- **Storage Service**: Interfaccia astratta che può essere sostituita con Supabase SDK
- **Types**: Definiti per essere compatibili con le tabelle PostgreSQL
- **Auth Context**: Pronto per integrare Supabase Auth

### Passi per la migrazione:

1. Creare progetto Supabase
2. Configurare le tabelle (schema SQL già definito nei types)
3. Sostituire `services/storage.ts` con chiamate Supabase
4. Configurare Supabase Auth in `AuthContext.tsx`
5. Implementare Supabase Storage per documenti

## 📝 Note per lo Sviluppo

- I dati sono salvati nel `localStorage` del browser
- Al primo avvio vengono inizializzati prezzi demo per i trattamenti
- Per resettare i dati, cancella il localStorage dal browser
- L'applicazione è responsive ma ottimizzata per desktop

## 🎨 Personalizzazione

### Colori

Modifica le variabili in `src/styles/_variables.scss`:

```scss
$primary-color: #2563eb; // Blu primario
$success-color: #10b981; // Verde
$warning-color: #f59e0b; // Arancio
$danger-color: #ef4444; // Rosso
```

### Logo

Modifica l'emoji 🦷 nel file `Layout.tsx` e `Login.tsx` con il logo dello studio.

## 📄 Licenza

Progetto privato per uso interno dello studio dentistico.

---

**Versione**: 0.1.0 (Demo Locale)  
**Ultimo aggiornamento**: Novembre 2025
