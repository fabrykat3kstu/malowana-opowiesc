import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicjalizacja Klienta Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Zapamiętywany stan kredytów w pamięci podręcznej serwera (na potrzeby Sandbox SaaS)
let userCredits = 0; 

// API Kredytów i Płatności
app.get("/api/credits", (_req, res) => {
  res.json({ credits: userCredits });
});

app.post("/api/credits/add", (req, res) => {
  const { amount } = req.body;
  userCredits += (amount || 1);
  res.json({ success: true, credits: userCredits });
});

app.post("/api/credits/consume", (_req, res) => {
  if (userCredits > 0) {
    userCredits -= 1;
    res.json({ success: true, credits: userCredits });
  } else {
    res.status(402).json({ error: "Brak dostępnych kredytów." });
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { packageType, childName, userEmail } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Brak klucza STRIPE_SECRET_KEY w zmiennych środowiskowych!");
      return res.status(500).json({ error: "Brak skonfigurowanego klucza STRIPE_SECRET_KEY" });
    }

    let amountInGrosze = 1200;
    if (packageType === '3_stories') amountInGrosze = 2900;
    if (packageType === '6_stories') amountInGrosze = 4900;
    if (packageType === '12_stories') amountInGrosze = 8900;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Pakiet Bajek - Malowana Opowieść`,
            description: `Spersonalizowana kolorowanka dla: ${childName || 'dziecka'}`,
          },
          unit_amount: amountInGrosze,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/?payment=success&package=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Błąd tworzenia sesji Stripe:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 1: Gemini 3.5 Flash - Generowanie 15 rozdziałów i promptów w formacie JSON
app.post("/api/generate-story", async (req, res) => {
  try {
    const { childName, childGender, childAge, archetype, world, moral } = req.body;

    if (!childName) {
      return res.status(400).json({ error: "Imię dziecka jest wymagane." });
    }

    const systemPrompt = `You are a professional children's book writer and coloring book illustrator designer.
Your task is to generate a personalized, 15-page storybook and translate the scenes into highly optimized image generation prompts for a coloring book creator.

Rules for the Story:
1. The story MUST have exactly 15 pages (indexed from 1 to 15).
2. Each page must contain 2 or 3 sentences in Polish appropriate for a child aged ${childAge}. The tone should be warm, magical, and engaging.
3. The protagonist's name is "${childName}" (who is a ${childGender === 'boy' ? 'boy' : 'girl'} styled as a ${archetype}). Keep it consistent throughout all 15 pages.
4. The story should follow an exciting narrative from page 1 to 15 set in the world of "${world}".
5. The moral/lesson of the story must be "${moral}" and is integrated smoothly by the end of the story.

Rules for the Image Prompts (Strict Character Consistency):
1. Character Visual Description Anchor: You must define ONE stable, highly precise visual description of the protagonist character based on the archetype "${archetype}" and gender "${childGender}". You must REPLICATE this exact character description text string verbatim in all 15 prompts (do not change or modify it across pages to ensure character consistency).
Use the following strict visual description for the character:
${
  archetype === "Dinozaur" 
    ? `"a cute 5-year-old chibi child with big round eyes, wearing a friendly green plush dinosaur onesie with soft rounded back-spikes and a plush tail"`
    : archetype === "Syrenka" 
    ? `"a cute 5-year-old chibi mermaid girl with big round eyes, soft wavy hair with a small starfish accessory, and a shiny fish tail"`
    : archetype === "Dzielny Rycerz" 
    ? `"a cute 5-year-old chibi knight child with big round eyes, wearing a simple toy helmet with a feather and a small wooden shield"`
    : archetype === "Astronauta"
    ? `"a cute 5-year-old chibi astronaut child with big round eyes, wearing a simple white space suit with friendly patches and a round bubble space helmet"`
    : archetype === "Młody Czarodziej"
    ? `"a cute 5-year-old chibi wizard child with big round eyes, wearing a starry pointed wizard hat and holding a small wooden wand"`
    : archetype === "Strażak"
    ? `"a cute 5-year-old chibi firefighter child with big round eyes, wearing a bright firefighter jacket and a simple yellow toy fire helmet"`
    : `"a cute 5-year-old chibi child styled as ${archetype} with big round eyes"`
}

2. For each page, generate a highly detailed and specific English prompt for an Image Generator specializing in professional, rich kids' coloring book illustrations.
The prompt MUST strictly follow this pattern:
"Beautiful highly detailed coloring page for kids, detailed vector line art of [SPECIFIC SCENE WITH MANY ENGAGING ENVIRONMENT DETAILS], featuring [THE EXACT REPLICATED CHARACTER DESCRIPTION GOES HERE]. Intricate background elements, chibi style, cute toddler character, simple line art, clean outlines, friendly smile, no extra limbs, no disfigured face, no dark shading, vector coloring book page, ar 3:4"

Crucial Visual Quality Guidelines:
1. Environment Anchoring: Every single one of the 15 generated image prompts must explicitly include rich, detailed background/environmental elements characteristic of the selected world: "${world}". You must anchor the character and the scene in this environment on every page (e.g., if the world is "Podwodny Pałac", you must explicitly add details like: 'underwater scene, swimming fish, sea corals, floating water bubbles, aquatic plants' to the prompt on every page. If the world is "Tajemniczy Las", you must explicitly add details like: 'enchanted mystic forest, giant friendly hollow trees, beautiful wild flowers, tiny lanterns hanging from branches' to the prompt on every page. If the world is "Kosmiczna Stacja", you must add: 'futuristic space station, viewport showing planet stars, friendly small helper robots').
2. Strictly enforce Monochrome Line Art: The coloring page must be strictly pure black and white. There must be absolutely no colors, no grayscale tones, no shading, no shadows, no digital lighting effects, no colored glows, and no gradients. Ensure the instruction in the prompt uses words like: 'strictly pure black and white coloring page, completely colorless, no color effects, no colored glows, zero gradients, zero shading, plain solid white background, monochrome line art, clean ink drawing, bold black outlines'.
3. Strictly block any text or letters: Ensure there are absolutely no words, names, letters, titles, or characters written anywhere on the page or in the background. Do NOT include the child's actual name inside the image prompt text itself (to prevent glitched letters and writing).`;

    const userQuery = `Stwórz fascynującą, spójną 15-stronicową bajkę o imieniu: ${childName}, płeć: ${childGender === 'boy' ? 'chłopiec' : 'dziewczynka'}, wiek: ${childAge} lat. Archetyp: ${archetype}, Świat: ${world}, Morał: ${moral}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Tytuł bajki w języku polskim" },
            pages: {
              type: Type.ARRAY,
              description: "Dokładnie 15 kolejno ponumerowanych stron ze spójnym tekstem fabularnym i dedykowanym promptem.",
              items: {
                type: Type.OBJECT,
                properties: {
                  page_number: { type: Type.INTEGER, description: "Numer strony od 1 do 15" },
                  story_text: { type: Type.STRING, description: "Ciepła, 2-3 zdaniowa opowieść dla dziecka po polsku" },
                  image_prompt: { type: Type.STRING, description: "Dokładny angielski prompt graficzny do kolorowanki" }
                },
                required: ["page_number", "story_text", "image_prompt"]
              }
            }
          },
          required: ["title", "pages"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error generating story:", error);
    res.status(500).json({ error: error.message || "Błąd podczas generowania opowieści." });
  }
});

// Endpoint 2: Replicate (model Flux Schnell) - Generowanie obrazków wektorowych
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, seed, predictionId } = req.body;
    
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return res.status(500).json({ error: "Brak tokenu REPLICATE_API_TOKEN w konfiguracji serwera." });
    }

    let currentPrediction;
    let predictionIdToPoll = predictionId;

    if (!predictionIdToPoll) {
      if (!prompt) {
        return res.status(400).json({ error: "Brak promptu graficznego." });
      }

      // 1. Utworzenie predykcji
      const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${replicateToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: {
            prompt: `${prompt}, strictly pure black and white line art coloring page, no colors, no color shading, pure colorless line drawing, outlines only, white background, grayscale-free, clean line art`,
            aspect_ratio: "3:4",
            seed: seed ? Number(seed) : undefined,
            num_outputs: 1,
            output_format: "png"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Błąd tworzenia predykcji Replicate: ${errText}`);
      }

      currentPrediction = await response.json();
      predictionIdToPoll = currentPrediction.id;
    }

    // 2. Polling (odpytywanie o status dla max 7 sekund w celu uniknięcia limitu 10s na Vercel)
    let status = currentPrediction ? currentPrediction.status : "starting";
    const startTime = Date.now();
    let consecutiveErrors = 0;

    while (status !== "succeeded" && status !== "failed" && status !== "canceled" && (Date.now() - startTime) < 7000) {
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionIdToPoll}`, {
          headers: {
            "Authorization": `Token ${replicateToken}`
          }
        });

        if (!pollResponse.ok) {
          consecutiveErrors++;
          const errText = await pollResponse.text();
          console.warn(`Transient Replicate polling error (status ${pollResponse.status}, attempt ${consecutiveErrors}/10): ${errText}`);
          if (consecutiveErrors >= 10) {
            throw new Error(`Błąd odpytywania o status Replicate: ${errText}`);
          }
          await new Promise(resolve => setTimeout(resolve, consecutiveErrors * 1000));
          continue;
        }

        consecutiveErrors = 0;
        currentPrediction = await pollResponse.json();
        status = currentPrediction.status;
      } catch (err: any) {
        if (consecutiveErrors >= 10) {
          throw err;
        }
        consecutiveErrors++;
        console.warn(`Transient fetch error during polling (attempt ${consecutiveErrors}/10): ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, consecutiveErrors * 1000));
      }
    }

    if (status === "succeeded") {
      const outputUrl = currentPrediction.output?.[0];
      if (outputUrl) {
        return res.json({ status: "succeeded", output: outputUrl });
      } else {
        throw new Error("Brak linku wyjściowego w udanej predykcji.");
      }
    } else if (status === "failed" || status === "canceled") {
      throw new Error(`Predykcja nie powiodła się. Status: ${status}`);
    } else {
      // Wciąż w trakcie - zwracamy status pending i id sesji do kontynuacji w kolejnym zapytaniu
      return res.json({ status: "pending", predictionId: predictionIdToPoll });
    }

  } catch (error: any) {
    console.error("Error generating image via Replicate:", error);
    res.status(500).json({ error: error.message || "Błąd generowania ilustracji." });
  }
});

// Konfiguracja uruchomieniowa middleware Vite/Express
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
