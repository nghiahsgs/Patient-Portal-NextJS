import { Messages } from '@/components/Messages';
import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore';

function TherapistMessages() {
  const menuItems = getMenuItems('therapist');
  
  return (
    <DashboardLayout title="Messages" menuItems={menuItems}>
      <Messages />
    </DashboardLayout>
  );
}

export default withAuth(TherapistMessages, { requiredRole: 'therapist' });