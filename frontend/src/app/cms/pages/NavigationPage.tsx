import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

export function NavigationPage() {
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button onClick={() => {}} style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Navigation Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/80 p-8 text-center">
            <p className="text-sm text-muted-foreground">Navigation tree editor UI (placeholder)</p>
            <p className="text-xs text-muted-foreground mt-2">Add, edit, reorder navigation items</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
