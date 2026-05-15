import "./globals.css";

export const metadata = {
  title: "BobWatch",
  description: "AI-powered code analysis tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Made with Bob
