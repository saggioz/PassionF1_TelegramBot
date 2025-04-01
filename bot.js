const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const conf = JSON.parse(fs.readFileSync('conf.json'));
const token = conf.key;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
   const chatId = msg.chat.id;
   const text = msg.text;

   if (text === "/start") {
      bot.sendMessage(chatId, "Ciao sono PassionF1Bot, il bot che ti tiene aggiornato su tutti i risultati e statistische della Formula 1, usa il comando /help per visualizzare tutti i miei comandi");
   }

   if (text === "/help") {
      bot.sendMessage(chatId, "Ecco la lista dei comandi che puoi utilizzare:\n/races: restituisce le gare del campionato 2025\n/driver: restituisce la lista dei piloti del campionato 2025\n/constructor: restituisce la lista dei costruttori del campionato 2025\n/driverchampionship: restituisce la classifica dei piloti nel campionato 2025\n/constructor championship: restituisce la classifica dei costruttori nel campionato 2025")
   }

   if (text === "/races") {
      try {
         const response1 = await fetch("https://api.jolpi.ca/ergast/f1/?limit=30&offset=1110");
         const response2 = await fetch("https://api.jolpi.ca/ergast/f1/?limit=30&offset=1140");
         
         if (response1.ok === false || response2.ok === false) {
            return bot.sendMessage("Errore nel caricamento dell'API");
         }

         const data1 = await response1.json();
         const data2 = await response2.json();

         const races1 = data1.MRData.RaceTable.Races.slice(15);
         const races2 = data2.MRData.RaceTable.Races;
         const races = [...races1, ...races2];

         if (races.length === 0) {
            return bot.sendMessage(chatId, "Nessuna gara trovata");
         }

         let raceList = "📅 Prossime gare F1:\n";
         races.forEach((race) => {
            raceList += `🏁 ${race.raceName} - ${race.Circuit.circuitName} (${race.date})\n`;
         });

         bot.sendMessage(chatId, raceList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero delle gare");
         console.error(error);
      }
   }

   if (text === "/driver") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2024/drivers/");

         if (response.ok === false) {
            return bot.sendMessage("Errore nel caricamento dell'API");
         }

         const data = await response.json();

         const drivers = data.MRData.DriverTable.Drivers;

         if (drivers.length === 0) {
            return bot.sendMessage(chatId, "Nessun pilota trovato");
         }

         let driverList = "🏎️ Piloti in F1:\n";
         drivers.forEach((driver) => {
            driverList += `${driver.givenName} ${driver.familyName} (${driver.permanentNumber}) ${driver.nationality}\n`;
         });

         bot.sendMessage(chatId, driverList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero dei piloti");
         console.error(error);
      }
   }

   if (text === "/constructor") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2024/constructors/");

         if (response.ok === false) {
            return bot.sendMessage("Errore nel caricamento dell'API");
         }

         const data = await response.json();

         const constructors = data.MRData.ConstructorTable.Constructors;

         if (constructors.length === 0) {
            return bot.sendMessage(chatId, "Nessuna squadra trovata");
         }

         let constructorList = "🏎️ Squadre in F1:\n";
         constructors.forEach((constructor) => {
            constructorList += `${constructor.name} - ${constructor.nationality}\n`;
         });

         bot.sendMessage(chatId, constructorList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero dei piloti");
         console.error(error);
      }
   }
});