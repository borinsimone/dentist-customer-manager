# Funzionalità Export PDF Preventivi

## Utilizzo

### Esportare un preventivo da lista

1. Nella pagina "Preventivi", ogni card mostra un pulsante "📄 Esporta PDF"
2. Cliccare il pulsante per generare e scaricare il PDF

### Esportare un preventivo dal modal

1. Aprire un preventivo esistente (click sulla card)
2. Nel modal, cliccare il pulsante "📄 Esporta PDF" nel footer
3. Il PDF verrà generato e scaricato automaticamente

## Contenuto del PDF

Il PDF generato include:

- **Header**: Nome studio, indirizzo e contatti
- **Info Preventivo**:
  - Nome paziente
  - Data emissione
  - Data scadenza
  - Stato preventivo
- **Tabella Trattamenti**:
  - Nome trattamento
  - Descrizione (se presente)
  - Quantità
  - Prezzo unitario
  - Totale per riga
- **Totale Generale**: Somma di tutti i trattamenti
- **Note**: Informazioni sulla validità e accettazione

## Personalizzazione

Per personalizzare i dati dello studio nel PDF, modificare i parametri in `exportQuoteToPDF()`:

```typescript
exportQuoteToPDF(quote, "Nome del tuo Studio");
```

Per modificare il template del PDF, editare il file:
`src/utils/pdfExport.ts`

## Tecnologia

- Libreria: **jsPDF**
- Formato: PDF generato lato client
- Compatibilità: Tutti i browser moderni
