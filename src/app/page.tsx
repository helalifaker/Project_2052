import { redirect } from "next/navigation";

/**
 * Root page - redirects to the Analytics Dashboard
 *
 * The Analytics Dashboard serves as the main landing page
 * providing comprehensive insights across all proposals.
 */
export default function Home() {
  redirect("/dashboard");
}
