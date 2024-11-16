import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // 環境変数からAPIキーを取得
const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo"; // 使用するモデル
const MAX_CONTEXT_LENGTH = 5; // コンテキストの最大長を設定
const MAX_TOKENS = 300; // 最大トークン数を設定
const TIMEOUT_MS = 10000; // タイムアウト設定 (5秒)

export const getChatGPTResponse = async (
  userMessage: string,
  previousMessages: { role: string; content: string }[] = []
): Promise<string> => {
  // コンテキストから最新のメッセージのみを抽出（トリミングなし）
  const recentMessages = previousMessages.slice(-MAX_CONTEXT_LENGTH);

  // ユーザーの質問をプロンプト形式で準備
  const prompt = `
You are an AI assistant. Structure your response in plain text with clear formatting hints:
- Start headings with "##" (e.g., ## Introduction to Bitcoin).
- Use "1.", "2.", etc., for numbered lists.
- Use "-" for bullet points.
- Separate paragraphs with a blank line.
- No HTML tags.

Question: ${userMessage}
Provide a clear and styled answer.
  `;

  // メッセージのコンテキストをAPIリクエストに含める
  const messages = [
    ...recentMessages,
    { role: "user", content: prompt }, // 最新の質問を追加
  ];

  try {
    // OpenAI APIリクエスト
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: MODEL,
        messages,
        max_tokens: MAX_TOKENS, // 最大トークン数を設定
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        timeout: TIMEOUT_MS, // タイムアウトを設定
      }
    );

    // API応答のテキストを返す
    return response.data.choices[0].message.content.trim(); // 応答をトリムして返す
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);

    // エラーの種類に応じたメッセージを返す
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return "Request timed out. Please try again.";
      }
      return `API Error: ${error.message}`;
    }

    return "Sorry, something went wrong.";
  }
};
