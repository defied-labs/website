import { IconCircleCheck } from "@tabler/icons-react";
import { Terminal, TerminalLine } from "@/components/ui/terminal";
import SectionTitle from "@/components/home/SectionTitle";

function StartSection() {
  return (
    <section className="grid lg:grid-cols-2 items-center justify-between gap-4 py-16 dark:bg-primary/10 bg-primary/10 min-h-[50dvh] h-fit lg:w-[60%] w-full mx-auto rounded-2xl lg:px-20 px-8 my-12">
      <div className="">
        <SectionTitle>
          <span>// Where we started</span>
          <span>Built in the open, by people who believed in it</span>
        </SectionTitle>

        <p className="mt-4 text-lg text-muted-foreground sm:text-lg">
          Defied was founded by a handful of engineers contributing to open
          source on nights and weekends. We shipped libraries, not pitch decks.
          That ethos — transparent, peer-reviewed, community-tested code — is
          still the foundation everything we build stands on.
        </p>

        <ul className="mt-6 list-none text-lg text-muted-foreground sm:text-lg">
          <li className="flex items-center gap-2">
            <IconCircleCheck className="text-primary" /> 40+ maintained
            repositories
          </li>
          <li className="flex items-center gap-2">
            <IconCircleCheck className="text-primary" /> Community-reviewed, no
            black boxes
          </li>
          <li className="flex items-center gap-2">
            <IconCircleCheck className="text-primary" /> Zero-cost licenses
            still in active use
          </li>
        </ul>
      </div>
      <div className="w-full">
        <Terminal>
          <TerminalLine>
            <span className="text-muted-foreground">
              user@defied:~$ git clone{" "}
              <span className="text-blue-500">
                https://github.com/defied/core
              </span>
            </span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-muted-foreground">
              Cloning into 'core'...
            </span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-blue-500">license: MIT</span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-muted-foreground">contributors: 214</span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-green-500 animate-pulse">
              status: still shipping ✓
            </span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-muted-foreground">
              user@defied:~$ <span className="animate-ping">|</span>
            </span>
          </TerminalLine>
        </Terminal>
      </div>
    </section>
  );
}

export default StartSection;
