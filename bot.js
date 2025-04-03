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
      bot.sendMessage(chatId, "Ecco la lista dei comandi che puoi utilizzare:\n/Races: restituisce il calendario delle gare del campionato 2025\n/Driver: restituisce la lista dei piloti che partecipano al campionato 2025\n/Constructor: restituisce la lista dei costruttori che partecipano al campionato 2025\n/DriverStanding: restituisce la classifica piloti attuale nel campionato 2025\n/ConstructorStanding: restituisce la classifica costruttori attuale nel campionato 2025\n/Results: Restituisce i risultati delle gare del campionato 2025")
   }

   if (text === "/Races") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/races.json");
         
         if (response.ok === false) {
            return bot.sendMessage("Errore nel caricamento dell'API");
         }

         const data = await response.json();

         const races = data.MRData.RaceTable.Races;

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

   if (text === "/Driver") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/drivers.json");

         if (response.ok === false) {
            return bot.sendMessage("Errore nel caricamento dell'API");
         }

         const data = await response.json();

         const drivers = data.MRData.DriverTable.Drivers;

         if (drivers.length === 0) {
            return bot.sendMessage(chatId, "Nessun pilota trovato");
         }

         let driverList = "🏆 Lista dei Piloti:\n";
         drivers.forEach((driver) => {
            driverList += `${driver.givenName} ${driver.familyName} (${driver.permanentNumber}) ${driver.nationality}\n`;
         });

         bot.sendMessage(chatId, driverList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero dei piloti");
         console.error(error);
      }
   }

   if (text === "/Constructor") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/constructors.json/");

         if (response.ok === false) {
            return bot.sendMessage("Errore nel caricamento dell'API");
         }

         const data = await response.json();

         const constructors = data.MRData.ConstructorTable.Constructors;

         if (constructors.length === 0) {
            return bot.sendMessage(chatId, "Nessuna squadra trovata");
         }

         let constructorList = "🏎️ Lista delle Squadre:\n";
         constructors.forEach((constructor) => {
            constructorList += `${constructor.name} - ${constructor.nationality}\n`;
         });

         bot.sendMessage(chatId, constructorList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero dei piloti");
         console.error(error);
      }
   }

   if (text === "/DriverStanding") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/driverstandings.json/");

         if(response.ok === false) {
            return bot.sendMessage(chatId, "Nessuna classifica piloti trovata");
         }

         const data = await response.json();
         
         const standingsLists = data.MRData.StandingsTable.StandingsLists;

         if (standingsLists.length === 0){
            return bot.sendMessage(chatId, "Classifica piloti non trovata");
         }

         const driverStandings = standingsLists[0].DriverStandings;

         let driverStandingsList = "🏆 Classifica Piloti 2025:\n";
         driverStandings.forEach((driver) => {
            driverStandingsList += `${driver.position || "20"}: ${driver.Driver.givenName} ${driver.Driver.familyName} - Punti: ${driver.points} - Vittorie: ${driver.wins}\n`;
         });

         bot.sendMessage(chatId, driverStandingsList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero della classifica piloti");
         console.error(error);
      }
   }

   if (text === "/ConstructorStanding") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json/");

         if(response.ok === false) {
            return bot.sendMessage(chatId, "Nessuna classifica costruttori trovata");
         }

         const data = await response.json();
         
         const standingsLists = data.MRData.StandingsTable.StandingsLists;

         if (standingsLists.length === 0){
            return bot.sendMessage(chatId, "Classifica costruttori non trovata");
         }

         const construcotorStandings = standingsLists[0].ConstructorStandings;

         let constructorStandingsList = "🏎️ Classifica Costruttori 2025:\n";
         construcotorStandings.forEach((construcotor) => {
            constructorStandingsList += `${construcotor.position}: ${construcotor.Constructor.name} - Punti: ${construcotor.points} - Vittorie: ${construcotor.wins}\n`;
         });

         bot.sendMessage(chatId, constructorStandingsList);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero della classifica costruttori");
         console.error(error);
      }
   }

   if (text === "/Results") {
      try {
         const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/results.json");
   
         if (response.ok === false) {
            return bot.sendMessage(chatId, "Nessun risultato trovato");
         }
   
         const data = await response.json();
         const races = data.MRData.RaceTable.Races;
   
         if (races.length === 0) {
            return bot.sendMessage(chatId, "Nessuna gara trovata");
         }
   
         let message = "🏁 Risultati delle gare 2025:\n\n";
   
         races.forEach((race) => {
            message += `🏆 ${race.raceName}:\n`;
            race.Results.forEach((result) => {
               const driver = result.Driver;
               const constructor = result.Constructor;
               message += `🔹 ${result.position}: - ${driver.givenName} ${driver.familyName} (${constructor.name}) - Punti: ${result.points}\n`;
            });
            message += "\n";
         });
   
         bot.sendMessage(chatId, message);
      } catch (error) {
         bot.sendMessage(chatId, "Errore nel recupero dei risultati di gara");
         console.error(error);
      }
   }   

});