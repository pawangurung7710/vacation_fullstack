import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { addOnsApi, ApiError } from '../../services/api';
import { AddOnForm, emptyAddOn, formToPayload, recordToForm, type AddOnFormValue } from './AddOnForm';

export function AddOnEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState<AddOnFormValue>(emptyAddOn);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await addOnsApi.getById(id);
        if (active) setValue(recordToForm(data));
      } catch (error) {
        toast.error('Failed to load add-on');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await addOnsApi.update(id, formToPayload(value));
      toast.success('Add-on updated');
      navigate('/cms/add-ons');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update add-on');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-10 flex justify-center">
        <SequoiaLoader label="Loading add-on" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <PageHeader title="Edit Add-on" description="A comfort upgrade or activity that trips can offer at checkout." />
      <AddOnForm
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save changes"
        onCancel={() => navigate('/cms/add-ons')}
      />
    </div>
  );
}
