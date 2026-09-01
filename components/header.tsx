import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  await checkUser();

  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/pocket-logo.png"}
            alt="Pocket Logo"
            height={60}
            width={200}
            className="h-18 w-auto object-contain"
          />
        </Link>
        <div>
          <header className="flex justify-end items-center gap-4">
            <Show when="signed-out">
              <SignInButton forceRedirectUrl={"/dashboard"}>
                <Button variant="outline">Login</Button>
              </SignInButton>
              {/* <SignUpButton>
              <button className="bg-(--pocket-blue) text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton> */}
            </Show>
            <Show when="signed-in">
              <Link
                href={"/dashboard"}
                className="text-gray-600 hover:text-(--pocket-blue) flex items-center gap-2"
              >
                <Button
                  variant="outline"
                  className="hover:border-(--pocket-blue-soft) hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <Link
                href={"/transaction/create"}
                className="text-gray-600 hover:text-(--pocket-blue) flex items-center gap-2"
              >
                <Button
                  variant="outline"
                  className="hover:border-(--pocket-blue-soft) hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
                >
                  <PenBox size={18} />
                  <span className="hidden md:inline">Add Transaction</span>
                </Button>
              </Link>
              <UserButton />
            </Show>
          </header>
        </div>
      </nav>
    </div>
  );
};

export default Header;
