import { useParams } from 'react-router';

export function JoinSessionPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Join Session: {id}</h1>
    </div>
  );
}
