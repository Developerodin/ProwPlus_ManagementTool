import { redirect } from 'next/navigation';
export default function NewProject() { redirect('/admin/projects?create=1'); }
