"use client";
import React from "react";
import { Container } from "../container";
import { Badge } from "../badge";
import { SubHeading } from "../subheading";
import { SectionHeading } from "../seciton-heading";
import { Card, CardDescription, CardTitle } from "./card";
import {
  BrainIcon,
  FingerprintIcon,
  MouseBoxIcon,
  NativeIcon,
  RealtimeSyncIcon,
  SDKIcon,
} from "@/icons/bento-icons";
import {
  LLMModelSelectorSkeleton,
  NativeToolsIntegrationSkeleton,
  TextToWorkflowBuilderSkeleton,
} from "./skeletons";

type Tab = {
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  id: string;
};

export const AgenticIntelligence = () => {
  return (
    <Container className="border-divide border-x">
      <div className="flex flex-col items-center py-16">
        <Badge text="Features" />
        <SectionHeading className="mt-4">
          Built for Agentic Intelligence
        </SectionHeading>

        <SubHeading as="p" className="mx-auto mt-6 max-w-lg px-2">
          Build, test and deploy AI agents with a powerful visual interface
          designed for technical teams
        </SubHeading>
        <div className="border-divide divide-divide mt-16 grid grid-cols-1 divide-y border-y md:grid-cols-2 md:divide-x">
          <Card className="overflow-hidden mask-b-from-80%">
            <div className="flex items-center gap-2">
              <BrainIcon />
              <CardTitle>LLM Model Selector</CardTitle>
            </div>
            <CardDescription>
              Track real-time activity of agents with detailed records of
              triggers, tools used, outcomes, and timestamps.
            </CardDescription>
            <LLMModelSelectorSkeleton />
          </Card>
          <Card className="overflow-hidden mask-b-from-80%">
            <div className="flex items-center gap-2">
              <MouseBoxIcon />
              <CardTitle>Text to workflow builder</CardTitle>
            </div>
            <CardDescription>
              Preview and debug workflow logic in a safe sandbox before
              deploying, helping you iterate with confidence.
            </CardDescription>
            <TextToWorkflowBuilderSkeleton />
          </Card>
        </div>
        <div className="w-full">
          <Card className="relative w-full max-w-none overflow-hidden">
            <div className="pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(var(--color-dots)_1px,transparent_1px)] mask-radial-from-10% [background-size:10px_10px]"></div>
            <div className="flex items-center gap-2">
              <NativeIcon />
              <CardTitle>Native Tools Integration</CardTitle>
            </div>
            <CardDescription>
              Track real-time activity of agents with detailed records of
              triggers, tools used, outcomes, and timestamps.
            </CardDescription>
            <NativeToolsIntegrationSkeleton />
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-2">
              <FingerprintIcon />
              <CardTitle>One Click Auth</CardTitle>
            </div>
            <CardDescription>
              A drag-and-drop interface to create, connect, and configure agents
              into logical workflows
            </CardDescription>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <RealtimeSyncIcon />
              <CardTitle>Realtime Sync</CardTitle>
            </div>
            <CardDescription>
              Agents operate independently and coordinate tasks to complete
              complex all goals
            </CardDescription>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <SDKIcon />
              <CardTitle>Custom Connector SDK</CardTitle>
            </div>
            <CardDescription>
              Run agent workflows in a sandbox to preview behavior, debug logic,
              and test interactions
            </CardDescription>
          </Card>
        </div>
      </div>
    </Container>
  );
};
