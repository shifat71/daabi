import IssueDetailPage from '../../components/IssueDetailPage';

export default async function IssueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IssueDetailPage issueId={id} />;
}
