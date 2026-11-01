import { useState, useEffect } from 'react';
import { teamApi } from '../services/api';

export interface TeamMember {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  expertise?: string[];
  order?: number;
  isActive?: boolean;
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await teamApi.getAll({ isActive: true });
        // Transform API data
        const transformedMembers = data.map((member: any) => ({
          ...member,
          id: member._id || member.id,
        }));
        // Sort by order if available
        transformedMembers.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMembers(transformedMembers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch team members'));
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return { members, loading, error };
}
