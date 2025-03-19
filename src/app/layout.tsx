import "@/styles/globals.css";
import "@progress/kendo-theme-default/dist/all.css";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import DrawerContainer from "./_components/Drawer";

export const metadata: Metadata = {
  title: "Version Control With AI",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <TRPCReactProvider>
            <DrawerContainer>
              {children}
            </DrawerContainer>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
