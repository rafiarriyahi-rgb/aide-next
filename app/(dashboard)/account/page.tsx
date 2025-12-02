'use client';

import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { userProfile, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Account Information</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Username</label>
            <p className="text-lg text-slate-800 mt-1">{userProfile?.username}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Email Address</label>
            <p className="text-lg text-slate-800 mt-1">{userProfile?.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">User ID</label>
            <p className="text-sm text-slate-600 mt-1 font-mono">{userProfile?.userId}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Settings</h3>
        <p className="text-slate-600 mb-6">More settings options will be available here.</p>

        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
