import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandXFilled,
} from "@tabler/icons-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-background px-10 pt-14 pb-8 w-full">
      <div className="w-full flex justify-evenly">
        <div className="flex flex-col gap-2 items-start">
          <h1 className="text-xl font-bold">Defied</h1>
          <p className="text-sm text-muted-foreground font-medium">
            From ideas to digital reality
          </p>
        </div>
        <div className=""></div>
        <div className="flex gap-5 items-start justify-end text-end">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm">Company</p>
            <Link
              href="#origin"
              className="text-sm text-muted-foreground font-medium"
            >
              Origin
            </Link>
            <Link
              href="#today"
              className="text-sm text-muted-foreground font-medium"
            >
              Today
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm">Work</p>
            <Link
              href="/services"
              className="text-sm text-muted-foreground font-medium"
            >
              Services
            </Link>
            <Link
              href="https://github.com/defied"
              className="text-sm text-muted-foreground font-medium"
            >
              GitHub
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm">Connect</p>
            <Link
              href="mailto:hello@defied.dev"
              className="text-sm text-muted-foreground font-medium"
            >
              Email
            </Link>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-evenly w-full mt-4 pt-4 border-t border-muted-foreground/40">
        <p className="text-sm text-muted-foreground font-medium justify-start">
          © {new Date().getFullYear()} Defied. Built in the open.
        </p>
        <div className=""></div>

        <div className="flex gap-4 mt-4">
          <IconBrandGithubFilled className="text-muted-foreground" />
          <IconBrandXFilled className="text-muted-foreground ml-4" />
          <IconBrandLinkedinFilled className="text-muted-foreground ml-4" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
