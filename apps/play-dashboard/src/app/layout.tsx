import type {Metadata} from "next";
import "./globals.css";
import {ProviderInitializer} from "@/provider/ProviderInitializer";

export const metadata: Metadata = {
  title: "play",
  description: "",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <ProviderInitializer>
      <html lang="en">
      <body>
      {children}
      </body>
      </html>
    </ProviderInitializer>
  );
}
