import IssueDetailPage from '../../components/IssueDetailPage';

export default function IssueDetail({ params }: { params: { id: string } }) {
  return <IssueDetailPage issueId={params.id} />;
}
