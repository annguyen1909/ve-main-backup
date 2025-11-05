import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TeamSection } from "~/components/team-section";
import { Api } from "~/lib/api";

export async function loader({ params }: LoaderFunctionArgs) {
  const api = new Api();
  const locale = params.locale ?? 'en';
  const teams = await api.getEmployees(locale).then(res => res.data.data);

  return {
    teams
  }
}

export default function Career() {
  const { teams } = useLoaderData<typeof loader>();

  return <TeamSection teams={teams} />
}