# Pennywise - Gestione Condivisa delle Spese

![Pennywise Logo](public/logo.svg)

## Panoramica

Pennywise è un'applicazione progettata per semplificare la gestione condivisa di spese e liste della spesa, facilitando la vita a gruppi di utenti come coinquilini, amici o familiari. L'obiettivo è eliminare confusione e malintesi relativi a chi deve cosa, quando, e fornire statistiche e riepiloghi in tempo reale.

## Funzionalità Principali

### Gestione delle Spese

- **Registrazione Spese**: Possibilità di creare spese con descrizione, importo, categoria, data e valuta.
- **Divisione Spese**: Logiche di suddivisione tra i partecipanti, sia in modo equo sia personalizzato. Include chi ha effettivamente pagato e in quali proporzioni gli altri devono rimborsare.
- **Spese Ricorrenti**: Gestione automatica di affitto, bollette e altre spese ripetute (giornaliere, settimanali, mensili o annuali) con rigenerazione periodica.
- **Calcolo Saldi e Rimborsi**: Visualizzazione dei debiti/crediti individuali. Funzioni per registrare rimborsi e aggiornare i saldi di conseguenza.

### Liste della Spesa e Collaborazione

- **Liste della Spesa Collaborative**: Creazione e condivisione di liste spesa in cui gli utenti possono assegnarsi articoli da acquistare, aggiornare quantità, prezzi stimati e contrassegnarli come completati.
- **Notifiche in Tempo Reale**: Notifiche push (web e mobile) per inviti, modifiche alle spese, promemoria di pagamento, aggiornamenti di liste della spesa, richieste di accesso a un gruppo.
- **Gestione Gruppi**: Possibilità di creare gruppi privati o pubblici, con eventuale password, generare inviti o ricevere richieste di adesione.

### Analisi e Reportistica

- **Statistiche e Report**: Panoramiche mensili con riepiloghi e grafici su categorie, trend spese, e bilanci.

## Stack Tecnologico

### Frontend

**Web**:
- React + Vite + Redux + Material UI
- Comunicazione real-time con Supabase
- Notifiche push via servizio FCM o Supabase

**Mobile**:
- Flutter + Riverpod
- Distribuzione su Android e iOS
- Real-time e notifiche push analoghe alla versione web

### Backend

- **Supabase**: Database PostgreSQL, Realtime, Autenticazione, Storage, Edge Functions
- **NestJS**: Approccio ibrido per logiche personalizzate avanzate e futura scalabilità

### Database

- **PostgreSQL**: Mantenuto da Supabase, con estensioni uuid-ossp, pg_trgm, pgcrypto

### Strumenti di Notifica

- **Supabase**: Per le funzionalità di real-time e gestione WebSocket
- **Firebase Cloud Messaging**: Per notifiche push native su Android/iOS (se necessario)

### Audit Log
- Implementa una tabella "audit_log" e trigger associati per tracciare le modifiche (INSERT, UPDATE, DELETE) sulle tabelle principali.

## Roadmap di Sviluppo

### Fase Iniziale (MVP)

1. **Setup Supabase**:
   - Configurazione autenticazione
   - Database PostgreSQL
   - Storage base

2. **Frontend Web (React + Vite)**:
   - Implementazione login/registrazione (email, Google, Apple)
   - Creazione/gestione dei gruppi (privati o pubblici) e inviti
   - Aggiunta spese, divisione equa, visualizzazione elenco spese

3. **Mobile Flutter**:
   - Replica funzionalità chiave del web (login, gruppi, aggiunta spese)
   - Sincronizzazione in real-time

4. **Liste della Spesa**:
   - Creazione e condivisione di semplici liste

5. **Notifiche Base**:
   - Ricezione notifiche real-time su aggiunta spese e inviti gruppo

6. **Test e Deploy**:
   - Prototipo disponibile a gruppo ristretto di beta tester

### Fase di Consolidamento

1. **Spese Ricorrenti**:
   - Implementazione e generazione automatica delle spese ricorrenti (bollette, affitto)

2. **Report e Analisi**:
   - Cruscotto con statistiche mensili (per gruppo e per membro)

3. **Settlements/Rimborsi**:
   - Funzionalità di registrazione rimborsi e riconciliazione saldi

4. **UI/UX Avanzata**:
   - Miglioramenti di design, user flow e performance

5. **Notifiche Push Avanzate**:
   - Supporto a notifiche più granulari (reminder scadenze, liste spesa aggiornate, ecc.)

6. **Approccio Ibrido**:
   - Integrazione con un server NestJS per logiche specifiche (es. analisi dati più avanzata, integrazioni esterne)

### Fase Evolutiva

1. **Chat in tempo reale**:
   - Canali di comunicazione interni, con presence e commenti su spese

2. **Integrazioni con API Esterne**:
   - Ad esempio, import di transazioni bancarie

3. **Scalabilità e Ottimizzazione**:
   - Monitoraggio dei costi e passaggio graduale di parti del backend su infrastruttura personalizzata

4. **Internazionalizzazione Approfondita**:
   - Traduzioni in più lingue, personalizzazioni geografiche (formati valuta/data)

## Schema del Database

Il database è strutturato attorno a diverse entità chiave:

### Utenti e Gruppi
- **users**: Profili utente con preferenze e impostazioni
- **groups**: Gruppi di spesa condivisi
- **group_members**: Relazioni tra utenti e gruppi

### Gestione Spese
- **expenses**: Record delle spese registrate
- **expense_shares**: Divisione delle spese tra i membri
- **expense_categories**: Categorizzazione delle spese
- **recurring_expenses**: Configurazione delle spese periodiche
- **balances**: Saldi correnti tra coppie di utenti
- **settlements**: Registrazione dei rimborsi effettuati

