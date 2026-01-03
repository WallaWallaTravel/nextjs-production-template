import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Welcome Back</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Signed in as <span className="font-medium">{user.email}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Stats</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your dashboard content here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent activity.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
