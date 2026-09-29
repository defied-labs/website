"use client";

import React, {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

type StepIndicatorRenderProps = {
  step: number;
  currentStep: number;
  onStepClick: (step: number) => void;
};

type StepperProps = {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: StepIndicatorRenderProps) => ReactNode;
  className?: string;
};

export function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  stepCircleContainerClassName,
  stepContainerClassName,
  contentClassName,
  footerClassName,
  backButtonProps,
  nextButtonProps,
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator,
  className,
}: StepperProps) {
  const steps = Children.toArray(children);
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState(
    Math.min(Math.max(initialStep, 1), totalSteps),
  );
  const [direction, setDirection] = useState(0);
  const isLastStep = currentStep === totalSteps;

  function updateStep(nextStep: number) {
    setCurrentStep(nextStep);
    onStepChange(nextStep);
  }

  function handleStepClick(step: number) {
    if (step === currentStep || disableStepIndicators) return;
    setDirection(step > currentStep ? 1 : -1);
    updateStep(step);
  }

  function handleBack() {
    if (currentStep === 1) return;
    setDirection(-1);
    updateStep(currentStep - 1);
  }

  function handleNext() {
    if (isLastStep) return;
    setDirection(1);
    updateStep(currentStep + 1);
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "rounded-lg border bg-background shadow-sm",
          stepCircleContainerClassName,
        )}
      >
        <div
          className={cn(
            "flex w-full items-center px-4 py-5 sm:px-6",
            stepContainerClassName,
          )}
        >
          {steps.map((_, index) => {
            const step = index + 1;
            return (
              <React.Fragment key={step}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step,
                    currentStep,
                    onStepClick: handleStepClick,
                  })
                ) : (
                  <DefaultStepIndicator
                    step={step}
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                    disabled={disableStepIndicators}
                  />
                )}
                {step < totalSteps && (
                  <StepConnector isComplete={currentStep > step} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          currentStep={currentStep}
          direction={direction}
          className={contentClassName}
        >
          {steps[currentStep - 1]}
        </StepContentWrapper>

        <div
          className={cn("flex justify-end px-4 pb-5 sm:px-6", footerClassName)}
        >
          <div
            className={cn(
              "flex w-full",
              currentStep === 1 ? "justify-end" : "justify-between",
            )}
          >
            {currentStep > 1 && (
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={handleBack}
                {...backButtonProps}
              >
                {backButtonText}
              </button>
            )}
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={handleNext}
              {...nextButtonProps}
            >
              {isLastStep ? "Complete" : nextButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContentWrapper({
  currentStep,
  direction,
  children,
  className,
}: {
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}) {
  const [height, setHeight] = useState<number | "auto">("auto");

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      animate={{ height }}
      transition={{ type: "spring", duration: 0.4 }}
    >
      <AnimatePresence
        initial={false}
        mode="sync"
        custom={direction}
        onExitComplete={() => setHeight("auto")}
      >
        <SlideTransition
          key={currentStep}
          direction={direction}
          onHeightReady={setHeight}
        >
          {children}
        </SlideTransition>
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      className="w-full"
      custom={direction}
      variants={{
        enter: (value: number) => ({
          x: value >= 0 ? "-100%" : "100%",
          opacity: 0,
        }),
        center: { x: "0%", opacity: 1 },
        exit: (value: number) => ({
          x: value >= 0 ? "50%" : "-50%",
          opacity: 0,
        }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

function DefaultStepIndicator({
  step,
  currentStep,
  onStepClick,
  disabled,
}: StepIndicatorRenderProps & { disabled: boolean }) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
        ? "inactive"
        : "complete";

  return (
    <button
      type="button"
      aria-label={`Go to step ${step}`}
      aria-current={status === "active" ? "step" : undefined}
      disabled={disabled || status === "active"}
      onClick={() => onStepClick(step)}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
        status === "active" &&
          "bg-primary text-primary-foreground ring-4 ring-primary/15",
        status === "complete" && "bg-primary text-primary-foreground",
        status === "inactive" &&
          "border border-border bg-background text-muted-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {status === "complete" ? (
        <CheckIcon />
      ) : status === "active" ? (
        <span className="h-3 w-3 rounded-full bg-primary-foreground" />
      ) : (
        step
      )}
    </button>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-border">
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary"
        initial={false}
        animate={{ width: isComplete ? "100%" : "0%" }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return <div className="px-4 pb-2 sm:px-6">{children}</div>;
}
