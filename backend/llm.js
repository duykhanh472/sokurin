import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we have API keys configured
const hasGemini = !!process.env.GEMINI_API_KEY;
const hasOpenAI = !!process.env.OPENAI_API_KEY;

let geminiClient = null;
let openaiClient = null;

if (hasGemini) {
  console.log('✨ LLM Engine: Google Gemini API key detected and initialized.');
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

if (hasOpenAI) {
  console.log('✨ LLM Engine: OpenAI API key detected and initialized.');
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

if (!hasGemini && !hasOpenAI) {
  console.warn('⚠️  LLM Engine: No Gemini or OpenAI API keys found in environmental variables or .env file.');
  console.warn('⚠️  SocratesLink will run in fallback "Local Socratic Mock Engine" mode.');
}

/**
 * Returns a Socratic response using either Gemini, OpenAI, or a highly detailed Mock Fallback.
 * @param {string} topic The topic of discussion
 * @param {Array<{role: string, content: string}>} chatHistory The conversation history
 */
export async function getSocraticResponse(topic, chatHistory) {
  const systemPrompt = `You are the SocratesLink Engine, an elite professor embodying the pure Socratic Method, communicating exclusively in Japanese.
The student wants to learn about the following topic: "${topic}".

YOUR INTERNAL PROCESS (HIDDEN FROM USER):
1. Based on your vast knowledge base, instantly formulate the definitive, accurate answer/solution for this topic. Use this covert knowledge as your absolute compass for this session.
2. Break down this knowledge into logical, bite-sized conceptual steps.

CRITICAL CONSTRAINTS (JAPANESE CONTEXT):
- ユーザーに対して、答え、定義、公式、または解決策を直接提示することは絶対にしないでください。
- ユーザーから直接答えを求められた場合は、丁寧にお断りし、代わりに気づきを促す問いかけを行ってください。
- 思考を促すオープンエンドな（自由に答えられる）質問を、一度に「1つだけ」投げかけてください。一歩一歩導くことが重要です。
- もしユーザーが他のAIからコピーしたような教科書通りの回答をしてきた場合は、「それをあなた自身の言葉で説明するとどうなりますか？」や「具体的な例を挙げられますか？」といった形で、深く考えさせてください。
- ユーザーが自分自身の力で核心となる概念を言葉にできた時のみ、その達成を温かく褒め称え、これまでの学びのプロセスを総括（要約）してください。
- 終始、丁寧で知的なトーン（です・ます調）を維持してください。`;

  // 1. Google Gemini SDK Integration
  if (hasGemini && geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: systemPrompt,
      });

      // Format chat history for Gemini:
      // Roles must alternate between 'user' and 'model'
      const contents = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const result = await model.generateContent({ contents });
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error('❌ Gemini LLM Integration Error, falling back to OpenAI or Local Mock:', err.message);
      if (!hasOpenAI) {
        return handleLocalSocraticFallback(topic, chatHistory);
      }
    }
  }

  // 2. OpenAI SDK Integration
  if (hasOpenAI && openaiClient) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      ];

      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch (err) {
      console.error('❌ OpenAI LLM Integration Error, falling back to Local Mock:', err.message);
      return handleLocalSocraticFallback(topic, chatHistory);
    }
  }

  // 3. Fallback Smart Socratic Mock Engine
  return handleLocalSocraticFallback(topic, chatHistory);
}

/**
 * Handles generating Socratic responses locally when no API keys are present or all APIs fail.
 * Inspects keywords in the student's latest response and challenges them properly.
 */
function handleLocalSocraticFallback(topic, chatHistory) {
  const lastMessage = chatHistory[chatHistory.length - 1]?.content || '';
  const text = lastMessage.toLowerCase();

  // Smartly auto-determine secret target goal based on topic keywords for realistic offline mock
  let targetGoal = '主要な概念';
  const cleanTopic = topic.toLowerCase();
  if (cleanTopic.includes('pythagorean') || cleanTopic.includes('triangle')) {
    targetGoal = 'a^2 + b^2 = c^2';
  } else if (cleanTopic.includes('photosynthesis')) {
    targetGoal = '植物は水、二酸化炭素、太陽光を、ブドウ糖と酸素に変換します';
  } else if (cleanTopic.includes('sky') && cleanTopic.includes('blue')) {
    targetGoal = '太陽光は大気中のガスによってあらゆる方向に散乱し、青色光は波長が小さいため、より多く散乱します';
  }

  // Simple delayed response to simulate AI processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // 0. Check if this is the virtual initial prompt
      if (text.includes('let us start our discussion')) {
        resolve(`こんにちは！私はあなたのソクラテス的ガイドです。本日は、「${topic}」という概念について、一緒に学んでいきましょう。まず最初に、このテーマに関するあなたの現在の理解は何でしょうか？または、あなた自身の言葉でどのように説明しますか？`);
        return;
      }

      // 1. Check if user is asking for the answer directly
      if (
        text.includes('what is the answer') ||
        text.includes('tell me') ||
        text.includes('give me the answer') ||
        text.includes('formula') ||
        text.includes('i don\'t know') ||
        text.includes('what is it')
      ) {
        resolve(`「${topic}」に関する直接的な答えを求めたいというお気持ちは理解できます。しかし、真の理解は発見の中から生まれるものです。では、この質問をさせてください：もしあなた自身の言葉でこれを説明しなければならないとしたら、どこから始めますか？ここでの核心的なパズルは何だと思いますか？`);
        return;
      }

      // 2. Check if student mentions part of the target goal (Warm success / validation)
      const cleanGoal = targetGoal.toLowerCase().trim();
      const goalWords = cleanGoal.split(/\s+/).filter(w => w.length > 3);
      let matches = 0;
      for (const word of goalWords) {
        if (text.includes(word)) {
          matches++;
        }
      }

      const isDirectMatch = text.includes(cleanGoal) || (text.includes('a^2') && text.includes('b^2') && text.includes('c^2'));
      const isWordMatch = goalWords.length > 0 && matches >= Math.ceil(goalWords.length * 0.6);

      if (isDirectMatch || isWordMatch) {
        resolve(`🎉 素晴らしい！あなたは概念を完璧に自分の言葉で説明することができました！「${topic}」というテーマに関して、あなたは次の真実を自分自身の力で発見しました：${targetGoal}。このような段階的な気づきに到達した時の感覚は、いかがでしょうか？`);
        return;
      }

      // 3. Challenge standard statements
      if (text.length < 20) {
        resolve(`あなたは「${lastMessage}」と言っていますね。それは良いスタートです。ただ、もう少し詳しく説明していただけますか？あなたのその考え方と、「${topic}」という学習目標の間に、具体的にどのような関連性があると思いますか？`);
      } else {
        resolve(`興味深い視点ですね！あなたは「${topic}」に関する詳しい内容について触れられました。もしこの概念を10歳の子どもに、現実世界の例えを使って説明するとしたら、どのように説明しますか？`);
      }
    }, 800);
  });
}
