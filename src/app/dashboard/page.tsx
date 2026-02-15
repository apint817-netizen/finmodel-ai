import { getProjects } from '@/app/actions/project';
import { DashboardClient } from '@/components/DashboardClient';

export default async function DashboardPage() {
    const projects = await getProjects();

    return (
        <DashboardClient initialProjects={projects} />
    );
}
