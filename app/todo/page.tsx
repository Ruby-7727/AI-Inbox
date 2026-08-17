import { UploadButton } from "@/components/actions/upload-button";
import { Header } from "@/components/layout/header";
import { ReminderList } from "@/components/todo/reminder-list";

export const metadata = { title: "To Do" };

export default function TodoPage() {
  return (
    <>
      <Header
        actions={<UploadButton />}
        description="Tasks and reminders created from your screenshots."
        title="To Do"
      />
      <ReminderList />
    </>
  );
}
