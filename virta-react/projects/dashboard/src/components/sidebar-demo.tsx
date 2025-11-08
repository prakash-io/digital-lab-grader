"use client";

import React, { useState } from "react";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { HoverEffect } from "@/components/ui/card-hover-effect";

import {

  IconArrowLeft,

  IconBrandTabler,

  IconSettings,

  IconUserBolt,

  IconTrophy,

  IconChartLine,

  IconShoppingBag,

  IconFileText,

  IconCode,

  IconChartBar,

} from "@tabler/icons-react";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";



export default function SidebarDemo() {

  const links = [

    {

      label: "Dashboard",

      href: "#",

      icon: (

        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />

      ),

    },

    

    {

      label: "Store",

      href: "#",

      icon: (

        <IconShoppingBag className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />

      ),

    },

    

    {

      label: "Settings",

      href: "#",

      icon: (

        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />

      ),

    },

    {

      label: "Logout",

      href: "#",

      icon: (

        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />

      ),

    },

  ];

  const [open, setOpen] = useState(false);

  return (

    <div

      className={cn(

        "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",

        "h-screen", // Changed from h-[60vh] to h-screen for full height

      )}

    >

      <Sidebar open={open} setOpen={setOpen}>

        <SidebarBody className="justify-between gap-10">

          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">

            {open ? <Logo /> : <LogoIcon />}

            <div className="mt-8 flex flex-col gap-2">

              {links.map((link, idx) => (

                <SidebarLink key={idx} link={link} />

              ))}

            </div>

          </div>

          <div>

            <SidebarLink

              link={{

                label: "Prakash Kumar",

                href: "#",

                icon: (

                  <img

                    src="https://assets.aceternity.com/manu.png"

                    className="h-7 w-7 shrink-0 rounded-full"

                    width={50}

                    height={50}

                    alt="Avatar"

                  />

                ),

              }}

            />

          </div>

        </SidebarBody>

      </Sidebar>

      <Dashboard />

    </div>

  );

}

export const Logo = () => {

  return (

    <a

      href="#"

      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"

    >

      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />

      <motion.span

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        className="font-medium whitespace-pre text-black dark:text-white text-xl tracking-wider"

      >

        VirTA

      </motion.span>

    </a>

  );

};

export const LogoIcon = () => {

  return (

    <a

      href="#"

      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"

    >

      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />

    </a>

  );

};



// Dashboard cards data
const dashboardCards = [
  {
    title: "Assignment",
    description:
      "View and manage your assignments. Submit your work, track deadlines, and check feedback from instructors.",
    link: "#",
    icon: <IconFileText className="w-12 h-12" />,
  },
  {
    title: "Code Editor",
    description:
      "Write, edit, and test your code in a powerful online IDE. Supports multiple programming languages with syntax highlighting and debugging tools.",
    link: "#",
    icon: <IconCode className="w-12 h-12" />,
  },
  {
    title: "Leaderboard",
    description:
      "See where you rank among your peers. Track your progress and compete with others in various challenges and competitions.",
    link: "#",
    icon: <IconTrophy className="w-12 h-12" />,
  },
  {
    title: "Analytics",
    description:
      "View detailed analytics about your performance, learning progress, and activity statistics. Understand your strengths and areas for improvement.",
    link: "#",
    icon: <IconChartBar className="w-12 h-12" />,
  },
];

// Dashboard component with content
const Dashboard = () => {
  const firstName = "Prakash"; // Extracted from "Prakash Kumar"

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header section aligned with sidebar logo */}
        <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-6 md:px-10 md:pt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-300 dark:text-purple-200">
            Welcome <span className="text-purple-400 dark:text-purple-300">{firstName}</span>!
          </h1>
        </div>

        {/* Body section with lighter background */}
        <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
          <HoverEffect items={dashboardCards} className="py-4" />
        </div>
      </div>
    </div>
  );
};
