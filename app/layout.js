import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { dark } from "@clerk/themes";
import ShaderBackground from "@/components/BackGround";
import { Toaster } from "sonner";
import "../app/globals.css";
import Script from 'next/script';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const balooC = localFont({
  src: "./fonts/BalooChettan-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-baloo",
  display: "swap",
});

export const metadata = {
  title: "E-COMPARE",
  description: "search engine for the lazada and shopee",
};

const vagRounded = localFont({
  src: [
    {
      path: "./fonts/VAG Rounded Next Light.ttf",
      weight: "300",
      style: "light",
    },

    {
      path: "./fonts/VAG Rounded Next Regular.ttf",
      weight: "400",
      style: "normal",
    },

    {
      path: "./fonts/VAG Rounded Next Medium.ttf",
      weight: "400",
      style: "medium",
    },
    {
      path: "./fonts/VAG Rounded Next SemiBold.ttf",
      weight: "600",
      style: "semibold",
    },

    {
      path: "./fonts/VAG Rounded Next Bold.ttf",
      weight: "700",
      style: "bold",
    },
    {
      path: "./fonts/VAG Rounded Next Black.ttf",
      weight: "900",
      style: "black",
    },
  ],
  variable: "--font-vag-rounded",
  display: "swap",
});

export default function RootLayout({ children }) {
  const customAppearance = {
    baseTheme: dark,
  };
  return (
    <>
      <ShaderBackground />
      <ClerkProvider
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignOutUrl="/sign-in"
        appearance={customAppearance}
      >
        <html lang="en" className={`${balooC.variable} ${vagRounded.variable}`}>
          <head>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7611260688391260"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          </head>
          <body className="font-sans">{children}</body>
        </html>
        <Toaster />
      </ClerkProvider>
    </>
  );
}
