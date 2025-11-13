import { Editor } from "@/components/editor";
import { cookies } from "next/headers";

export default async function ProjectPage() {
  const layout = (await cookies()).get("react-resizable-panels:layout");

  let defaultLayout;
  if (layout) {
    defaultLayout = JSON.parse(layout.value);
  }
  return <Editor defaultLayout={defaultLayout} />;
}
