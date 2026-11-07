import "./globals.css";

export const metadata = {
  title: "LaundryFlow",
  description:
    "Digital laundry register for college hostels: submit, verify and track laundry.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
