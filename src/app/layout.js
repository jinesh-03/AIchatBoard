import "./globals.css";

export const metadata = {
  title: "Groq AI App",
  description: "AI-powered chat and widgets using Groq API",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
