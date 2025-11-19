# 🚀 GitHub Pages Setup

Guida rapida per configurare il deploy su GitHub Pages.

## 📋 Prerequisiti

- Repository GitHub creato
- Git configurato localmente
- Node.js installato

## 🔧 Configurazione Iniziale

### 1. Collega il repository remoto (se non già fatto)

```bash
git remote add origin https://github.com/borinsimone/dentist-customer-manager.git
```

### 2. Verifica la configurazione

Il progetto è già configurato con:

- ✅ `vite.config.ts` con base path `/dentist-customer-manager/`
- ✅ Script `deploy` in `package.json`
- ✅ Workflow GitHub Actions in `.github/workflows/deploy.yml`
- ✅ File `.nojekyll` per evitare problemi con Jekyll

## 🌐 Attivazione GitHub Pages

### Opzione A: Deploy Automatico (Consigliato)

1. **Push del codice su GitHub**:

   ```bash
   git add .
   git commit -m "Setup GitHub Pages"
   git push -u origin main
   ```

2. **Attiva GitHub Pages**:

   - Vai su **Settings** del repository
   - Clicca su **Pages** nel menu laterale
   - In **Source**, seleziona: **GitHub Actions**
   - Il workflow partirà automaticamente

3. **Aspetta il deploy** (~2-3 minuti):
   - Vai su **Actions** per vedere il progresso
   - Una volta completato, l'app sarà disponibile su:
     ```
     https://borinsimone.github.io/dentist-customer-manager/
     ```

### Opzione B: Deploy Manuale

```bash
# Build e deploy in un comando
npm run deploy
```

Questo script:

1. Compila il progetto (`npm run build`)
2. Crea il branch `gh-pages`
3. Pusha i file compilati su GitHub

**Nota**: Con il deploy manuale devi andare su **Settings** → **Pages** e selezionare:

- **Source**: Deploy from a branch
- **Branch**: `gh-pages` / `/ (root)`

## 🔄 Aggiornamenti Futuri

### Con GitHub Actions (Automatico)

Ogni volta che fai push su `main`, il sito si aggiorna automaticamente:

```bash
git add .
git commit -m "Aggiornamento funzionalità"
git push
```

### Con Deploy Manuale

```bash
npm run deploy
```

## ✅ Verifica Deploy

1. **Controlla lo stato**:

   - Vai su **Actions** nel repository
   - Verifica che il workflow sia completato ✅

2. **Apri l'applicazione**:

   - Vai su **Settings** → **Pages**
   - Clicca sul link "Visit site"
   - Oppure apri: `https://borinsimone.github.io/dentist-customer-manager/`

3. **Test dell'app**:
   - Login con: `demo@studio.it` / `demo123`
   - Verifica che tutte le pagine funzionino
   - Controlla che gli stili siano caricati correttamente

## 🐛 Troubleshooting

### Pagina 404

- Verifica che il base path in `vite.config.ts` sia corretto
- Controlla che il nome del repository sia esatto
- Aspetta qualche minuto per la propagazione

### Stili non caricati

- Verifica che il file `.nojekyll` sia presente in `public/`
- Controlla il base path in `vite.config.ts`

### Workflow fallito

- Vai su **Actions** e leggi i log dell'errore
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla che il build locale funzioni: `npm run build`

## 🔒 Custom Domain (Opzionale)

Per usare un dominio personalizzato:

1. Crea un file `CNAME` in `public/` con il tuo dominio:

   ```
   studio.tuodominio.it
   ```

2. Configura i DNS del dominio:

   - Tipo: `CNAME`
   - Nome: `studio` (o `www`)
   - Valore: `borinsimone.github.io`

3. Vai su **Settings** → **Pages** → **Custom domain**
4. Inserisci il dominio e salva

## 📚 Risorse Utili

- [Documentazione GitHub Pages](https://docs.github.com/en/pages)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

✨ **Il tuo gestionale è ora online e accessibile da qualsiasi dispositivo!**
