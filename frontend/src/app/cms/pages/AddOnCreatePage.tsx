import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { addOnsApi, ApiError } from '../../services/api';
import { AddOnForm, emptyAddOn, formToPayload, type AddOnFormValue } from './AddOnForm';

export function AddOnCreatePage() {
  const navigate = useNavigate();
  const [value, setValue] = useState<AddOnFormValue>(emptyAddOn);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addOnsApi.create(formToPayload(value));
      toast.success('Add-on created');
      navigate('/cms/add-ons');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create add-on');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-4">
      <PageHeader title="New Add-on" description="A comfort upgrade or activity that trips can offer at checkout." />
      <AddOnForm
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Create Add-on"
        onCancel={() => navigate('/cms/add-ons')}
      />
    </div>
  );
}
