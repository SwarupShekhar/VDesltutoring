import { listInternalLinks } from "@/actions/internal-links";
import InternalLinksClient from "./InternalLinksClient";

export const dynamic = 'force-dynamic';

export default async function AdminInternalLinksPage() {
    const links = await listInternalLinks();

    return (
        <InternalLinksClient initialLinks={links as any} />
    );
}
