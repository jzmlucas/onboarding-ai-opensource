"use client";

import { useParams } from "next/navigation";
import { OnboardingWorkspace } from "@/components/OnboardingWorkspace";

export default function OnboardingDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <main><OnboardingWorkspace key={id} onboardingId={id} /></main>;
}
