"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { TextBox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { DatePicker } from "@progress/kendo-react-dateinputs";

const tracks = ["React Summit", "JSNation", "TestJS", "DevOps"];

export default function KendoDemo() {
  const [count, setCount] = useState(0);

  return (
    <section className="flex w-full flex-col gap-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        KendoReact demo
      </h2>
      <TextBox placeholder="Your name" />
      <DropDownList data={tracks} defaultValue={tracks[0]} />
      <DatePicker defaultValue={new Date(2026, 5, 11)} />
      <Button themeColor="primary" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </Button>
    </section>
  );
}
