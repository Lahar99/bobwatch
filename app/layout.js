import "./globals.css";

export const metadata = {
  title: "BobWatch — Trust What Bob Built",
  description: "The safety layer for IBM Bob. See exactly what Bob changed and what it shouldn't have. Built at IBM Bob Hackathon 2026 by One More Prompt.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Made with Bob
