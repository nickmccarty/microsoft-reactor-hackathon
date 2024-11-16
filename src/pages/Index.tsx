import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Container,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { getChatGPTResponse } from "@/lib/chatGPT";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Index = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { timeStyle: "short" }),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ一覧を最下部までスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // メッセージが更新されるたびにスクロール

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { timeStyle: "short" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    try {
      const botResponseText = await getChatGPTResponse(
        userInput,
        messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        }))
      );

      const botMessage = {
        id: messages.length + 2,
        text: botResponseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { timeStyle: "short" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error handling message:", error);

      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, something went wrong.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { timeStyle: "short" }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Enterキーでメッセージを送信
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const renderMarkdown = (markdown: string) => {
    return { __html: marked(markdown) };
  };

  return (
    <Container
      maxW="container.md"
      py={4}
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
      height="100vh"
      display="flex"
      flexDirection="column"
    >
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Chatbot
        </Text>
        <IconButton
          aria-label="Toggle Color Mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
      </HStack>
      <VStack
        gap={4}
        align="stretch"
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderRadius="md"
        p={4}
        shadow="md"
        flexGrow={1}
        overflowY="auto"
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            bg={message.isUser ? "blue.500" : colorMode === "light" ? "gray.100" : "gray.700"}
            color={message.isUser ? "white" : colorMode === "light" ? "black" : "white"}
            alignSelf={message.isUser ? "flex-end" : "flex-start"}
            px={4}
            py={2}
            borderRadius="md"
            whiteSpace="pre-wrap"
          >
            <div dangerouslySetInnerHTML={renderMarkdown(message.text)} />
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <HStack mt={4}>
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={handleKeyPress} // Enterキーで送信
        />
        <Button colorScheme="blue" onClick={handleSendMessage}>
          Send
        </Button>
      </HStack>
    </Container>
  );
};

export default Index;
