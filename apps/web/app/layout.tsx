import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Providers from '../components/Providers'

// @ts-ignore: allow importing global CSS without type declarations
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const googleSansCode = localFont({
  src: "./fonts/GoogleSansCode-VariableFont_wght.ttf",
  variable: "--font-google-sans-code",
})

export const metadata: Metadata = {
  title: "Website Q&A - Ask questions about any website",
  description: "Submit a URL and question, get AI-powered answers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${googleSansCode.variable} antialiased`}>
          <header className="w-full bg-blue-100 dark:bg-neutral-900 border-b-zinc-800 border-b-2">
              <nav className="flex max-w-7xl mx-auto items-center justify-between px-6 py-1">
                <div className="">
                  <Link href="/" className="flex items-center gap-3">
                  <svg className="stroke-white  fill-white h-20 w-10" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18px" height="18px" viewBox="0 0 18 18"><path d="M3.025,5.623c.068,.204,.26,.342,.475,.342s.406-.138,.475-.342l.421-1.263,1.263-.421c.204-.068,.342-.259,.342-.474s-.138-.406-.342-.474l-1.263-.421-.421-1.263c-.137-.408-.812-.408-.949,0l-.421,1.263-1.263,.421c-.204,.068-.342,.259-.342,.474s.138,.406,.342,.474l1.263,.421,.421,1.263Z" fill="var(--color-contrast-high)" data-color="color-2"></path><path d="M16.525,8.803l-4.535-1.793-1.793-4.535c-.227-.572-1.168-.572-1.395,0l-1.793,4.535-4.535,1.793c-.286,.113-.475,.39-.475,.697s.188,.584,.475,.697l4.535,1.793,1.793,4.535c.113,.286,.39,.474,.697,.474s.584-.188,.697-.474l1.793-4.535,4.535-1.793c.286-.113,.475-.39,.475-.697s-.188-.584-.475-.697Z" fill="var(--color-contrast-high)"></path></svg>
                  <h2 className="text-2xl font-bold"><span className="font-semibold text-3xl text-zinc-500">Q</span><span className="font-google">.ai</span></h2>
                  </Link>
                </div>  
                {/* Auth Buttons */}
                <div className="flex items-center gap-6">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="px-6 py-4 h-12 w-30 flex items-center justify-between rounded-lg text-md font-google text-black  font-bold dark:hover:text-gray-900 bg-neutral-300 hover:bg-neutral-400 hover:scale-90 transition-transform duration-100 dark:bg-neutral-300 dark:hover:bg-zinc-200  transition-colors duration-200">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-6 py-4 h-12 w-42 text-md flex items-center justify-between font-semibold rounded-lg font-google text-white bg-zinc-700  hover:bg-zinc-700/60 transition-colors shadow-md hover:shadow-lg duration-200">
                        Get Started
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10"
                        }
                      }}
                    />
                  </SignedIn>
                </div>
              </nav>
          </header>
          <Providers>
            {children}
          </Providers>
           {/* Footer */}
      <footer className="border-t border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <p>Demo Purposes Only. Please, Don't raise PRs</p>
          </div>
        </div>
      </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
