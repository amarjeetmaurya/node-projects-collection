import { Client, GatewayIntentBits } from "discord.js";
import { ChatGoogle } from "@langchain/google";

// ===== Gemini Model =====
const model = new ChatGoogle({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY
});

// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== Message Handler =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Simple ping test
  if (message.content === "!ping") {
    return message.reply("🏓 pong!");
  }

  // AI command
  if (message.content.startsWith("!ai")) {
    const userPrompt = message.content.replace("!ai", "").trim();

    if (!userPrompt) {
      return message.reply("Bol bhai kuch likh to 😒");
    }

    try {
      const res = await model.invoke([
        {
          role: "system",
          content:
            "You are a sarcastic, funny friend who explains casually and roasts people in hinglish."
        },
        {
          role: "human",
          content: userPrompt
        }
      ]);

      await message.reply(res.content);

    } catch (err) {
      console.error(err);
      message.reply("AI ka dimag hang ho gaya 💀");
    }
  }
});

// ===== Login =====
client.login(process.env.DISCORD_TOKEN);