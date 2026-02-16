import { getProjects } from '@/app/actions/project';
import { DashboardClient } from '@/components/DashboardClient';

export default async function ProjectsDashboardPage() {
    const projects = await getProjects();

    return (
        <DashboardClient initialProjects={projects} />
    );
}
