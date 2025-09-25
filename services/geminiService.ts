import { GoogleGenAI, Chat, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY :"AIzaSyAaLSpQjBzjSzAIeT-5xsoXMO2Cm0pzygw"});

let chat: Chat | null = null;

const SYSTEM_INSTRUCTION = `Eres un amigable y eficiente asistente de servicio al cliente para 'QVA-Tienda'. Tu nombre es 'QVA-Bot'. Tu objetivo es ayudar a los clientes con sus pedidos, responder preguntas sobre productos y resolver cualquier problema que puedan tener. Los clientes pueden añadir productos a su carrito de compras usando los botones y luego finalizar la compra. Anímalos a explorar los productos y a usar el carrito. Sé siempre cortés, servicial y claro en tus respuestas. Utiliza un tono positivo y profesional.`;

export function getChatSession(): Chat {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            },
        });
    }
    return chat;
}

export async function sendMessageToAI(message: string) {
    const chatSession = getChatSession();
    try {
        const result = await chatSession.sendMessageStream({ message });
        return result;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        throw new Error("No se pudo comunicar con el asistente de IA. Por favor, inténtelo de nuevo más tarde.");
    }
}

export async function generateProductDetailsFromImage(base64Image: string, mimeType: string): Promise<{ name: string, description: string, category: 'General' | 'Farmacia' }> {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: "Analiza esta imagen de un producto. Proporciona un nombre de producto conciso y comercial, una breve descripción atractiva, y clasifícalo en una de las siguientes categorías: 'General' o 'Farmacia'. Responde únicamente con un objeto JSON que contenga las claves 'name', 'description' y 'category'.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING, enum: ['General', 'Farmacia'] }
                    },
                    propertyOrdering: ["name", "description", "category"],
                    required: ["name", "description", "category"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating product details from image:", error);
        throw new Error("No se pudo analizar la imagen del producto. Por favor, intente con otra imagen.");
    }
}