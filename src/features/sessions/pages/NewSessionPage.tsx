import { NewSessionDialog } from '../components/NewSessionDialog';
import { pageContainer } from './NewSessionPage.css';

export function NewSessionPage() {
  return (
    <div className={pageContainer}>
      <NewSessionDialog />
    </div>
  );
}
