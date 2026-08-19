import { IconCircleCheck } from "@tabler/icons-react";
import { Terminal, TerminalLine } from "@/components/ui/terminal";
import SectionTitle from "@/components/home/SectionTitle";

function StartSection() {
  return (
    <section className="grid lg:grid-cols-2 items-center justify-evenly py-16 gap-16 dark:bg-primary/10 bg-primary/10 min-h-[50dvh] h-fit lg:w-[60%] w-full mx-auto rounded-2xl lg:px-20 px-8 my-12">
      <div className="">
        <SectionTitle>
          <span>// Where we started</span>
          <span>
            Built in the <span className="text-primary italic">open</span>, by
            people who believed in it
          </span>
        </SectionTitle>

        <p className="mt-4 text-lg text-muted-foreground sm:text-lg">
          We started as a small group of engineers who wanted to build a better
          way to create software. We believed that the best way to do this was
          to build in the open, and to share our work with the world. We wanted
          to create a community of like-minded individuals who could contribute
          to our projects, and help us build something truly great.
        </p>

        <ul className="mt-6 list-none text-lg text-muted-foreground sm:text-lg">
          <li className="flex items-center gap-2">
            <IconCircleCheck className="text-primary" /> Open-source by default,
            no hidden agendas
          </li>
          <li className="flex items-center gap-2">
            <IconCircleCheck className="text-primary" /> Community-reviewed, no
            black boxes
          </li>
          <li className="flex items-center gap-2">
            <IconCircleCheck className="text-primary" /> MIT licensed, no
            strings attached
          </li>
        </ul>
      </div>
      <div className="w-full">
        <Terminal>
          <TerminalLine>
            <span className="text-muted-foreground">
              user@defied:~$ git clone{" "}
              <span className="text-blue-500">
                https://github.com/defied-labs/core
              </span>
            </span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-muted-foreground">
              Cloning into 'core'...
            </span>
          </TerminalLine>

          <TerminalLine>
            <span className="text-muted-foreground">license: MIT</span>
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
