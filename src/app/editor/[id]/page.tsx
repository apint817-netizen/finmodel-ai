import { getProject } from '@/app/actions/project';
import { EditorClient } from '@/components/EditorClient';
import { notFound } from 'next/navigation';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    return (
        <EditorClient initialProject={project} />
    );
}
