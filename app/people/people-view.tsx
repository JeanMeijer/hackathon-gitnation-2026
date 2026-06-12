"use client";

import { useState } from "react";
import {
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-layout";
import ContactsView from "../contacts/contacts-view";
import InvitesView from "../invites/invites-view";
import styles from "./people.module.css";

export default function PeopleView() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full pt-2">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <TabStrip
          className={styles.tabs}
          selected={activeTab}
          tabAlignment="stretched"
          animation={false}
          onSelect={(event: TabStripSelectEventArguments) =>
            setActiveTab(event.selected)
          }
        >
          <TabStripTab title="Invites">
            <InvitesView />
          </TabStripTab>
          <TabStripTab title="Contacts">
            <ContactsView onOpenInvites={() => setActiveTab(0)} />
          </TabStripTab>
        </TabStrip>
      </div>
    </main>
  );
}
