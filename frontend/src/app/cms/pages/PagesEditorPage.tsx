import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export function PagesEditorPage() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/70 bg-white p-6">
              <div>
                <div className="font-semibold">Homepage</div>
                <div className="text-sm text-muted-foreground">Public route: /</div>
              </div>
              <Button asChild variant="outline">
                <Link to="/cms/pages/homepage">Edit</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/70 bg-white p-6">
              <div>
                <div className="font-semibold">Careers & Partnerships</div>
                <div className="text-sm text-muted-foreground">Public route: /about/careers-partnerships</div>
              </div>
              <Button asChild variant="outline">
                <Link to="/cms/pages/careers-partnerships">Edit</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