### Liste della Spesa
- **shopping_lists**: Liste della spesa condivise
- **shopping_items**: Articoli all'interno delle liste

### Comunicazione
- **notifications**: Sistema centralizzato di notifiche
- **user_devices**: Registrazione dispositivi per notifiche push
- **group_invites**: Gestione degli inviti ai gruppi
- **group_join_requests**: Richieste di adesione ai gruppi

## Vantaggi Competitivi

1. **Esperienza Real-time**:
   - Tutte le modifiche sono sincronizzate istantaneamente tra tutti i partecipanti

2. **Facilità d'uso**:
   - Interfacce semplici ma complete, progettate per un'esperienza utente ottimale

3. **Approccio Cross-platform**:
   - Disponibile sia come applicazione web che mobile (Android e iOS)

4. **Architettura Scalabile**:
   - Partendo da un MVP con Supabase, l'app è progettata per crescere con l'aggiunta di NestJS

5. **Integrazione Unica**:
   - Combinazione di gestione spese e liste della spesa in un'unica soluzione

## Prossimi Passi

1. Finalizzazione del MVP con le funzionalità core
2. Test con un gruppo ristretto di utenti beta
3. Raccolta feedback e iterazione rapida
4. Implementazione progressiva delle funzionalità aggiuntive
5. Preparazione per il lancio pubblico

## Conclusione

Pennywise punta a risolvere in modo completo la sfida della gestione condivisa di spese e acquisti di gruppo, con un approccio focalizzato su:
- **Real-time**: tutto sincronizzato istantaneamente tra partecipanti
- **Facilità d'uso**: interfacce semplici, ma complete
- **Scalabilità**: partendo da un MVP con Supabase, pronto a crescere con NestJS e altre integrazioni

La roadmap definisce un percorso di sviluppo iterativo, con un MVP rapido e funzionalità aggiuntive in fasi successive per soddisfare le esigenze di un pubblico sempre più ampio.

## Appendice: Struttura Dettagliata del Database

### Tabelle Utenti e Gruppi

#### users
Estensione della tabella nativa `auth.users` di Supabase.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria, riferimento a auth.users |
| username | TEXT | Username univoco |
| display_name | TEXT | Nome visualizzato nell'app |
| avatar_url | TEXT | URL dell'immagine profilo |
| email | TEXT | Email univoca |
| default_currency | TEXT | Valuta predefinita (default: 'EUR') |
| language | TEXT | Lingua preferita (default: 'it') |
| created_at | TIMESTAMPTZ | Data creazione |
| updated_at | TIMESTAMPTZ | Data ultimo aggiornamento |

#### groups
Gruppi di spesa condivisi.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria |
| name | TEXT | Nome del gruppo |
| description | TEXT | Descrizione |
| avatar_url | TEXT | URL immagine del gruppo |
| default_currency | TEXT | Valuta predefinita (default: 'EUR') |
| group_identifier | TEXT | Identificativo univoco del gruppo |
| numeric_suffix | INTEGER | Suffisso numerico per l'identificativo |
| password | TEXT | Password opzionale |
| privacy_type | TEXT | 'public' o 'private' |
| requires_password | BOOLEAN | Se richiede password per l'accesso |
| created_by | UUID | Riferimento all'utente creatore |
| created_at | TIMESTAMPTZ | Data creazione |
| updated_at | TIMESTAMPTZ | Data ultimo aggiornamento |

#### group_members
Relazioni tra utenti e gruppi.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria |
| group_id | UUID | Riferimento al gruppo |
| user_id | UUID | Riferimento all'utente |
| role | TEXT | 'admin' o 'member' |
| joined_at | TIMESTAMPTZ | Data di adesione |

### Tabelle per Gestione Spese

#### expense_categories
Categorie per classificare le spese.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria |
| name | TEXT | Nome categoria |
| color | TEXT | Colore associato |
| icon | TEXT | Icona associata |
| group_id | UUID | Riferimento al gruppo (NULL se globale) |
| global | BOOLEAN | Se è una categoria globale |
| created_at | TIMESTAMPTZ | Data creazione |

### Funzionalità Database Avanzate

Il database include diverse funzioni e trigger personalizzati per implementare la logica di business:

#### Funzioni Principali
- `generate_recurring_expenses()`: Genera automaticamente spese dalle configurazioni ricorrenti
- `calculate_balance()`: Calcola il saldo tra due utenti in un gruppo
- `update_all_balances()`: Aggiorna tutti i saldi in un gruppo
- `register_settlement()`: Registra un rimborso e aggiorna i saldi
- `generate_monthly_report()`: Crea report mensili per un gruppo
- `create_group_invite()`: Genera inviti per gruppi
- `use_group_invite()`: Processa l'utilizzo di un invito
- `request_join_group()`: Gestisce richieste di adesione
- `respond_to_join_request()`: Processa risposte alle richieste

#### Trigger Automatici
- Trigger per aggiornamento timestamp `updated_at`
- Trigger per generazione automatica di identificativi gruppo
- Trigger per sincronizzazione utenti da `auth.users`
- Trigger per aggiornamento saldi dopo inserimento o modifica spese

#### Sicurezza Row Level Security (RLS)
Tutte le tabelle utilizzano politiche RLS di Supabase per garantire:
- Accesso degli utenti solo ai propri dati personali
- Accesso ai dati di gruppo solo per i membri di quel gruppo
- Autorizzazioni granulari per azioni amministrative (solo admin)
- Protezione per operazioni sensibili come inviti e approvazioni