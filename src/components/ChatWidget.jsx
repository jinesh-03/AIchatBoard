"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  Sparkles,
  Bot,
  Send,
  Zap,
  Globe,
  Code,
  Image,
  Music,
  Star,
  TrendingUp,
  Clock,
  X,
  ChevronRight,
  Lightbulb,
  History,
  Hash,
  Filter,
} from "lucide-react";

// Widget 1: Enhanced AI Search Widget with Suggestions
function SearchWidget() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history
  const saveToHistory = (searchTerm) => {
    const updated = [
      searchTerm,
      ...searchHistory.filter((s) => s !== searchTerm),
    ].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  // Generate AI suggestions based on query
  const generateSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate 5 search suggestions for: "${searchQuery}". Return only the suggestions as a comma-separated list, no other text.`,
            },
          ],
        }),
      });
      const data = await response.json();

      if (data.content) {
        const suggestionsList = data.content
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        setSuggestions(suggestionsList);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
      const fallbackSuggestions = [
        `${searchQuery} meaning`,
        `${searchQuery} examples`,
        `${searchQuery} tutorial`,
        `${searchQuery} explained`,
        `${searchQuery} benefits`,
      ];
      setSuggestions(fallbackSuggestions);
      setShowSuggestions(true);
    }
  };

  // Debounce suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        generateSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchTerm = query.trim();
    saveToHistory(searchTerm);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    setIsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Search: ${searchTerm}` }],
        }),
      });
      const data = await response.json();
      setResult(data.content);
    } catch (error) {
      setResult("❌ Error fetching results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSearch(fakeEvent);
    }, 100);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Popular search categories
  const popularSearches = [
    { icon: Code, label: "Programming", color: "from-blue-500 to-cyan-500" },
    { icon: Globe, label: "Science", color: "from-green-500 to-emerald-500" },
    { icon: Lightbulb, label: "Ideas", color: "from-yellow-500 to-orange-500" },
    { icon: Hash, label: "Tech", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Search className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">AI Search</h3>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hidden sm:inline-block">
          ⚡ AI-Powered
        </span>
      </div>

      {/* Search Input with Suggestions */}
      <div className="relative" ref={suggestionsRef}>
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.length >= 2) setShowSuggestions(true);
              }}
              placeholder="Search anything with AI..."
              className="w-full px-4 py-3 border text-black placeholder:text-gray-500 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="sm:hidden">Search</span>
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-2.5 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors ${
                  selectedIndex === index ? "bg-purple-50" : ""
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 ${selectedIndex === index ? "text-purple-600" : "text-gray-400"}`}
                />
                <span className="text-sm text-gray-800 flex-1">
                  {suggestion}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Categories */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {popularSearches.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setQuery(item.label);
              setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} };
                handleSearch(fakeEvent);
              }, 100);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${item.color} text-white hover:scale-105 transition-transform active:scale-95`}
          >
            <item.icon className="w-3 h-3" />
            {item.label}
          </button>
        ))}
        <button
          onClick={() => {
            const randomSearches = [
              "AI trends 2026",
              "machine learning basics",
              "future technology",
              "data science",
            ];
            const random =
              randomSearches[Math.floor(Math.random() * randomSearches.length)];
            setQuery(random);
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} };
              handleSearch(fakeEvent);
            }, 100);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:scale-105 transition-transform active:scale-95"
        >
          <TrendingUp className="w-3 h-3" />
          Random
        </button>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Recent Searches</span>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {searchHistory.slice(0, 5).map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(item);
                  setTimeout(() => {
                    const fakeEvent = { preventDefault: () => {} };
                    handleSearch(fakeEvent);
                  }, 100);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors flex items-center gap-1 active:scale-95"
              >
                <History className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {item.length > 20 ? item.substring(0, 20) + "..." : item}
                </span>
                <span className="sm:hidden">
                  {item.length > 12 ? item.substring(0, 12) + "..." : item}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Result */}
      {result && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Widget 2: Mini Chat Bubble
function MiniChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Mini Chat</h3>
        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hidden sm:inline-block">
          Compact
        </span>
      </div>

      <div className="relative h-[300px] sm:h-[400px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center text-white active:scale-95"
          >
            <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        )}

        {isOpen && (
          <div className="absolute inset-0 bg-white flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 text-white flex justify-between items-center">
              <span className="font-semibold">Quick Chat</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-2"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${msg.role === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[85%] sm:max-w-[75%] ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white ml-auto"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <Loader2 className="animate-spin mx-auto text-purple-600" />
              )}
            </div>
            <form
              onSubmit={handleSend}
              className="p-2 sm:p-3 border-t flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Widget 3: Quick Actions
function QuickActionsWidget() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const actions = [
    {
      icon: Zap,
      label: "Summarize",
      prompt: "Summarize this: AI is transforming the world...",
    },
    { icon: Globe, label: "Translate", prompt: 'Translate "Hello" to Spanish' },
    {
      icon: Code,
      label: "Code",
      prompt: "Write a function to add two numbers in Python",
    },
    {
      icon: Image,
      label: "Describe",
      prompt: "Describe a sunset over the ocean",
    },
    { icon: Music, label: "Recommend", prompt: "Recommend 5 jazz songs" },
    {
      icon: Star,
      label: "Explain",
      prompt: "Explain quantum computing simply",
    },
  ];

  const handleAction = async (prompt) => {
    setIsLoading(true);
    setResponse("");
    try {
      const response = await fetch("/.netlify/functions/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      setResponse(data.content);
    } catch (error) {
      setResponse("❌ Error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hidden sm:inline-block">
          One-click
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action.prompt)}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 active:scale-95"
          >
            <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {(response || isLoading) && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-green-600" />
              <span className="text-sm text-gray-600">Processing...</span>
            </div>
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {response}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Widget 4: AI Assistant Card
function AssistantCard() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      setResponse(data.content);
    } catch (error) {
      setResponse("❌ Error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">AI Assistant</h3>
        <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hidden sm:inline-block">
          Smart
        </span>
      </div>

      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 px-4 py-2 border text-black placeholder:text-gray-500 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Ask"}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {response}
          </p>
        </div>
      )}
    </div>
  );
}

// Main Widgets Page Component
export default function WidgetsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          AI Widgets
        </h2>
        <p className="text-sm sm:text-base text-gray-500">
          Choose from multiple AI-powered widgets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SearchWidget />
        <MiniChatWidget />
        <AssistantCard />
      </div>
    </div>
  );
}
