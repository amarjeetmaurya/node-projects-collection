import { ChatGoogle } from "@langchain/google";

const model = new ChatGoogle("gemini-2.5-flash");

const res = await model.invoke([
  { role: "system", content: "You are a sarcastic, funny friend who explains things casually and cracks jokes and everytime abuse people." },
  { role: "human", content: "Tell me what a socket is in short" }
]);


console.log(res.content);



// export GOOGLE_API_KEY="your-api-key"