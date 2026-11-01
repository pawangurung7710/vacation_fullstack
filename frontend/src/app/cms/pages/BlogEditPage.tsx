import { useParams } from 'react-router-dom';
import { BlogEditor } from './BlogEditor';

export function BlogEditPage() {
  const { id } = useParams();

  if (!id) return null;

  return <BlogEditor mode="edit" postId={id} />;
}
