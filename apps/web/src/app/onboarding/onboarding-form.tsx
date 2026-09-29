"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react";

type FormData = {
  displayName: string;
  accountType: string;
  role: string;
  organization: string;
  location: string;
  timezone: string;
  projectDescription: string;
  goals: string;
  technicalNeeds: string;
  budget: string;
  timeline: string;
  skillsAndInterests: string;
};

const initialData: FormData = {
  displayName: "",
  accountType: "",
  role: "",
  organization: "",
  location: "",
  timezone: "",
  projectDescription: "",
  goals: "",
  technicalNeeds: "",
  budget: "",
  timeline: "",
  skillsAndInterests: "",
};

const steps = [
  { title: "A little about you", eyebrow: "01 / 03" },
  { title: "What brings you here?", eyebrow: "02 / 03" },
  { title: "Shape your starting point", eyebrow: "03 / 03" },
];

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (name: keyof FormData, value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </span>
      {multiline ? (
        <textarea
          className={`${className} min-h-28 resize-y`}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          className={className}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
    </label>
  );
}

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (name: keyof FormData, value: string) => {
    setData((current) => ({ ...current, [name]: value }));
  };

  const next = () => {
    if (step === 0 && (!data.displayName || !data.accountType || !data.role)) {
      setError("Complete the required fields before continuing.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = async () => {
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || !result.completed) {
        throw new Error(result.error || "Unable to save your profile.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="bg-primary p-8 text-primary-foreground sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
            Defied open beta
          </p>
          <h1 className="mt-16 max-w-xs text-4xl font-semibold leading-8">
            Let&apos;s make this useful from day one.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 opacity-80">
            A few details help us shape the right starting point for you. You
            can refine them later.
          </p>
          <div className="mt-16 space-y-5">
            {steps.map((item, index) => (
              <div
                key={item.eyebrow}
                className="flex items-center gap-3 text-sm"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full border ${index <= step ? "border-primary-foreground bg-primary-foreground text-primary" : "border-primary-foreground/35 text-primary-foreground/60"}`}
                >
                  {index < step ? <IconCheck className="size-4" /> : index + 1}
                </span>
                <span
                  className={index === step ? "font-semibold" : "opacity-60"}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <section className="p-6 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {steps[step].eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {steps[step].title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Required fields are marked with an asterisk.
          </p>

          <div className="mt-8 space-y-5">
            {step === 0 ? (
              <>
                <Field
                  label="What should we call you?"
                  name="displayName"
                  value={data.displayName}
                  onChange={update}
                  placeholder="Your name"
                  required
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium">
                    I&apos;m here as <span className="text-primary">*</span>
                  </span>
                  <select
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    value={data.accountType}
                    onChange={(event) =>
                      update("accountType", event.target.value)
                    }
                    required
                  >
                    <option value="">Choose one</option>
                    <option value="founder">A founder or business owner</option>
                    <option value="creator">
                      A creator or independent professional
                    </option>
                    <option value="team">Part of a small team</option>
                    <option value="client">
                      Looking for a software partner
                    </option>
                    <option value="exploring">
                      Exploring what&apos;s possible
                    </option>
                  </select>
                </label>
                <Field
                  label="What is your role?"
                  name="role"
                  value={data.role}
                  onChange={update}
                  placeholder="Founder, designer, developer..."
                  required
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Organization or project"
                    name="organization"
                    value={data.organization}
                    onChange={update}
                    placeholder="Optional"
                  />
                  <Field
                    label="Location"
                    name="location"
                    value={data.location}
                    onChange={update}
                    placeholder="City or country"
                  />
                </div>
                <Field
                  label="Timezone"
                  name="timezone"
                  value={data.timezone}
                  onChange={update}
                  placeholder="e.g. Europe/Amsterdam"
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Field
                  label="What are you working on?"
                  name="projectDescription"
                  value={data.projectDescription}
                  onChange={update}
                  placeholder="A product, service, idea, or challenge"
                  multiline
                />
                <Field
                  label="What would make the next few months successful?"
                  name="goals"
                  value={data.goals}
                  onChange={update}
                  placeholder="The outcome you want to move toward"
                  multiline
                />
                <Field
                  label="What technical help or tools do you need?"
                  name="technicalNeeds"
                  value={data.technicalNeeds}
                  onChange={update}
                  placeholder="Optional"
                  multiline
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Expected budget"
                    name="budget"
                    value={data.budget}
                    onChange={update}
                    placeholder="Optional or undecided"
                  />
                  <Field
                    label="Desired timeline"
                    name="timeline"
                    value={data.timeline}
                    onChange={update}
                    placeholder="Optional or undecided"
                  />
                </div>
                <Field
                  label="Skills, interests, or topics"
                  name="skillsAndInterests"
                  value={data.skillsAndInterests}
                  onChange={update}
                  placeholder="What should we keep in mind?"
                  multiline
                />
              </>
            ) : null}
          </div>

          {error ? (
            <p className="mt-5 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0 || saving}
              className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:invisible"
            >
              <IconArrowLeft className="size-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Continue <IconArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? "Saving..." : "Finish setup"}{" "}
                <IconCheck className="size-4" />
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
